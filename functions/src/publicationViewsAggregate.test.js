const { monthKeyOf, diffNewViews, groupNewViewsByMonth } = require("./publicationViewsAggregate");

describe("monthKeyOf", () => {
    test("pads single-digit month", () => {
        expect(monthKeyOf(new Date(2026, 0, 15))).toBe("2026-01");
        expect(monthKeyOf(new Date(2026, 10, 3))).toBe("2026-11");
    });
});

describe("diffNewViews", () => {
    test("returns only entries appended after the previous length", () => {
        const before = [{ a: 1 }, { a: 2 }];
        const after = [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }];
        expect(diffNewViews(before, after)).toEqual([{ a: 3 }, { a: 4 }]);
    });

    test("treats missing before as a brand new doc", () => {
        const after = [{ a: 1 }];
        expect(diffNewViews(undefined, after)).toEqual([{ a: 1 }]);
    });

    test("returns empty when nothing was appended", () => {
        const before = [{ a: 1 }, { a: 2 }];
        expect(diffNewViews(before, before)).toEqual([]);
    });
});

describe("groupNewViewsByMonth", () => {
    test("groups by month, counting daily and hourly buckets", () => {
        const entries = [
            { createdAt: { seconds: new Date(2026, 7, 3, 14).getTime() / 1000 } },
            { createdAt: { seconds: new Date(2026, 7, 3, 14).getTime() / 1000 } },
            { createdAt: { seconds: new Date(2026, 7, 5, 9).getTime() / 1000 } },
            { createdAt: { seconds: new Date(2026, 8, 1, 9).getTime() / 1000 } },
        ];

        const result = groupNewViewsByMonth(entries);

        expect(Object.keys(result).sort()).toEqual(["2026-08", "2026-09"]);
        expect(result["2026-08"].total).toBe(3);
        expect(result["2026-08"].daily["03"]).toBe(2);
        expect(result["2026-08"].daily["05"]).toBe(1);
        expect(result["2026-08"].hourly["14"]).toBe(2);
        expect(result["2026-08"].hourly["09"]).toBe(1);
        expect(result["2026-09"].total).toBe(1);
    });

    test("ignores entries with no parseable createdAt", () => {
        expect(groupNewViewsByMonth([{ createdAt: null }, {}])).toEqual({});
    });
});
