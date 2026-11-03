const fs = require("fs");
const path = require("path");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

const SITE = "https://querocamarao.com.br";
// Cópia de public/publicacao/index.html (hosting não é visível à function);
// publicacao.test.js garante que as duas não divergem.
const TEMPLATE = fs.readFileSync(path.join(__dirname, "publicacaoTemplate.html"), "utf8");
const OG_BLOCK = /<!--OG-->[\s\S]*?<!--\/OG-->/;

const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const extractId = (reqPath) => {
    const match = /^\/publicacao\/([A-Za-z0-9_-]{1,128})\/?$/.exec(reqPath || "");
    return match ? match[1] : null;
};

const buildMeta = (id, pub, imageUrl) => {
    const shrimps = (Array.isArray(pub?.shrimps) ? pub.shrimps : []).filter(Boolean);
    const grammage = shrimps.map((s) => (s.grammage ? `${s.grammage}g` : null)).filter(Boolean).join("/");
    const kilo = shrimps.map((s) => (s.kilo ? `${s.kilo} kg` : null)).filter(Boolean).join(" / ");
    const title = [grammage ? `Camarão ${grammage}` : "Camarão", kilo, pub?.location].filter(Boolean).join(" - ");
    const description = [
        pub?.ponds != null && pub.ponds !== "" ? `Viveiros: ${pub.ponds}` : null,
        grammage ? `Gramatura: ${grammage}` : null,
        kilo ? `Quantidade: ${kilo}` : null,
        "Veja no Quero Camarão.",
    ].filter(Boolean).join(" · ");
    return {
        title, description, image: imageUrl || `${SITE}/publicacao/${id}/og.png`, imageWidth: 1200, imageHeight: 630, url: `${SITE}/publicacao/${id}`,
    };
};

const renderOg = (meta) => `<!--OG-->
<meta property="og:site_name" content="Quero Camarão" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escapeHtml(meta.title)}" />
<meta property="og:description" content="${escapeHtml(meta.description)}" />
<meta property="og:image" content="${escapeHtml(meta.image)}" />
<meta property="og:image:width" content="${meta.imageWidth || 1200}" />
<meta property="og:image:height" content="${meta.imageHeight || 630}" />
<meta property="og:url" content="${escapeHtml(meta.url)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(meta.title)}" />
<meta name="twitter:description" content="${escapeHtml(meta.description)}" />
<meta name="twitter:image" content="${escapeHtml(meta.image)}" />
<!--/OG-->`;

const renderPage = (id, pub, imageUrl) => (pub
    ? TEMPLATE.replace(OG_BLOCK, () => renderOg(buildMeta(id, pub, imageUrl)))
    : TEMPLATE);

// PNG pré-gerado (encarteStorage.js); sem ele cai no og.png gerado na hora.
const findEncarteUrl = async (id) => {
    try {
        const bucket = admin.storage().bucket();
        const [exists] = await bucket.file(`encartes/${id}.png`).exists();
        if (!exists) return null;
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`encartes/${id}.png`)}?alt=media`;
    } catch (error) {
        console.error("[publicacao] encarte lookup failed", id, error?.message);
        return null;
    }
};

const handlePublicacao = async (req, res, db = admin.firestore(), lookupEncarte = findEncarteUrl) => {
    const id = extractId(req.path);
    if (!id) return res.status(200).type("html").send(TEMPLATE);

    let pub = null;
    try {
        const snap = await db.collection("shrimpPonds").doc(id).get();
        pub = snap.exists ? snap.data() : null;
    } catch (error) {
        console.error("[publicacao] read failed", id, error?.message);
    }
    // Inexistente: 404 sem cache longo; a página rica mostra "não encontramos".
    res.set("Cache-Control", pub ? "public, max-age=300, s-maxage=600" : "public, max-age=60");
    const imageUrl = pub ? await lookupEncarte(id) : null;
    return res.status(pub ? 200 : 404).type("html").send(renderPage(id, pub, imageUrl));
};

if (!admin.apps.length) admin.initializeApp();
exports.publicacao = onRequest((req, res) => handlePublicacao(req, res));
exports.handlePublicacao = handlePublicacao;
exports.escapeHtml = escapeHtml;
exports.extractId = extractId;
exports.buildMeta = buildMeta;
exports.renderPage = renderPage;
