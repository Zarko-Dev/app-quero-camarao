const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

function formatCpf(d) {
    if (d.length !== 11) return null;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

function formatPhone11(d) {
    if (d.length !== 11) return null;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function formatPhone10(d) {
    if (d.length !== 10) return null;
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6, 10)}`;
}

async function findUidByIdentifier(db, identifier) {
    const cleaned = identifier.replace(/\D/g, "");
    if (cleaned.length < 8) return null;

    const cpfValues = [cleaned, formatCpf(cleaned)].filter(Boolean);
    const phoneValues = [cleaned, formatPhone11(cleaned), formatPhone10(cleaned)].filter(Boolean);

    const queries = [
        ...cpfValues.map((v) => db.collection("users").where("cpf", "==", v).limit(1).get()),
        ...phoneValues.map((v) => db.collection("users").where("phone", "==", v).limit(1).get()),
    ];

    const snapshots = await Promise.all(queries);
    const seenIds = new Set();
    const found = snapshots
        .flatMap((s) => s.docs)
        .find((d) => {
            if (seenIds.has(d.id)) return false;
            seenIds.add(d.id);
            return true;
        });

    if (!found) return null;

    const email = found.data()?.email;
    if (!email) return null;

    try {
        const authUser = await admin.auth().getUserByEmail(email);
        return authUser.uid;
    } catch {
        return null;
    }
}

// Valida que a conta existe. Retorna { found: true } ou lança not-found.
exports.getPasswordResetToken = onCall(
    { region: "us-central1", cors: true },
    async (request) => {
        const { identifier } = request.data;
        if (!identifier || typeof identifier !== "string") {
            throw new HttpsError("invalid-argument", "Informe o CPF ou telefone.");
        }
        const cleaned = identifier.replace(/\D/g, "");
        if (cleaned.length < 8) {
            throw new HttpsError("invalid-argument", "CPF ou telefone inválido.");
        }
        const uid = await findUidByIdentifier(admin.firestore(), identifier);
        if (!uid) {
            throw new HttpsError("not-found", "Nenhuma conta encontrada com esse CPF ou telefone.");
        }
        return { found: true };
    },
);

// Redefine a senha diretamente via Admin SDK — não requer IAM Credentials API.
exports.resetPasswordByIdentifier = onCall(
    { region: "us-central1", cors: true },
    async (request) => {
        const { identifier, newPassword } = request.data;

        if (!identifier || !newPassword) {
            throw new HttpsError("invalid-argument", "Dados incompletos.");
        }
        if (newPassword.length < 6) {
            throw new HttpsError("invalid-argument", "Senha deve ter pelo menos 6 caracteres.");
        }

        const uid = await findUidByIdentifier(admin.firestore(), identifier);
        if (!uid) {
            throw new HttpsError("not-found", "Nenhuma conta encontrada com esse CPF ou telefone.");
        }

        await admin.auth().updateUser(uid, { password: newPassword });
        return { success: true };
    },
);
