const test = require("node:test");
const assert = require("node:assert/strict");

const { areAllShrimpsSold } = require("../src/utils/shrimpSaleStatus");

// --- areAllShrimpsSold ---

test("areAllShrimpsSold returns true when all shrimps have sale: true", () => {
    const shrimps = [
        { id: "v1", sale: true },
        { id: "v2", sale: true },
    ];
    assert.equal(areAllShrimpsSold(shrimps), true);
});

test("areAllShrimpsSold returns false when at least one shrimp is not sold", () => {
    const shrimps = [
        { id: "v1", sale: true },
        { id: "v2" },
    ];
    assert.equal(areAllShrimpsSold(shrimps), false);
});

test("areAllShrimpsSold returns false for empty array", () => {
    assert.equal(areAllShrimpsSold([]), false);
});

test("areAllShrimpsSold returns false when sale is false", () => {
    const shrimps = [
        { id: "v1", sale: true },
        { id: "v2", sale: false },
    ];
    assert.equal(areAllShrimpsSold(shrimps), false);
});

// --- venda de todos os viveiros fecha chats ---
// SaleShrimps/index.jsx chama markPublicationSold + closeChatsForPublication
// quando areAllShrimpsSold retorna true.

test("venda de todos os viveiros fecha chats — areAllShrimpsSold detecta completude", () => {
    const shrimps = [
        { id: "v1", sale: true },
        { id: "v2", sale: true },
    ];
    assert.equal(
        areAllShrimpsSold(shrimps),
        true,
        "deve retornar true para disparar markPublicationSold + closeChatsForPublication",
    );
});

// --- venda parcial nao fecha chats ---

test("venda parcial nao fecha chats — areAllShrimpsSold detecta venda incompleta", () => {
    const shrimps = [
        { id: "v1", sale: true },
        { id: "v2" },
    ];
    assert.equal(
        areAllShrimpsSold(shrimps),
        false,
        "deve retornar false para nao fechar chats enquanto ha viveiros pendentes",
    );
});
