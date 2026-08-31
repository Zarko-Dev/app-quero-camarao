const test = require("node:test");
const assert = require("node:assert/strict");

const {
    configureDiscordAlertReporter,
    createDiscordAlertContext,
    reportDiscordError,
} = require("../src/services/DiscordAlerts/context");

test("context enables a fallback reporter before App configuration", async () => {
    const contextPath = require.resolve("../src/services/DiscordAlerts/context");
    const previousFetch = global.fetch;
    const calls = [];
    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return { ok: true };
    };

    try {
        delete require.cache[contextPath];
        const fallbackContext = require("../src/services/DiscordAlerts/context");

        assert.equal(await fallbackContext.reportDiscordError({
            source: "firebase.bootstrap",
            error: new Error("bootstrap failed"),
        }), true);
        assert.equal(calls.length, 1);
        assert.match(JSON.parse(calls[0].options.body).content, /route: unknown/);
    } finally {
        global.fetch = previousFetch;
        delete require.cache[contextPath];
    }
});

test("getUser uses Redux data before storage and normalizes user fields", async () => {
    let storageCalls = 0;
    const context = createDiscordAlertContext({
        store: {
            getState: () => ({
                login: {
                    dataUser: {
                        id: "redux-user",
                        name: "Pedro",
                        email: "pedro@test.com",
                        phone: "88999999999",
                    },
                },
            }),
        },
        getUserStorage: async () => {
            storageCalls += 1;
            return { id: "storage-user" };
        },
    });

    assert.deepEqual(await context.getUser(), {
        userId: "redux-user",
        userName: "Pedro",
        email: "pedro@test.com",
        phone: "88999999999",
    });
    assert.equal(storageCalls, 0);
});

test("getUser falls back to storage and accepts explicitly supplied users", async () => {
    const context = createDiscordAlertContext({
        store: { getState: () => ({ login: {} }) },
        getUserStorage: async () => ({ uid: "storage-user", fullName: "Ana" }),
    });

    assert.deepEqual(await context.getUser(), {
        userId: "storage-user",
        userName: "Ana",
        email: "unknown",
        phone: "unknown",
    });
    assert.deepEqual(await context.getUser({ userId: "explicit", email: "e@test.com" }), {
        userId: "explicit",
        userName: "unknown",
        email: "e@test.com",
        phone: "unknown",
    });
});

test("getRoute reads the current navigation route and safely falls back", () => {
    const activeContext = createDiscordAlertContext({
        navigationRef: { getCurrentRoute: () => ({ name: "PublicationChat" }) },
    });
    const fallbackContext = createDiscordAlertContext({ navigationRef: {} });

    assert.deepEqual(activeContext.getRoute(), { routeName: "PublicationChat" });
    assert.deepEqual(fallbackContext.getRoute(), { routeName: "unknown" });
});

test("context falls back to unknown when state, storage, or navigation fail", async () => {
    const context = createDiscordAlertContext({
        store: { getState: () => { throw new Error("state unavailable"); } },
        getUserStorage: async () => { throw new Error("storage unavailable"); },
        navigationRef: { getCurrentRoute: () => { throw new Error("navigation unavailable"); } },
    });

    assert.deepEqual(await context.getUser(), {
        userId: "unknown",
        userName: "unknown",
        email: "unknown",
        phone: "unknown",
    });
    assert.deepEqual(context.getRoute(), { routeName: "unknown" });
});

test("configured context shares a safe non-blocking reporter", async () => {
    const calls = [];
    configureDiscordAlertReporter({
        webhookUrl: "https://discord.test/context",
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return { ok: true };
        },
    });

    assert.equal(await reportDiscordError({ source: "context", error: new Error("boom") }), true);
    assert.equal(calls.length, 1);
});
