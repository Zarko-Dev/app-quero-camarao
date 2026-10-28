# Discord Error Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Discord webhook error alerts to the Quero Camarao React Native app and Firebase Functions, including user and location context, without breaking existing flows.

**Architecture:** Create one focused alert helper for the mobile app and one for Firebase Functions. Wire each helper first through tests, then through a small set of high-value global and manual capture points so alerts are consistent, deduplicated, and non-blocking.

**Tech Stack:** React Native, Expo, Sentry, Firebase Functions v2, Node 20, Jest, Node test runner

---

### Task 1: App Discord Helper

**Files:**
- Create: `src/services/DiscordAlerts/index.js`
- Create: `tests/discordAlerts.test.cjs`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/discordAlerts.test.cjs`
Expected: FAIL because `src/services/DiscordAlerts/index.js` does not exist or does not export `createDiscordAlertReporter`

- [ ] **Step 3: Write minimal implementation**

```js
const DEFAULT_TTL_MS = 60_000;

function createDiscordAlertReporter(deps = {}) {
    const sent = new Map();
    const fetchImpl = deps.fetchImpl || global.fetch;
    const now = deps.now || Date.now;
    const getRoute = deps.getRoute || (() => ({ routeName: "unknown" }));
    const getUser = deps.getUser || (async () => ({ userId: "unknown", userName: "unknown", email: "unknown", phone: "unknown" }));

    async function reportDiscordError({ source = "app.unknown", error, feature = "unknown", action = "unknown", extra = {} }) {
        try {
            const route = getRoute() || {};
            const user = (await getUser()) || {};
            const message = error?.message || String(error || "unknown error");
            const dedupKey = `${source}:${route.routeName || "unknown"}:${message}`;

            if ((sent.get(dedupKey) || 0) + DEFAULT_TTL_MS > now()) {
                return false;
            }

            sent.set(dedupKey, now());

            const content = [
                "ERROR ALERT",
                `env: app`,
                `source: ${source}`,
                `feature: ${feature}`,
                `action: ${action}`,
                `route: ${route.routeName || "unknown"}`,
                `userId: ${user.userId || "unknown"}`,
                `userName: ${user.userName || "unknown"}`,
                `email: ${user.email || "unknown"}`,
                `phone: ${user.phone || "unknown"}`,
                `message: ${message}`,
                `stack: ${(error?.stack || "no-stack").slice(0, 1200)}`,
                `extra: ${JSON.stringify(extra).slice(0, 1200)}`,
            ].join("\n");

            await fetchImpl(deps.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            return true;
        } catch {
            return false;
        }
    }

    return { reportDiscordError };
}

module.exports = { createDiscordAlertReporter };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/discordAlerts.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/discordAlerts.test.cjs src/services/DiscordAlerts/index.js
git commit -m "feat: add app discord error alert helper"
```

### Task 2: App Context and Global Hook

**Files:**
- Create: `src/services/DiscordAlerts/context.js`
- Modify: `App.jsx`
- Modify: `src/services/Storage/UserStorage.js`
- Modify: `src/services/Firebase/index.js`
- Modify: `src/services/MercadoPago/createPixPayment.js`
- Modify: `src/services/MercadoPago/getOrder.js`

- [ ] **Step 1: Write the failing test**

```js
test("reporter dedups repeated errors inside ttl", async () => {
    const calls = [];
    const { createDiscordAlertReporter } = require("../src/services/DiscordAlerts");
    const reporter = createDiscordAlertReporter({
        webhookUrl: "https://discord.test/webhook",
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return { ok: true };
        },
        now: (() => {
            let current = 1000;
            return () => current;
        })(),
        getRoute: () => ({ routeName: "Home" }),
        getUser: async () => ({ userId: "u1" }),
    });

    await reporter.reportDiscordError({ source: "app.global", error: new Error("boom") });
    await reporter.reportDiscordError({ source: "app.global", error: new Error("boom") });

    assert.equal(calls.length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/discordAlerts.test.cjs`
Expected: FAIL because dedup behavior is not yet correct or not yet covered

- [ ] **Step 3: Write minimal implementation**

```js
// src/services/DiscordAlerts/context.js
const { navigationRef } = require("../../routes");
const { store } = require("../../store");
const { GetUserStorage } = require("../Storage/UserStorage");

async function getDiscordAlertUserContext(explicitUser = null) {
    if (explicitUser) return explicitUser;

    const state = store.getState();
    const loginData = state?.login?.dataUser || state?.login?.user || null;
    if (loginData) return loginData;

    return (await GetUserStorage()) || null;
}

function getDiscordAlertRouteContext() {
    return { routeName: navigationRef.getCurrentRoute?.()?.name || "unknown" };
}

module.exports = { getDiscordAlertUserContext, getDiscordAlertRouteContext };
```

```js
// App.jsx (shape only)
const { createDiscordAlertReporter } = require("./src/services/DiscordAlerts");
const { getDiscordAlertUserContext, getDiscordAlertRouteContext } = require("./src/services/DiscordAlerts/context");

const discordReporter = createDiscordAlertReporter({
    webhookUrl: "HARD_CODED_WEBHOOK",
    getRoute: getDiscordAlertRouteContext,
    getUser: getDiscordAlertUserContext,
});

const previousHandler = global.ErrorUtils?.getGlobalHandler?.();
global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    Sentry.captureException(error);
    discordReporter.reportDiscordError({
        source: "app.global",
        error,
        feature: "runtime",
        action: isFatal ? "fatal" : "non-fatal",
    });
    if (previousHandler) previousHandler(error, isFatal);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/discordAlerts.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add App.jsx src/services/DiscordAlerts/context.js src/services/Storage/UserStorage.js src/services/Firebase/index.js src/services/MercadoPago/createPixPayment.js src/services/MercadoPago/getOrder.js tests/discordAlerts.test.cjs
git commit -m "feat: wire app discord alerts into global and critical flows"
```

### Task 3: Functions Discord Helper

**Files:**
- Create: `functions/src/discordAlerts.js`
- Create: `functions/src/discordAlerts.test.js`

- [ ] **Step 1: Write the failing test**

```js
test("reportDiscordFunctionError formats function and user fields", async () => {
    const calls = [];
    const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

    const reporter = createDiscordFunctionAlertReporter({
        webhookUrl: "https://discord.test/webhook",
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return { ok: true };
        },
        now: () => 1000,
    });

    await reporter.reportDiscordFunctionError({
        functionName: "paymentpix",
        error: new Error("payment failed"),
        userId: "u9",
        email: "buyer@test.com",
        eventId: "evt-1",
    });

    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0].options.body).content).toContain("paymentpix");
    expect(JSON.parse(calls[0].options.body).content).toContain("u9");
    expect(JSON.parse(calls[0].options.body).content).toContain("payment failed");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- discordAlerts.test.js`
Expected: FAIL because helper does not exist

- [ ] **Step 3: Write minimal implementation**

```js
const DEFAULT_TTL_MS = 60_000;

function createDiscordFunctionAlertReporter(deps = {}) {
    const sent = new Map();
    const fetchImpl = deps.fetchImpl || global.fetch;
    const now = deps.now || Date.now;

    async function reportDiscordFunctionError({
        functionName = "unknown",
        error,
        userId = "unknown",
        email = "unknown",
        phone = "unknown",
        requestPath = "unknown",
        eventId = "unknown",
        documentPath = "unknown",
        extra = {},
    }) {
        try {
            const message = error?.message || String(error || "unknown error");
            const dedupKey = `${functionName}:${message}:${eventId}`;

            if ((sent.get(dedupKey) || 0) + DEFAULT_TTL_MS > now()) {
                return false;
            }

            sent.set(dedupKey, now());

            const content = [
                "ERROR ALERT",
                `env: functions`,
                `function: ${functionName}`,
                `userId: ${userId}`,
                `email: ${email}`,
                `phone: ${phone}`,
                `requestPath: ${requestPath}`,
                `eventId: ${eventId}`,
                `documentPath: ${documentPath}`,
                `message: ${message}`,
                `stack: ${(error?.stack || "no-stack").slice(0, 1200)}`,
                `extra: ${JSON.stringify(extra).slice(0, 1200)}`,
            ].join("\n");

            await fetchImpl(deps.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            return true;
        } catch {
            return false;
        }
    }

    return { reportDiscordFunctionError };
}

module.exports = { createDiscordFunctionAlertReporter };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- discordAlerts.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add functions/src/discordAlerts.js functions/src/discordAlerts.test.js
git commit -m "feat: add functions discord error alert helper"
```

### Task 4: Functions Instrumentation

**Files:**
- Modify: `functions/src/index.js`
- Modify: `functions/src/paymentPix.js`
- Modify: `functions/src/paymentWebhook.js`
- Modify: `functions/src/chatNotifications.js`
- Modify: `functions/src/reminders.js`

- [ ] **Step 1: Write the failing test**

```js
test("function alert helper swallows webhook transport failures", async () => {
    const { createDiscordFunctionAlertReporter } = require("./discordAlerts");
    const reporter = createDiscordFunctionAlertReporter({
        webhookUrl: "https://discord.test/webhook",
        fetchImpl: async () => {
            throw new Error("network down");
        },
    });

    await expect(reporter.reportDiscordFunctionError({
        functionName: "paymentwebhook",
        error: new Error("handler failed"),
    })).resolves.toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- discordAlerts.test.js`
Expected: FAIL until helper and transport-failure behavior are finalized

- [ ] **Step 3: Write minimal implementation**

```js
// inside each top-level catch
await reportDiscordFunctionError({
    functionName: "paymentwebhook",
    error,
    userId: req?.body?.userId || req?.body?.buyerId || req?.body?.sellerId || "unknown",
    email: req?.body?.email || "unknown",
    phone: req?.body?.phone || "unknown",
    requestPath: req?.path || "unknown",
    eventId: req?.body?.id || req?.body?.eventId || "unknown",
    extra: { bodyKeys: Object.keys(req?.body || {}) },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- discordAlerts.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add functions/src/index.js functions/src/paymentPix.js functions/src/paymentWebhook.js functions/src/chatNotifications.js functions/src/reminders.js functions/src/discordAlerts.test.js
git commit -m "feat: wire functions discord alerts into top-level handlers"
```

### Task 5: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run app focused tests**

Run: `node --test tests/discordAlerts.test.cjs`
Expected: PASS

- [ ] **Step 2: Run existing high-signal app tests**

Run: `npm run test:unit -- tests/chatSessionState.test.cjs tests/sendLocationMessage.test.cjs`
Expected: PASS

- [ ] **Step 3: Run functions focused tests**

Run: `cd functions && npm test -- discordAlerts.test.js`
Expected: PASS

- [ ] **Step 4: Run full functions Jest if time stays reasonable**

Run: `cd functions && npm test`
Expected: PASS

- [ ] **Step 5: Inspect git diff before resuming release work**

Run: `git status --short`
Expected: only intended files added or modified for Discord alerts plus pre-existing unrelated dirty files
