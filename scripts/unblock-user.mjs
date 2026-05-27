// Script: desbloqueia CPF em newDrawPrizeRules
// Uso: node scripts/unblock-user.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const config = {
    apiKey: "AIzaSyChEI8dVYU5b-aOPcRZ4AxatdlND8_CRhg",
    authDomain: "api-quero-camarao.firebaseapp.com",
    projectId: "api-quero-camarao",
};

const TARGET_CPF = "285.148.903-87";

const app = initializeApp(config);
const db = getFirestore(app);

const snap = await getDocs(collection(db, "newDrawPrizeRules"));

let found = false;

for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const cpfs = data.cpfs ?? [];

    const idx = cpfs.findIndex((u) => u.cpf === TARGET_CPF);
    if (idx === -1) continue;

    console.log(`Encontrado no documento: ${docSnap.id} (loja: ${data.store})`);
    console.log(`Status atual:`, cpfs[idx]);

    const updatedCpfs = cpfs.map((u, i) =>
        i === idx ? { ...u, blocked: false, blockedUntil: null } : u,
    );

    await updateDoc(doc(db, "newDrawPrizeRules", docSnap.id), { cpfs: updatedCpfs });

    console.log(`✅ CPF ${TARGET_CPF} desbloqueado com sucesso.`);
    found = true;
    break;
}

if (!found) {
    console.log(`❌ CPF ${TARGET_CPF} não encontrado em nenhum documento de newDrawPrizeRules.`);
}

process.exit(0);
