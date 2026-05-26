const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildEncarteLink,
    buildEncarteContactMessage,
} = require("../src/utils/encarteProdutor");

test("buildEncarteLink uses provided https link when available", () => {
    const link = buildEncarteLink({
        providedLink: "https://cdn.querocamarao.com/encarte/abc",
        publicationId: "pub-1",
    });

    assert.equal(link, "https://cdn.querocamarao.com/encarte/abc");
});

test("buildEncarteLink falls back to default web link by publication id", () => {
    const link = buildEncarteLink({
        providedLink: "",
        publicationId: "pub-99",
    });

    assert.equal(link, "https://querocamarao.com.br/encarte/pub-99");
});

test("buildEncarteContactMessage includes flyer data and universal link", () => {
    const message = buildEncarteContactMessage({
        location: "Natal/RN",
        shrimpSizeLabel: "10g (M)",
        grammageValue: "42",
        saleDate: "22/05/2026",
        encarteLink: "https://querocamarao.com.br/encarte/pub-10",
    });

    assert.ok(message.includes("Natal/RN"));
    assert.ok(message.includes("10g (M)"));
    assert.ok(message.includes("R$ 42,00"));
    assert.ok(message.includes("22/05/2026"));
    assert.ok(message.includes("https://querocamarao.com.br/encarte/pub-10"));
});
