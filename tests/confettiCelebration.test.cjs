const test = require("node:test");
const assert = require("node:assert/strict");

const {
    CONFETTI_DURATION_MS,
    MAX_DELAY_MS,
    MIN_DUR_MS,
    MAX_DUR_MS,
} = require("../src/components/ConfettiCelebration/constants");

test("CONFETTI_DURATION_MS is a positive number", () => {
    assert.strictEqual(typeof CONFETTI_DURATION_MS, "number");
    assert.ok(CONFETTI_DURATION_MS > 0);
});

test("MAX_DELAY_MS and MAX_DUR_MS are positive numbers", () => {
    assert.ok(MAX_DELAY_MS > 0);
    assert.ok(MAX_DUR_MS > 0);
    assert.ok(MIN_DUR_MS > 0);
    assert.ok(MAX_DUR_MS > MIN_DUR_MS);
});

test("CONFETTI_DURATION_MS covers max particle lifetime (MAX_DELAY_MS + MAX_DUR_MS)", () => {
    const maxLifetimeMs = MAX_DELAY_MS + MAX_DUR_MS;
    assert.ok(
        CONFETTI_DURATION_MS >= maxLifetimeMs,
        `CONFETTI_DURATION_MS (${CONFETTI_DURATION_MS}) must be >= ${maxLifetimeMs} to avoid abrupt particle unmount`,
    );
});

test("CONFETTI_DURATION_MS equals MAX_DELAY_MS + MAX_DUR_MS + 500ms buffer", () => {
    assert.equal(CONFETTI_DURATION_MS, MAX_DELAY_MS + MAX_DUR_MS + 500);
});
