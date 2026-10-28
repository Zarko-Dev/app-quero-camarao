const assert = require("node:assert/strict");
const test = require("node:test");

const {
    PUBLICATION_SHARE_BASE_URL,
    buildShareMessage,
} = require("../src/utils/publicationShareMessage");

const item = {
    id: "abc-123",
    location: "Jaguaruana/CE",
    ponds: "1 viveiro",
    shrimps: [{ grammage: "20", kilo: "1100" }],
};

test("share message keeps gramatura/quantidade/cidade/viveiros and ends with only the https url", () => {
    const msg = buildShareMessage(item);
    const lines = msg.split("\n");

    assert.ok(msg.includes("Gramatura: 20 g"));
    assert.ok(msg.includes("Quantidade: 1.100 kg"));
    assert.ok(msg.includes("📍 Jaguaruana/CE"));
    assert.ok(msg.includes("Viveiros: 1 viveiro"));
    assert.equal(lines[lines.length - 1], "https://querocamarao.com.br/publicacao/abc-123");
    assert.equal(PUBLICATION_SHARE_BASE_URL, "https://querocamarao.com.br/publicacao");
});

test("share message never uses the custom scheme", () => {
    assert.ok(!buildShareMessage(item).includes("querocamarao://"));
});
