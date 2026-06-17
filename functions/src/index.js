const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Recebe CPF ou telefone, acha o usuário no Firestore,
 * gera um custom token do Firebase Auth e retorna pro app.
 * O app usa o token pra assinar e trocar a senha direto.
 */
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

        const db = admin.firestore();

        const [byCpf, byPhone] = await Promise.all([
            db.collection("users").where("cpf", "==", cleaned).limit(1).get(),
            db.collection("users").where("phone", "==", cleaned).limit(1).get(),
        ]);

        const merged = [...byCpf.docs, ...byPhone.docs];
        const seenIds = new Set();
        const unique = merged.filter((d) => {
            if (seenIds.has(d.id)) return false;
            seenIds.add(d.id);
            return true;
        });
        const found = unique[0];

        if (!found) {
            throw new HttpsError("not-found", "Nenhuma conta encontrada com esse CPF ou telefone.");
        }

        const email = found.data()?.email;
        if (!email) {
            throw new HttpsError("internal", "Conta sem email associado.");
        }

        let authUser;
        try {
            authUser = await admin.auth().getUserByEmail(email);
        } catch {
            throw new HttpsError("not-found", "Conta não encontrada no sistema de autenticação.");
        }

        const customToken = await admin.auth().createCustomToken(authUser.uid, {
            passwordReset: true,
        });

        return { token: customToken };
    },
);
