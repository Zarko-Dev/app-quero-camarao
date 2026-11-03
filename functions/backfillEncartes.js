// Uso (uma vez): node backfillEncartes.js [--dry]
// Gera encartes/<id>.png para toda publicação NÃO vendida. Escreve no Storage de produção.
// Auth: GOOGLE_APPLICATION_CREDENTIALS ou `gcloud auth application-default login`.
const admin = require("firebase-admin");

const BUCKET = process.env.STORAGE_BUCKET || "api-quero-camarao.appspot.com";
const dry = process.argv.includes("--dry");

(async () => {
    admin.initializeApp({ projectId: "api-quero-camarao", storageBucket: BUCKET });
    const { generateEncarte } = require("./src/encarteStorage");
    const bucket = admin.storage().bucket();
    const snap = await admin.firestore().collection("shrimpPonds").get();
    const todo = snap.docs.filter((d) => d.data().sold !== true);
    console.log(`${snap.size} publicações, ${todo.length} não vendidas, bucket ${bucket.name}${dry ? " (dry)" : ""}`);
    let ok = 0;
    let fail = 0;
    for (const d of todo) {
        if (dry) continue;
        try { await generateEncarte(d.id, d.data(), bucket); ok += 1; } catch (e) { fail += 1; console.error(d.id, e.message); }
    }
    console.log(`ok=${ok} falhas=${fail}`);
})();
