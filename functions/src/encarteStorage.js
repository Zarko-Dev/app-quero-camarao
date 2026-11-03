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
exports.generateEncarte = generateEncarte;
exports.encartePath = encartePath;
exports.encarteUrl = encarteUrl;
exports.relevantKey = relevantKey;
