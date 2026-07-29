const test = require("node:test");
const assert = require("node:assert/strict");

const { formatUnreadBadge } = require("../src/utils/formatUnreadBadge");

test("retorna vazio para zero", () => {
    assert.equal(formatUnreadBadge(0), "");
});

test("retorna vazio para negativo", () => {
    assert.equal(formatUnreadBadge(-3), "");
});

test("retorna vazio para NaN/undefined/null", () => {
    assert.equal(formatUnreadBadge(NaN), "");
    assert.equal(formatUnreadBadge(undefined), "");
    assert.equal(formatUnreadBadge(null), "");
});

test("retorna o número como texto de 1 a 99", () => {
    assert.equal(formatUnreadBadge(1), "1");
    assert.equal(formatUnreadBadge(42), "42");
    assert.equal(formatUnreadBadge(99), "99");
});

test("retorna 99+ acima de 99", () => {
    assert.equal(formatUnreadBadge(100), "99+");
    assert.equal(formatUnreadBadge(1500), "99+");
});
