const test = require("node:test");
const assert = require("node:assert/strict");

const { computeAggregate } = require("../functions/src/ratingsAggregate");

test("computeAggregate returns zeros for empty array", () => {
    assert.deepEqual(computeAggregate([]), { average: 0, count: 0 });
});

test("computeAggregate returns zeros for null/undefined input", () => {
    assert.deepEqual(computeAggregate(null), { average: 0, count: 0 });
    assert.deepEqual(computeAggregate(undefined), { average: 0, count: 0 });
});

test("computeAggregate handles a single rating", () => {
    assert.deepEqual(computeAggregate([{ stars: 5 }]), { average: 5, count: 1 });
});

test("computeAggregate averages with one decimal place", () => {
    assert.deepEqual(
        computeAggregate([{ stars: 5 }, { stars: 4 }, { stars: 5 }]),
        { average: 4.7, count: 3 },
    );
});

test("computeAggregate filters out invalid stars values", () => {
    assert.deepEqual(
        computeAggregate([
            { stars: 0 },
            { stars: 6 },
            { stars: NaN },
            {},
            null,
            { stars: 4 },
            { stars: 2 },
        ]),
        { average: 3, count: 2 },
    );
});

test("computeAggregate returns zeros when all ratings are invalid", () => {
    assert.deepEqual(
        computeAggregate([{ stars: 0 }, { stars: 6 }, { stars: "abc" }, {}]),
        { average: 0, count: 0 },
    );
});
