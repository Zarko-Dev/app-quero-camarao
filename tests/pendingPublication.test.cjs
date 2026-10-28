const test = require("node:test");
const assert = require("node:assert");
const { setPendingPublication, takePendingPublication } = require("../src/utils/pendingPublication");

test("take returns id once then null", () => {
    setPendingPublication("abc");
    assert.strictEqual(takePendingPublication(), "abc");
    assert.strictEqual(takePendingPublication(), null);
});
