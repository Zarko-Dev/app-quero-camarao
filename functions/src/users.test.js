const { handleUserWritten } = require("./users");

describe("handleUserWritten", () => {
    test("recomputes the full summary and writes it to stats/usersSummary", async () => {
        const users = [
            { userType: "productor", address: { state: "CE", city: "Aracati" } },
            { userType: "client", address: { state: "CE", city: "Russas" } },
        ];
        const setCalls = [];
        const db = {
            collection: (name) => {
                if (name === "users") {
                    return { get: async () => ({ docs: users.map((u) => ({ data: () => u })) }) };
                }
                if (name === "stats") {
                    return {
                        doc: (id) => ({
                            set: async (value) => setCalls.push({ id, value }),
                        }),
                    };
                }
                throw new Error(`unexpected collection ${name}`);
            },
        };

        const summary = await handleUserWritten(db);

        expect(summary.total).toBe(2);
        expect(setCalls).toHaveLength(1);
        expect(setCalls[0].id).toBe("usersSummary");
        expect(setCalls[0].value).toEqual(summary);
    });
});
