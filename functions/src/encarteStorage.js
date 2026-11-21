const admin = require("firebase-admin");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { renderPng, fetchPhoto } = require("./publicacaoImage");

const encartePath = (id) => `encartes/${id}.png`;

// Leitura pública liberada em storage.rules (match /encartes/{fileName}).
const encarteUrl = (bucketName, id) => `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(encartePath(id))}?alt=media`;

const firstPhotoUrl = (pub) => (pub?.shrimps || [])
    .map((s) => s?.imageShrimpUri)
    .find((u) => typeof u === "string" && u.startsWith("https://"));

// Só o que aparece no PNG: evita regerar a cada visualização/chat/etc.
const relevantKey = (pub) => JSON.stringify([
    pub?.location,
    pub?.ponds,
    (pub?.shrimps || []).map((s) => [s?.grammage, s?.kilo, s?.imageShrimpUri]),
]);

const generateEncarte = async (id, pub, bucket = admin.storage().bucket()) => {
    const png = renderPng(pub, await fetchPhoto(firstPhotoUrl(pub)));
    await bucket.file(encartePath(id)).save(Buffer.from(png), {
        contentType: "image/png",
        // Curto: a edição da publicação sobrescreve o mesmo caminho.
        metadata: { cacheControl: "public, max-age=300" },
    });
};

// Só grupos (sem recipients): clientes exigem opt-in no app (LGPD). Falha aqui nunca derruba o encarte.
const notifyWhatsapp = async (id, pub) => {
    const { NOTIFIER_URL, NOTIFIER_API_KEY } = process.env;
    if (!NOTIFIER_URL || !NOTIFIER_API_KEY) return;
    try {
        const res = await fetch(`${NOTIFIER_URL}/notify/publication`, {
            method: "POST",
            signal: AbortSignal.timeout(5000), // notifier travado não pode segurar a function
            headers: { "Content-Type": "application/json", "x-api-key": NOTIFIER_API_KEY },
            body: JSON.stringify({ publicationId: id, location: pub.location, shrimps: pub.shrimps }),
        });
        if (!res.ok) console.error("[encarteStorage] notifier", res.status);
    } catch (error) {
        console.error("[encarteStorage] notifier failed", id, error?.message);
    }
};

const handleEncarteWrite = async (event, bucket = admin.storage().bucket()) => {
    const { id } = event.params;
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!after) {
        await bucket.file(encartePath(id)).delete({ ignoreNotFound: true });
        return null;
    }
    if (after.sold === true) return null;
    if (before && relevantKey(before) === relevantKey(after)) return null;

    try {
        await generateEncarte(id, after, bucket);
        // Só na criação; o PNG já está no Storage quando o notifier buscar.
        if (!before) await notifyWhatsapp(id, after);
    } catch (error) {
        console.error("[encarteStorage] failed", id, error?.message);
    }
    return null;
};

if (!admin.apps.length) admin.initializeApp();
exports.onPublicationEncarte = onDocumentWritten(
    { document: "shrimpPonds/{id}", memory: "512MiB", timeoutSeconds: 60 },
    (event) => handleEncarteWrite(event),
);
exports.handleEncarteWrite = handleEncarteWrite;
exports.notifyWhatsapp = notifyWhatsapp;
exports.generateEncarte = generateEncarte;
exports.encartePath = encartePath;
exports.encarteUrl = encarteUrl;
exports.relevantKey = relevantKey;
