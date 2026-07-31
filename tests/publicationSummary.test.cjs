const test = require("node:test");
const assert = require("node:assert/strict");

const { buildPublicationSummary } = require("../src/utils/publicationSummary");

test("um item vira 'Xg • Ykg'", () => {
    assert.equal(buildPublicationSummary([{ grammage: 14, kilo: "1800" }]), "14g • 1.800kg");
});

test("vários itens separados por ' · '", () => {
    assert.equal(
        buildPublicationSummary([
            { grammage: 30, kilo: "2000" },
            { grammage: 28, kilo: "1500" },
        ]),
        "30g • 2.000kg · 28g • 1.500kg",
    );
});

test("kilo com ponto/vírgula preservado", () => {
    assert.equal(buildPublicationSummary([{ grammage: 10, kilo: "1,5" }]), "10g • 1.5kg");
});

test("vazio/ausente/malformado vira string vazia", () => {
    assert.equal(buildPublicationSummary([]), "");
    assert.equal(buildPublicationSummary(null), "");
    assert.equal(buildPublicationSummary(undefined), "");
    assert.equal(buildPublicationSummary("nope"), "");
});

test("itens sem grammage são ignorados", () => {
    assert.equal(
        buildPublicationSummary([{ kilo: "100" }, { grammage: 20, kilo: "500" }]),
        "20g • 500kg",
    );
});
