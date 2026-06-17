const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Formata 11 dígitos como CPF: "00245567348" → "002.455.673-48"
function formatCpf(d) {
    if (d.length !== 11) return null;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

// Formata 11 dígitos como celular: "85987654321" → "(85) 98765-4321"
function formatPhone11(d) {
    if (d.length !== 11) return null;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

// Formata 10 dígitos como fixo: "8534567890" → "(85) 3456-7890"
function formatPhone10(d) {
    if (d.length !== 10) return null;
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6, 10)}`;
}

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

        // Gera todas as variantes de formato possíveis
        const cpfFormatted = formatCpf(cleaned);
        const phone11Formatted = formatPhone11(cleaned);
        const phone10Formatted = formatPhone10(cleaned);

        const cpfValues = [cleaned, cpfFormatted].filter(Boolean);
        const phoneValues = [cleaned, phone11Formatted, phone10Formatted].filter(Boolean);

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
