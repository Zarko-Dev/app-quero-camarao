const { handleAdminDashboardMetrics } = require("./adminDashboardMetrics");

describe("adminDashboardMetrics", () => {
    test("returns error when user is not admin", async () => {
        const db = {
            collection: (name) => {
                if (name === "users") {
                    return {
                        doc: (email) => ({
                            get: async () => ({
                                exists: true,
                                data: () => ({ rules: ["User"] }),
                            }),
                        }),
                    };
                }
                if (name === "orders") {
                    return {
                        where: () => ({ get: async () => ({ docs: [] }) }),
                        get: async () => ({ docs: [] }),
                    };
                }
                throw new Error(`unexpected collection ${name}`);
            },
        };

        const request = {
            auth: { token: { email: "user@example.com" } },
            data: {},
        };

        const result = await handleAdminDashboardMetrics(request, db);

        expect(result.error).toBe(true);
        expect(result.data).toBeNull();
    });

    test("returns metrics for admin user with approved orders", async () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-01-15T03:00:00Z"), status: "approved" },
            { paymentValue: 200, createdAt: new Date("2025-01-20T03:00:00Z"), status: "approved" },
            { paymentValue: 150, createdAt: new Date("2025-02-10T03:00:00Z"), status: "approved" },
            { paymentValue: 300, createdAt: new Date("2025-02-15T03:00:00Z"), status: "approved" },
            { paymentValue: 50, createdAt: new Date("2025-03-01T03:00:00Z"), status: "approved" },
        ];

        const db = {
            collection: (name) => {
                if (name === "users") {
                    return {
                        doc: (email) => ({
                            get: async () => ({
                                exists: true,
                                data: () => ({ rules: ["Admin"] }),
                            }),
                        }),
                    };
                }
                if (name === "orders") {
                    return {
                        where: (field, op, value) => {
                            if (field === "status" && op === "==" && value === "approved") {
                                return {
                                    get: async () => ({
                                        docs: orders.map((o) => ({ data: () => o })),
                                    }),
                                };
                            }
                            return { get: async () => ({ docs: orders.map((o) => ({ data: () => o })) }) };
                        },
                        get: async () => ({ docs: orders.map((o) => ({ data: () => o })) }),
                    };
                }
                throw new Error(`unexpected collection ${name}`);
            },
        };

        const request = {
            auth: { token: { email: "admin@example.com" } },
            data: {},
        };

        const result = await handleAdminDashboardMetrics(request, db);

        expect(result.error).toBe(false);
        expect(result.data.totalRevenue).toBe(800);
        expect(result.data.averageTicket).toBe(160);
        expect(result.data.statusCounts).toEqual({ approved: 5 });
        expect(result.data.monthly).toEqual([
            { month: "2025-01", revenue: 300 },
            { month: "2025-02", revenue: 450 },
            { month: "2025-03", revenue: 50 },
        ]);
    });

    test("handles empty approved orders", async () => {
        const db = {
            collection: (name) => {
                if (name === "users") {
                    return {
                        doc: (email) => ({
                            get: async () => ({
                                exists: true,
                                data: () => ({ rules: ["Admin"] }),
                            }),
                        }),
                    };
                }
                if (name === "orders") {
                    return {
                        where: () => ({ get: async () => ({ docs: [] }) }),
                        get: async () => ({ docs: [] }),
                    };
                }
                throw new Error(`unexpected collection ${name}`);
            },
        };

        const request = {
            auth: { token: { email: "admin@example.com" } },
            data: {},
        };

        const result = await handleAdminDashboardMetrics(request, db);

        expect(result.error).toBe(false);
        expect(result.data.totalRevenue).toBe(0);
        expect(result.data.averageTicket).toBe(0);
        expect(result.data.monthly).toEqual([]);
    });
});