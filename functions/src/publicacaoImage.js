const fs = require("fs");
const path = require("path");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { Resvg } = require("@resvg/resvg-js");
const { escapeHtml } = require("./publicacao");

const ASSETS = path.join(__dirname, "assets");
const FONT = path.join(ASSETS, "Comfortaa_700Bold.ttf");
const toDataUri = (file) => `data:image/png;base64,${fs.readFileSync(path.join(ASSETS, file)).toString("base64")}`;
const LOGO = toDataUri("logo.png");
const SHRIMP_ICON = toDataUri("shrimpIcon.png");

const W = 1200;
const H = 630;
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const FALLBACK = "https://querocamarao.com.br/og-image.png";

const extractImageId = (reqPath) => {
    const match = /^\/publicacao\/([A-Za-z0-9_-]{1,128})\/og\.png$/.exec(reqPath || "");
    return match ? match[1] : null;
};

// Mesmo formato do formatKilo do app: "1100" -> "1.100".
const formatKilo = (value) => {
    const v = String(value ?? "").replace(",", ".");
    if (v.includes(".")) return v;
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString("pt-BR") : v;
};

const fetchPhoto = async (url) => {
    if (typeof url !== "string" || !url.startsWith("https://")) return null;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!response.ok) return null;
        const type = (response.headers.get("content-type") || "").split(";")[0];
        if (type !== "image/jpeg" && type !== "image/png") return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > PHOTO_MAX_BYTES) return null;
        return `data:${type};base64,${buffer.toString("base64")}`;
    } catch (error) {
        console.error("[publicacaoImage] photo failed", error?.message);
        return null;
    }
};

const buildSvg = (pub, photo) => {
    const shrimps = (Array.isArray(pub?.shrimps) ? pub.shrimps : []).filter(Boolean).slice(0, 4);
    const rowH = shrimps.length > 2 ? 62 : 80;
    const fontSize = shrimps.length > 2 ? 40 : 52;
    const rows = shrimps.map((s, i) => {
        const y = 365 + i * rowH;
        const text = `${s.grammage ?? "?"}g / ${formatKilo(s.kilo)}kg`;
        return `<image href="${SHRIMP_ICON}" x="620" y="${y - fontSize + 4}" width="${fontSize - 6}" height="${fontSize - 6}"/>
<text x="${620 + fontSize}" y="${y}" font-size="${fontSize}" fill="#e85d22">${escapeHtml(text)}</text>`;
    }).join("\n");
    const ponds = pub?.ponds != null && pub.ponds !== ""
        ? `${pub.ponds} ${Number(pub.ponds) === 1 ? "Viveiro" : "Viveiros"}` : "";
    const photoEl = photo
        ? `<image href="${photo}" x="40" y="215" width="540" height="375" preserveAspectRatio="xMidYMid slice" clip-path="url(#round)"/>`
        : `<rect x="40" y="215" width="540" height="375" rx="28" fill="#fdeee6"/>
<image href="${SHRIMP_ICON}" x="260" y="340" width="100" height="100" opacity="0.6"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Comfortaa" font-weight="bold">
<defs><clipPath id="round"><rect x="40" y="215" width="540" height="375" rx="28"/></clipPath></defs>
<rect width="${W}" height="${H}" fill="#fff"/>
<rect width="${W}" height="130" fill="#e85d22"/>
<image href="${LOGO}" x="${(W - 248) / 2}" y="12" width="248" height="106" preserveAspectRatio="xMidYMid meet"/>
<text x="40" y="188" font-size="42" fill="#e85d22">${escapeHtml(pub?.location || "")}</text>
<text x="${W - 40}" y="188" font-size="34" fill="#333" text-anchor="end">${escapeHtml(ponds)}</text>
${photoEl}
<text x="620" y="290" font-size="34" fill="#333">Gramatura/Quilos</text>
${rows}
</svg>`;
};

const renderPng = (pub, photo) => new Resvg(buildSvg(pub, photo), {
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: "Comfortaa" },
}).render().asPng();

const redirectFallback = (res) => {
    res.set("Cache-Control", "public, max-age=60");
    return res.redirect(302, FALLBACK);
};

const handlePublicacaoImage = async (req, res, db = admin.firestore()) => {
    const id = extractImageId(req.path);
    if (!id) return res.status(404).send("not found");
    try {
        const snap = await db.collection("shrimpPonds").doc(id).get();
        if (!snap.exists) return redirectFallback(res);
        const pub = snap.data();
        const firstUrl = (pub.shrimps || []).map((s) => s?.imageShrimpUri).find((u) => typeof u === "string" && u.startsWith("https://"));
        const png = renderPng(pub, await fetchPhoto(firstUrl));
        res.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
        return res.status(200).type("png").send(Buffer.from(png));
    } catch (error) {
        console.error("[publicacaoImage] render failed", id, error?.message);
        return redirectFallback(res);
    }
};

if (!admin.apps.length) admin.initializeApp();
exports.publicacaoImage = onRequest({ memory: "512MiB", timeoutSeconds: 30 }, (req, res) => handlePublicacaoImage(req, res));
exports.handlePublicacaoImage = handlePublicacaoImage;
exports.extractImageId = extractImageId;
exports.renderPng = renderPng;
