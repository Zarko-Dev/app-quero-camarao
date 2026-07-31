const test = require("node:test");
const assert = require("node:assert/strict");

const { formatKilo } = require("../src/utils/formatKilo");

test("inteiro em string ganha separador de milhar pt-BR", () => {
    assert.equal(formatKilo("2000"), "2.000");
    assert.equal(formatKilo("1500"), "1.500");
});

test("valor com ponto é retornado como está", () => {
    assert.equal(formatKilo("1.5"), "1.5");
});

test("vírgula vira ponto e é retornado como está", () => {
    assert.equal(formatKilo("1,5"), "1.5");
});

test("número (não-string) não quebra", () => {
    assert.equal(formatKilo(2000), "2.000");
});
