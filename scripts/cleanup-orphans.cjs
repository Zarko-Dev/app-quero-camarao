// Remove contas de teste órfãs (Auth + users/{email}) do QA. Dry-run por padrão;
// só apaga com --apply. Allowlist fixa e só @mailinator.com.
const admin = require("../functions/node_modules/firebase-admin");
const serviceAccount = require("../api-quero-camarao-c4ef8022ba49.json");

const APPLY = process.argv.includes("--apply");
const EMAILS = [
    "farol.qa.cliente1022@mailinator.com",
    "farol.qa.cliente2@mailinator.com",
    "farol.qa.cliente3@mailinator.com",
    "farol.qa.curl1@mailinator.com",
    "farol.qa.cliente4@mailinator.com",
    "farol.qa.produtor1@mailinator.com",
];

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function main() {
    const db = admin.firestore();
    for (const email of EMAILS) {
        if (!email.endsWith("@mailinator.com")) throw new Error(`recusado: ${email}`);

        let uid = null;
        try {
            uid = (await admin.auth().getUserByEmail(email)).uid;
        } catch (error) {
            if (error.code !== "auth/user-not-found") throw error;
        }
        const profileRef = db.collection("users").doc(email);
        const hasProfile = (await profileRef.get()).exists;

        console.log(`${APPLY ? "APAGA" : "dry-run"} ${email} auth=${uid || "-"} profile=${hasProfile}`);
        if (!APPLY) continue;
        if (uid) await admin.auth().deleteUser(uid);
        if (hasProfile) await profileRef.delete();
    }
    if (!APPLY) console.log("Nada apagado. Use --apply para executar.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
