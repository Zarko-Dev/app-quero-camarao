const test = require("node:test");
const assert = require("node:assert/strict");

const { createDiscordAlertReporter } = require("../src/services/DiscordAlerts");

function readBody(calls) {
    return JSON.parse(calls[0].options.body);
}

test("reportDiscordError formats the full alert payload", async () => {
    const calls = [];
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
    const error = new Error("send failed");
    error.stack = "Error: send failed\n    at sendMessage (chat.js:10:2)";

    const result = await reporter.reportDiscordError({
        source: "chat.send",
        error,
        feature: "chat",
        action: "sendMessage",
        extra: { requestId: "r1" },
    });

    assert.equal(result, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://discord.test/webhook");
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers["content-type"], "application/json");
    const body = readBody(calls);
    assert.match(body.content, /source: chat\.send/);
    assert.match(body.content, /feature: chat/);
    assert.match(body.content, /action: sendMessage/);
    assert.match(body.content, /route: PublicationChat/);
    assert.match(body.content, /userId: u1/);
    assert.match(body.content, /userName: Pedro/);
    assert.match(body.content, /email: p@test\.com/);
    assert.match(body.content, /phone: 88999999999/);
    assert.match(body.content, /message: send failed/);
    assert.match(body.content, /stack: Error: send failed/);
    assert.match(body.content, /chat\.js:10:2/);
    assert.match(body.content, /extra: .*requestId.*r1/);
});

test("createDiscordAlertReporter supports missing dependencies and global fetch", async () => {
    assert.equal(typeof createDiscordAlertReporter().reportDiscordError, "function");

    const previousFetch = global.fetch;
    const calls = [];
    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return { ok: true };
    };

    try {
        const reporter = createDiscordAlertReporter({ webhookUrl: "https://discord.test/fallback" });
        assert.equal(await reporter.reportDiscordError({ source: "fallback", error: new Error("boom") }), true);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "https://discord.test/fallback");
    } finally {
        global.fetch = previousFetch;
    }
});

test("reportDiscordError deduplicates the same alert for 60 seconds", async () => {
    let currentTime = 1000;
    let calls = 0;
    const reporter = createDiscordAlertReporter({
        fetchImpl: async () => {
            calls += 1;
            return { ok: true };
        },
        now: () => currentTime,
        getRoute: () => ({ routeName: "PublicationChat" }),
    });
    const alert = { source: "chat.send", error: new Error("send failed") };

    assert.equal(await reporter.reportDiscordError(alert), true);
    assert.equal(await reporter.reportDiscordError(alert), false);
    assert.equal(calls, 1);

    currentTime += 60000;
    assert.equal(await reporter.reportDiscordError(alert), true);
    assert.equal(calls, 2);
});

test("reportDiscordError returns false when collection or transport fails", async () => {
    const routeFailure = createDiscordAlertReporter({ getRoute: () => { throw new Error("route failed"); } });
    assert.equal(await routeFailure.reportDiscordError({ source: "route", error: new Error("boom") }), false);

    const userFailure = createDiscordAlertReporter({ getUser: async () => { throw new Error("user failed"); } });
    assert.equal(await userFailure.reportDiscordError({ source: "user", error: new Error("boom") }), false);

    const transportFailure = createDiscordAlertReporter({ fetchImpl: async () => { throw new Error("network failed"); } });
    assert.equal(await transportFailure.reportDiscordError({ source: "transport", error: new Error("boom") }), false);
});

test("reportDiscordError safely serializes circular and long extra data", async () => {
    const calls = [];
    const extra = { requestId: "r1", nested: {} };
    extra.nested.circular = extra;
    extra.long = "x".repeat(2000);
    const reporter = createDiscordAlertReporter({
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return { ok: true };
        },
    });

    assert.equal(await reporter.reportDiscordError({ source: "extra", error: new Error("boom"), extra }), true);
    const content = readBody(calls).content;
    const extraLine = content.split("\n").find((line) => line.startsWith("extra: "));
    assert.ok(extraLine);
    assert.match(extraLine, /unserializable|circular|requestId/);
    assert.ok(extraLine.length <= 1207);
});
