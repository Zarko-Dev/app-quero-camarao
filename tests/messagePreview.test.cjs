const test = require("node:test");
const assert = require("node:assert/strict");

const { buildMessagePreview } = require("../src/utils/messagePreview");

test("texto curto passa direto", () => {
    assert.equal(buildMessagePreview({ text: "olá" }), "olá");
});

test("texto longo trunca em 80 com reticências", () => {
    const long = "a".repeat(100);
    assert.equal(buildMessagePreview({ text: long }), `${"a".repeat(77)}...`);
});

test("tipos de mídia", () => {
    assert.equal(buildMessagePreview({ imageUrl: "x" }), "📷 Foto");
    assert.equal(buildMessagePreview({ audioUrl: "x" }), "🎵 Áudio");
    assert.equal(buildMessagePreview({ fileUrl: "x" }), "📎 Documento");
});

test("vazio vira string vazia", () => {
    assert.equal(buildMessagePreview({}), "");
    assert.equal(buildMessagePreview(null), "");
});
