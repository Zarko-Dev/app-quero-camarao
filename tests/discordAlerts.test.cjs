const test = require("node:test");
const assert = require("node:assert/strict");

test("reportDiscordError formats route and user fields", async () => {
    const calls = [];
    const { createDiscordAlertReporter } = require("../src/services/DiscordAlerts");

    const reporter = createDiscordAlertReporter({
        webhookUrl: "https://discord.test/webhook",
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return { ok: true };
        },
        now: () => 1000,
        getRoute: () => ({ routeName: "PublicationChat" }),
        getUser: async () => ({ userId: "u1", userName: "Pedro", email: "p@test.com", phone: "88999999999" }),
    });

    await reporter.reportDiscordError({
        source: "chat.send",
        error: new Error("send failed"),
        feature: "chat",
        action: "sendMessage",
    });

    assert.equal(calls.length, 1);
    const body = JSON.parse(calls[0].options.body);
    assert.match(body.content, /PublicationChat/);
    assert.match(body.content, /Pedro/);
    assert.match(body.content, /send failed/);
});
