const test = require("node:test");
const assert = require("node:assert/strict");

const { isProductionStatus } = require("../src/utils/isProductionStatus");

test("isProductionStatus accepts only the production status", () => {
    assert.equal(isProductionStatus("production"), true);
    assert.equal(isProductionStatus("development"), false);
    assert.equal(isProductionStatus(""), false);
    assert.equal(isProductionStatus(undefined), false);
});
