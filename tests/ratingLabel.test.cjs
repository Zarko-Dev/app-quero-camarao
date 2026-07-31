const test = require("node:test");
const assert = require("node:assert/strict");

const { formatRatingLabel } = require("../src/utils/ratingLabel");

test("formatRatingLabel shows 'Sem avaliações' for zero count", () => {
    assert.equal(formatRatingLabel(0, 0), "⭐ Sem avaliações");
});

test("formatRatingLabel shows 'Sem avaliações' for invalid count", () => {
    assert.equal(formatRatingLabel(4.5, null), "⭐ Sem avaliações");
    assert.equal(formatRatingLabel(4.5, undefined), "⭐ Sem avaliações");
    assert.equal(formatRatingLabel(4.5, NaN), "⭐ Sem avaliações");
    assert.equal(formatRatingLabel(4.5, -1), "⭐ Sem avaliações");
});

test("formatRatingLabel uses singular for one rating", () => {
    assert.equal(formatRatingLabel(5, 1), "⭐ 5,0 • 1 avaliação");
});

test("formatRatingLabel uses plural with comma decimal", () => {
    assert.equal(formatRatingLabel(4.8, 12), "⭐ 4,8 • 12 avaliações");
});

test("formatRatingLabel formats integer averages with one decimal", () => {
    assert.equal(formatRatingLabel(4, 3), "⭐ 4,0 • 3 avaliações");
});
