const { HttpsError, onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

const STORAGE_URL_MARKER = "firebasestorage.googleapis.com/v0/b/";

// Caminho do objeto no Storage a partir de uma URL de download (".../o/<path>?alt=media").
function storagePathFromUrl(url) {
    const at = url.indexOf("/o/");
    if (at === -1) return null;
    const rest = url.slice(at + 3).split("?")[0];
    try {
        return decodeURIComponent(rest);
    } catch (error) {
        return null;
    }
}

// Coleta as URLs de Storage de um documento (qualquer campo string com URL de download).
function collectStoragePaths(data, acc = new Set()) {
    if (typeof data === "string") {
        if (data.includes(STORAGE_URL_MARKER)) {
            const path = storagePathFromUrl(data);
            if (path) acc.add(path);
        }
    } else if (Array.isArray(data)) {
        data.forEach((item) => collectStoragePaths(item, acc));
    } else if (data && typeof data === "object") {
        Object.values(data).forEach((value) => collectStoragePaths(value, acc));
    }
    return acc;
}

const isAdminRules = (rules) => (Array.isArray(rules)
    ? rules.includes("Admin") || rules.includes("admin")
    : rules === "Admin" || rules === "admin");

// Apaga TODOS os dados ligados ao e-mail: publicações, anúncios, pedidos, carteira,
// indicações, chats (com mensagens), avaliações, visualizações, imagens e a conta de login.
// Idempotente: pode ser chamada de novo se algo falhar no meio.
async function handleAdminDeleteUser(request, deps = {}) {
    const db = deps.db || admin.firestore();
    const bucket = deps.bucket || admin.storage().bucket();
    const authApi = deps.authApi || {
        getUserByEmail: (email) => admin.auth().getUserByEmail(email),
        deleteUser: (uid) => admin.auth().deleteUser(uid),
    };

    const callerEmail = request.auth?.token?.email;
    if (!callerEmail) {
        throw new HttpsError("unauthenticated", "Faça login novamente.");
    }

    const callerDoc = await db.collection("users").doc(callerEmail).get();
    if (!callerDoc.exists || !isAdminRules(callerDoc.data().rules)) {
        throw new HttpsError("permission-denied", "Apenas administradores podem excluir usuários.");
    }

    const targetEmail = String(request.data?.email || "").trim().toLowerCase();
    if (!targetEmail) {
        throw new HttpsError("invalid-argument", "Informe o e-mail do usuário.");
    }
    if (targetEmail === callerEmail.toLowerCase()) {
        throw new HttpsError("failed-precondition", "Você não pode excluir a própria conta.");
    }

    const counts = { publications: 0, ads: 0, orders: 0, chats: 0, ratings: 0, files: 0 };
    const storagePaths = new Set();

    const deleteDocs = async (snapshot) => {
        const refs = [];
        snapshot.forEach((docSnap) => {
            collectStoragePaths(docSnap.data(), storagePaths);
            refs.push(docSnap.ref);
        });
        for (let i = 0; i < refs.length; i += 1) {
            await db.recursiveDelete(refs[i]);
        }
        return refs.length;
    };

    // Publicações (+ visualizações e vendas ligadas)
    const pubs = await db.collection("shrimpPonds").where("userId", "==", targetEmail).get();
    for (const pubSnap of pubs.docs) {
        collectStoragePaths(pubSnap.data(), storagePaths);
        await db.collection("logPublicationsViews").doc(pubSnap.id).delete();
        const sales = await db.collection("shirimpSale").where("publicationId", "==", pubSnap.id).get();
        await deleteDocs(sales);
        await db.recursiveDelete(pubSnap.ref);
        counts.publications += 1;
    }

    counts.ads = await deleteDocs(
        await db.collection("publishAds").where("userId", "==", targetEmail).get(),
    );
    counts.orders = await deleteDocs(
        await db.collection("orders").where("userId", "==", targetEmail).get(),
    );

    // Chats (o outro participante também perde a conversa) e avaliações
    const chatSnaps = await Promise.all([
        db.collection("chats").where("buyerId", "==", targetEmail).get(),
        db.collection("chats").where("sellerId", "==", targetEmail).get(),
    ]);
    const chatDocs = new Map();
    chatSnaps.forEach((snap) => snap.forEach((d) => chatDocs.set(d.id, d)));
    counts.chats = await deleteDocs({ forEach: (fn) => chatDocs.forEach(fn) });

    const ratingSnaps = await Promise.all([
        db.collection("ratings").where("raterId", "==", targetEmail).get(),
        db.collection("ratings").where("ratedId", "==", targetEmail).get(),
    ]);
    const ratingDocs = new Map();
    ratingSnaps.forEach((snap) => snap.forEach((d) => ratingDocs.set(d.id, d)));
    counts.ratings = await deleteDocs({ forEach: (fn) => ratingDocs.forEach(fn) });

    // Carteira, indicações e perfil
    const wallet = await db.collection("wallets").doc(targetEmail).get();
    if (wallet.exists) await deleteDocs({ forEach: (fn) => fn(wallet) });
    const invitation = await db.collection("invitations").doc(targetEmail).get();
    if (invitation.exists) await deleteDocs({ forEach: (fn) => fn(invitation) });

    const userDoc = await db.collection("users").doc(targetEmail).get();
    if (userDoc.exists) await deleteDocs({ forEach: (fn) => fn(userDoc) });

    // Arquivos no Storage
    for (const path of storagePaths) {
        await bucket.file(path).delete({ ignoreNotFound: true });
        counts.files += 1;
    }

    // Por último a conta de login: se der erro antes, a função pode ser chamada de novo.
    let authDeleted = false;
    try {
        const userRecord = await authApi.getUserByEmail(targetEmail);
        await authApi.deleteUser(userRecord.uid);
        authDeleted = true;
    } catch (error) {
        if (error?.code !== "auth/user-not-found") throw error;
    }

    return { deleted: true, authDeleted, counts };
}

const adminDeleteUser = onCall(
    { region: "us-central1", cors: true, timeoutSeconds: 300, memory: "512MiB" },
    (request) => handleAdminDeleteUser(request),
);

module.exports = { adminDeleteUser, handleAdminDeleteUser, storagePathFromUrl, collectStoragePaths };
