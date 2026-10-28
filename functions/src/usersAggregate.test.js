const { computeUsersSummary } = require("./usersAggregate");

describe("computeUsersSummary", () => {
    test("empty list", () => {
        expect(computeUsersSummary([])).toEqual({ total: 0, byUserType: {}, byState: [] });
    });

    test("counts by userType and groups by state/city", () => {
        const users = [
            { userType: "productor", address: { state: "CE", city: "Aracati" } },
            { userType: "client", address: { state: "CE", city: "Aracati" } },
            { userType: "client", address: { state: "CE", city: "Russas" } },
            { userType: "productor", address: { state: "SP", city: "Santos" } },
        ];
        const summary = computeUsersSummary(users);

        expect(summary.total).toBe(4);
        expect(summary.byUserType).toEqual({ productor: 2, client: 2 });

        const ce = summary.byState.find((s) => s.state === "CE");
        expect(ce.count).toBe(3);
        expect(ce.cities).toEqual(
            expect.arrayContaining([
                { city: "Aracati", count: 2 },
                { city: "Russas", count: 1 },
            ]),
        );

        const sp = summary.byState.find((s) => s.state === "SP");
        expect(sp.count).toBe(1);
    });

    test("missing state/city falls back to Não Identificado and sorts last", () => {
        const users = [
            { userType: "client", address: {} },
            { userType: "client", address: { state: "AC" } },
        ];
        const summary = computeUsersSummary(users);
        expect(summary.byState.map((s) => s.state)).toEqual(["AC", "Não Identificado"]);
    });

    test("falls back to top-level state/city when address is absent", () => {
        const users = [{ userType: "productor", state: "BA", city: "Salvador" }];
        const summary = computeUsersSummary(users);
        expect(summary.byState[0]).toMatchObject({ state: "BA" });
        expect(summary.byState[0].cities[0]).toMatchObject({ city: "Salvador" });
    });
});
