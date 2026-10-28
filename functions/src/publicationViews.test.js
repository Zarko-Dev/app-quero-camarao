const { handlePublicationViewWritten } = require("./publicationViews");

const buildDb = () => {
    const rollupSets = [];
    const monthsSets = [];
    return {
        rollupSets,
        monthsSets,
        collection: (name) => {
            if (name === "publicationViewsRollup") {
                return {
                    doc: (monthKey) => ({
                        set: async (value, opts) => rollupSets.push({ monthKey, value, opts }),
                    }),
                };
            }
            if (name === "stats") {
                return {
                    doc: (id) => ({
                        set: async (value, opts) => monthsSets.push({ id, value, opts }),
                    }),
                };
            }
            throw new Error(`unexpected collection ${name}`);
        },
    };
};

const buildEvent = (beforeViews, afterViews, extra = {}) => ({
    data: {
        before: beforeViews === null ? undefined : { data: () => ({ views: beforeViews }) },
        after: { data: () => ({ views: afterViews, publicationId: "pub1", location: "Aracati/CE", ...extra }) },
    },
});

describe("handlePublicationViewWritten", () => {
    test("does nothing when no new views were appended", async () => {
        const db = buildDb();
        const views = [{ createdAt: { seconds: 1 } }];
        await handlePublicationViewWritten(buildEvent(views, views), db);
        expect(db.rollupSets).toHaveLength(0);
    });

    test("does nothing when the doc was deleted", async () => {
        const db = buildDb();
        const event = { data: { before: { data: () => ({ views: [] }) }, after: undefined } };
        await handlePublicationViewWritten(event, db);
        expect(db.rollupSets).toHaveLength(0);
    });

    test("increments the rollup for a brand new log doc (no before)", async () => {
        const db = buildDb();
        const createdAt = { seconds: new Date(2026, 7, 3, 10).getTime() / 1000 };
        await handlePublicationViewWritten(buildEvent(null, [{ createdAt }]), db);

        expect(db.rollupSets).toHaveLength(1);
        expect(db.rollupSets[0].monthKey).toBe("2026-08");
        expect(db.rollupSets[0].opts).toEqual({ merge: true });
        expect(db.rollupSets[0].value.byPublication.pub1.label).toBe("Aracati/CE");
        expect(db.monthsSets[0].value.months).toBeDefined();
    });

    test("only increments for the newly appended entries, spanning months if needed", async () => {
        const db = buildDb();
        const before = [{ createdAt: { seconds: new Date(2026, 6, 20).getTime() / 1000 } }];
        const after = [
            ...before,
            { createdAt: { seconds: new Date(2026, 7, 1, 8).getTime() / 1000 } },
            { createdAt: { seconds: new Date(2026, 7, 2, 9).getTime() / 1000 } },
        ];
        await handlePublicationViewWritten(buildEvent(before, after), db);

        expect(db.rollupSets).toHaveLength(1);
        expect(db.rollupSets[0].monthKey).toBe("2026-08");
    });
});
