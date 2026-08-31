const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

function getContent(calls) {
    return JSON.parse(calls[0][1].body).content;
}

describe("createDiscordFunctionAlertReporter", () => {
    test("formats the function error context without allowing mentions", async () => {
        const calls = [];
        const reporter = createDiscordFunctionAlertReporter({
            webhookUrl: "https://discord.test/webhook",
            fetchImpl: async (...args) => {
                calls.push(args);
                return { ok: true };
            },
            now: () => 1000,
        });
        const error = new Error("payment failed");
        error.stack = "Error: payment failed\n    at createPayment (paymentPix.js:8:3)";

        await expect(reporter.reportDiscordFunctionError({
            functionsEnv: "production",
            functionName: "paymentPix",
            userId: "user-1",
            email: "user@example.com",
            phone: "88999999999",
            requestPath: "/pix",
            eventId: "event-1",
            documentPath: "orders/order-1",
            error,
            extra: { orderId: "order-1" },
        })).resolves.toBe(true);

        expect(calls).toHaveLength(1);
        expect(calls[0][0]).toBe("https://discord.test/webhook");
        expect(calls[0][1]).toMatchObject({ method: "POST", headers: { "content-type": "application/json" } });
        expect(JSON.parse(calls[0][1].body).allowed_mentions).toEqual({ parse: [] });
        expect(getContent(calls)).toEqual(expect.stringContaining("env: production"));
        expect(getContent(calls)).toEqual(expect.stringContaining("function: paymentPix"));
        expect(getContent(calls)).toEqual(expect.stringContaining("userId: user-1"));
        expect(getContent(calls)).toEqual(expect.stringContaining("email: user@example.com"));
        expect(getContent(calls)).toEqual(expect.stringContaining("phone: 88999999999"));
        expect(getContent(calls)).toEqual(expect.stringContaining("requestPath: /pix"));
        expect(getContent(calls)).toEqual(expect.stringContaining("eventId: event-1"));
        expect(getContent(calls)).toEqual(expect.stringContaining("documentPath: orders/order-1"));
        expect(getContent(calls)).toEqual(expect.stringContaining("message: payment failed"));
        expect(getContent(calls)).toEqual(expect.stringContaining("paymentPix.js:8:3"));
        expect(getContent(calls)).toEqual(expect.stringContaining("orderId"));
    });

    test("uses safe defaults and the global fetch fallback", async () => {
        const originalFetch = global.fetch;
        const calls = [];
        global.fetch = async (...args) => {
            calls.push(args);
            return { ok: true };
        };

        try {
            const reporter = createDiscordFunctionAlertReporter({ webhookUrl: "https://discord.test/fallback" });
            await expect(reporter.reportDiscordFunctionError()).resolves.toBe(true);
            expect(getContent(calls)).toEqual(expect.stringContaining("function: unknown"));
            expect(getContent(calls)).toEqual(expect.stringContaining("message: unknown error"));
        } finally {
            global.fetch = originalFetch;
        }
    });

    test("deduplicates a successful event for 60 seconds", async () => {
        let currentTime = 1000;
        const fetchImpl = jest.fn(async () => ({ ok: true }));
        const reporter = createDiscordFunctionAlertReporter({ fetchImpl, now: () => currentTime });
        const alert = { functionName: "paymentPix", eventId: "event-1", error: new Error("failed") };

        await expect(reporter.reportDiscordFunctionError(alert)).resolves.toBe(true);
        await expect(reporter.reportDiscordFunctionError(alert)).resolves.toBe(false);
        expect(fetchImpl).toHaveBeenCalledTimes(1);

        currentTime += 60000;
        await expect(reporter.reportDiscordFunctionError(alert)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });

    test("safely serializes circular extra data and caps Discord content", async () => {
        const calls = [];
        const extra = { requestId: "request-1" };
        extra.self = extra;
        const reporter = createDiscordFunctionAlertReporter({
            fetchImpl: async (...args) => {
                calls.push(args);
                return { ok: true };
            },
        });

        await expect(reporter.reportDiscordFunctionError({
            functionName: "f".repeat(1000),
            eventId: "e".repeat(1000),
            error: Object.assign(new Error("m".repeat(1000)), { stack: "s".repeat(3000) }),
            extra,
        })).resolves.toBe(true);

        expect(getContent(calls).length).toBeLessThanOrEqual(2000);
        expect(getContent(calls)).toEqual(expect.stringContaining("message:"));
    });

    test("clears a failed HTTP reservation so the alert can retry", async () => {
        const fetchImpl = jest.fn()
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true });
        const reporter = createDiscordFunctionAlertReporter({ fetchImpl });
        const alert = { functionName: "paymentPix", eventId: "event-1", error: new Error("failed") };

        await expect(reporter.reportDiscordFunctionError(alert)).resolves.toBe(false);
        await expect(reporter.reportDiscordFunctionError(alert)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });

    test("swallows transport and collection failures", async () => {
        const reporter = createDiscordFunctionAlertReporter({ fetchImpl: async () => { throw new Error("network failed"); } });
        await expect(reporter.reportDiscordFunctionError({ error: new Error("failed") })).resolves.toBe(false);

        const serializationFailure = createDiscordFunctionAlertReporter({
            fetchImpl: async () => ({ ok: true }),
            now: () => { throw new Error("clock failed"); },
        });
        await expect(serializationFailure.reportDiscordFunctionError({ error: new Error("failed") })).resolves.toBe(false);
    });

    test("reserves the deduplication key while an identical request is in flight", async () => {
        let resolveFetch;
        const fetchPromise = new Promise((resolve) => { resolveFetch = resolve; });
        const fetchImpl = jest.fn(async () => fetchPromise);
        const reporter = createDiscordFunctionAlertReporter({ fetchImpl });
        const alert = { functionName: "paymentPix", eventId: "event-1", error: new Error("failed") };

        const first = reporter.reportDiscordFunctionError(alert);
        await expect(reporter.reportDiscordFunctionError(alert)).resolves.toBe(false);
        expect(fetchImpl).toHaveBeenCalledTimes(1);

        resolveFetch({ ok: true });
        await expect(first).resolves.toBe(true);
    });
});
