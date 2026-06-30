const test = require("node:test");
const assert = require("node:assert/strict");

const { sanitizeDecimalInput } = require("../src/utils/sanitizeDecimalInput");

test("sanitizeDecimalInput keeps only digits and one decimal separator", () => {
    assert.equal(sanitizeDecimalInput("12a3,4b5", 2), "123,45");
    assert.equal(sanitizeDecimalInput("12.3.4", 2), "12,34");
});

test("sanitizeDecimalInput limits grammage to two decimal places", () => {
    assert.equal(sanitizeDecimalInput("123,4567", 2), "123,45");
});

test("sanitizeDecimalInput limits kilo to one decimal place", () => {
    assert.equal(sanitizeDecimalInput("123,4567", 1), "123,4");
});

test("sanitizeDecimalInput returns integer when there is no decimal separator", () => {
    assert.equal(sanitizeDecimalInput("1234", 2), "1234");
});

test("sanitizeDecimalInput caps values above 40 reais for table price", () => {
    assert.equal(sanitizeDecimalInput("40,01", 2, 40), "40,00");
    assert.equal(sanitizeDecimalInput("41", 2, 40), "40,00");
    assert.equal(sanitizeDecimalInput("39,99", 2, 40), "39,99");
});
