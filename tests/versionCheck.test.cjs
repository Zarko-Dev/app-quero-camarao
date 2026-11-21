const test = require("node:test");
const assert = require("node:assert/strict");

const { isBelowMinimumVersion } = require("../src/utils/versionCheck");

test("abaixo do mínimo", () => {
    assert.equal(isBelowMinimumVersion("3", "2.0.5"), true);
    assert.equal(isBelowMinimumVersion("3.0.0", "2.9.9"), true);
});

test("igual ou acima do mínimo", () => {
    assert.equal(isBelowMinimumVersion("3", "3.0.0"), false);
    assert.equal(isBelowMinimumVersion("3", "3.0.1"), false);
    assert.equal(isBelowMinimumVersion("3", "10.0"), false);
});

test("valor ausente ou inválido não bloqueia", () => {
    assert.equal(isBelowMinimumVersion(undefined, "2.0.5"), false);
    assert.equal(isBelowMinimumVersion("", "2.0.5"), false);
    assert.equal(isBelowMinimumVersion("abc", "2.0.5"), false);
    assert.equal(isBelowMinimumVersion("3", null), false);
});
