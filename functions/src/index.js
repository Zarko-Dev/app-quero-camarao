const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

const {
    digitsOnly,
    formatCpf,
    formatPhone11,
    formatPhone10,
    resolveResetPasswordIdentity,
} = require("./resetPasswordHelpers");

admin.initializeApp();

async function findUserRecordsByIdentifier(db, identifier) {
    const cleaned = digitsOnly(identifier);

    if (cleaned.length < 8) {
        return [];
    }

    const cpfValues = [cleaned, formatCpf(cleaned)].filter(Boolean);
    const phoneValues = [cleaned, formatPhone11(cleaned), formatPhone10(cleaned)].filter(Boolean);

    const queries = [
        ...cpfValues.map((value) => db.collection("users").where("cpf", "==", value).get()),
        ...phoneValues.map((value) => db.collection("users").where("phone", "==", value).get()),
    ];

    const snapshots = await Promise.all(queries);
    const seenIds = new Set();
    return snapshots
        .flatMap((snapshot) => snapshot.docs)
        .filter((doc) => {
            if (seenIds.has(doc.id)) {
                return false;
            }

            seenIds.add(doc.id);
            return true;
        })
        .map((doc) => ({ docId: doc.id, userData: doc.data() || {} }));
}

// Valida que a conta existe. Retorna { found: true } ou lança not-found.
exports.getPasswordResetToken = onCall(
    { region: "us-central1", cors: true },
    async (request) => {
        const { identifier } = request.data;

        if (!identifier || typeof identifier !== "string") {
            throw new HttpsError("invalid-argument", "Informe o CPF ou telefone.");
        }

        const userRecords = await findUserRecordsByIdentifier(admin.firestore(), identifier);

        if (userRecords.length === 0) {
            throw new HttpsError("not-found", "Nenhuma conta encontrada com esse CPF ou telefone.");
        }

        return { found: true };
    },
);

// Redefine a senha diretamente via Admin SDK — não requer IAM Credentials API.
exports.resetPasswordByIdentifier = onCall(
    { region: "us-central1", cors: true },
    async (request) => {
        const { identifier, dateBirth, newPassword } = request.data;

        if (
            !identifier
            || typeof identifier !== "string"
            || !dateBirth
            || typeof dateBirth !== "string"
            || !newPassword
        ) {
            throw new HttpsError("invalid-argument", "Dados incompletos.");
        }

        if (newPassword.length < 6) {
            throw new HttpsError("invalid-argument", "Senha deve ter pelo menos 6 caracteres.");
        }

        const userRecords = await findUserRecordsByIdentifier(admin.firestore(), identifier);
        const resolution = resolveResetPasswordIdentity(userRecords, identifier, dateBirth);

        if (resolution.status === "not-found") {
            throw new HttpsError("not-found", "Nenhuma conta encontrada com esse CPF ou telefone.");
        }

        if (resolution.status === "ambiguous") {
            throw new HttpsError(
                "failed-precondition",
                "Existe mais de um cadastro com esse CPF ou telefone.",
            );
        }

        if (resolution.status === "date-mismatch") {
            throw new HttpsError(
                "permission-denied",
                "Data de nascimento não confere com o cadastro.",
            );
        }

        if (resolution.status !== "matched") {
            throw new HttpsError("invalid-argument", "Dados incompletos.");
        }

        const userData = resolution.record.userData || {};
        const email = userData.email || resolution.record.docId;

        if (!email) {
            throw new HttpsError("not-found", "Nenhuma conta encontrada com esse CPF ou telefone.");
        }

        let authUser;
        try {
            authUser = await admin.auth().getUserByEmail(email);
        } catch {
            throw new HttpsError("not-found", "Nenhuma conta encontrada com esse CPF ou telefone.");
        }

        await admin.auth().updateUser(authUser.uid, { password: newPassword });
        return { success: true };
    },
);

const { handlePaymentPix } = require("./paymentPix");
const { handlePaymentWebhook } = require("./paymentWebhook");

exports.paymentpix = onRequest(
    { region: "us-central1", cors: true },
    handlePaymentPix
);

exports.paymentwebhook = onRequest(
    { region: "us-central1", cors: true },
    handlePaymentWebhook
);

const { onRatingWritten } = require("./ratings");

exports.onRatingWritten = onRatingWritten;

const { mondayProducerReminder, tuesdayProducerReminder } = require("./reminders");

exports.mondayProducerReminder = mondayProducerReminder;
exports.tuesdayProducerReminder = tuesdayProducerReminder;

const { adminDashboardMetrics } = require("./adminDashboardMetrics");

exports.adminDashboardMetrics = adminDashboardMetrics;

const { onChatMessageCreated } = require("./chatNotifications");
exports.onChatMessageCreated = onChatMessageCreated;

const { onUserWritten } = require("./users");
exports.onUserWritten = onUserWritten;

const { registerUser } = require("./registerUser");
exports.registerUser = registerUser;

const { reconcileUsers } = require("./reconcileUsers");
exports.reconcileUsers = reconcileUsers;

const { onPublicationViewWritten } = require("./publicationViews");
exports.onPublicationViewWritten = onPublicationViewWritten;

const { cronAbandonedCheckout, cronInactiveUsers } = require("./whatsappAutomations");
exports.cronAbandonedCheckout = cronAbandonedCheckout;
exports.cronInactiveUsers = cronInactiveUsers;

// onPublicationCreated (publicationNotifications.js) desativada: o client já faz o fan-out.


const { publicacao } = require("./publicacao");
exports.publicacao = publicacao;
const { publicacaoImage } = require("./publicacaoImage");
exports.publicacaoImage = publicacaoImage;

const { adminDeleteUser } = require("./adminDeleteUser");
exports.adminDeleteUser = adminDeleteUser;
