const test = require("node:test");
const assert = require("node:assert/strict");

const { buildWinnerKeySet } = require("../src/utils/drawEligibility");

test("buildWinnerKeySet extracts uid/email/cpf from winner objects, not the objects themselves", () => {
    const winners = [
        { uid: "u1", name: "Ana" },
        { email: "b@test.com", name: "Bruno" },
        { cpf: "12345678900", name: "Carla" },
    ];
    const keys = buildWinnerKeySet(winners);

    assert.equal(keys.has("u1"), true);
    assert.equal(keys.has("b@test.com"), true);
    assert.equal(keys.has("12345678900"), true);
    // A regressão original comparava um id contra o objeto inteiro — nunca batia.
    assert.equal(keys.has(winners[0]), false);
});

test("buildWinnerKeySet ignores winners without any identifier", () => {
    const keys = buildWinnerKeySet([{ name: "Sem id" }]);
    assert.equal(keys.size, 0);
});

test("buildWinnerKeySet handles empty/missing input", () => {
    assert.equal(buildWinnerKeySet([]).size, 0);
    assert.equal(buildWinnerKeySet(undefined).size, 0);
});
