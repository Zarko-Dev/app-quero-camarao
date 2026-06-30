const test = require("node:test");
const assert = require("node:assert/strict");

const { sanitizeGrammageInput } = require("../src/utils/sanitizeGrammageInput");

test("sanitizeGrammageInput keeps decimals and respects the limit", () => {
    assert.deepEqual(sanitizeGrammageInput("12,345"), {
        value: "12,34",
        exceeded: false,
    });
});

test("sanitizeGrammageInput clamps values above 70g", () => {
    assert.deepEqual(sanitizeGrammageInput("100"), {
        value: "70,00",
        exceeded: true,
    });
});
