const assert = require("node:assert/strict");
const test = require("node:test");

const { timestampToDate } = require("../src/utils/timestampToDate");

test("converte os formatos de timestamp sem gerar NaN", () => {
    const ms = Date.UTC(2026, 9, 22, 12, 0, 0);
    assert.equal(timestampToDate({ seconds: ms / 1000 }).getTime(), ms);
    assert.equal(timestampToDate({ _seconds: ms / 1000 }).getTime(), ms);
    assert.equal(timestampToDate({ toDate: () => new Date(ms) }).getTime(), ms);
    assert.equal(timestampToDate(new Date(ms)).getTime(), ms);
    assert.equal(timestampToDate(ms).getTime(), ms);
    assert.equal(timestampToDate(undefined), null);
    assert.equal(timestampToDate({}), null);
});
