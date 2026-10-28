const { computeAggregate } = require("./ratingsAggregate");

describe("computeAggregate", () => {
    test("returns zeroed result for no ratings", () => {
        expect(computeAggregate([])).toEqual({ average: 0, count: 0 });
    });

    test("averages valid star values only", () => {
        expect(computeAggregate([{ stars: 5 }, { stars: 3 }, { stars: "invalid" }])).toEqual({
            average: 4,
            count: 2,
        });
    });
});
