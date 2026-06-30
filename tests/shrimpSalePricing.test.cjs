const test = require("node:test");
const assert = require("node:assert/strict");

const {
    calculateShrimpSalePrice,
    formatPriceValue,
    parseDecimalValue,
} = require("../src/utils/shrimpSalePricing");

test("parseDecimalValue handles comma and dot values", () => {
    assert.equal(parseDecimalValue("20,5"), 20.5);
    assert.equal(parseDecimalValue("20.5"), 20.5);
    assert.equal(parseDecimalValue("20"), 20);
});

test("calculateShrimpSalePrice uses 10g table price as base", () => {
    assert.equal(calculateShrimpSalePrice("20", "12"), 22);
    assert.equal(calculateShrimpSalePrice("20,50", "12"), 22.5);
    assert.equal(calculateShrimpSalePrice("20", "8"), 18);
});

test("formatPriceValue returns pt-BR money format", () => {
    assert.equal(formatPriceValue("22"), "22,00");
    assert.equal(formatPriceValue(22.5), "22,50");
});
