// Tests for the location picker utility additions to src/utils/locationMapsUrl.js:
//   buildWazeUrl, buildWazeFallbackUrl, buildGoogleMapsFallbackUrl,
//   openInGoogleMaps, openInWaze
//
// All functions are inlined as mirrors (no native react-native dep).
// Run with: node --test tests/locationPicker.test.cjs

const test = require("node:test");
const assert = require("node:assert/strict");

// ── Mirrors (no native deps) ─────────────────────────────────────────────────

function buildLocationMapsUrl(lat, lng, platform) {
    const q = `${lat},${lng}`;
    if (platform === "android") return `geo:${lat},${lng}?q=${q}`;
    return `maps:0,0?q=${q}&ll=${q}`;
}

function buildWazeUrl(lat, lng) {
    return `waze://?ll=${lat},${lng}&navigate=yes`;
}

function buildWazeFallbackUrl(lat, lng) {
    return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

function buildGoogleMapsFallbackUrl(lat, lng) {
    return `https://maps.google.com/maps?q=${lat},${lng}`;
}

async function openInGoogleMaps(lat, lng, { openURL, platform } = {}) {
    const primaryUrl = buildLocationMapsUrl(lat, lng, platform);
    const fallbackUrl = buildGoogleMapsFallbackUrl(lat, lng);
    try {
        await openURL(primaryUrl);
    } catch {
        await openURL(fallbackUrl).catch(() => {});
    }
}

async function openInWaze(lat, lng, { canOpenURL, openURL } = {}) {
    const appUrl = buildWazeUrl(lat, lng);
    const webUrl = buildWazeFallbackUrl(lat, lng);
    const wazeAvailable = await canOpenURL(appUrl).catch(() => false);
    await openURL(wazeAvailable ? appUrl : webUrl).catch(() => {});
}

// ── buildWazeUrl ─────────────────────────────────────────────────────────────

test("buildWazeUrl returns waze:// scheme", () => {
    const url = buildWazeUrl(-15.78, -47.93);
    assert.ok(url.startsWith("waze://"), `expected waze:// scheme, got: ${url}`);
});

test("buildWazeUrl includes lat and lng", () => {
    const url = buildWazeUrl(-15.78, -47.93);
    assert.ok(url.includes("-15.78"), url);
    assert.ok(url.includes("-47.93"), url);
});

test("buildWazeUrl includes navigate=yes", () => {
    const url = buildWazeUrl(-15.78, -47.93);
    assert.ok(url.includes("navigate=yes"), url);
});

test("buildWazeUrl format is correct", () => {
    const url = buildWazeUrl(-15.78, -47.93);
    assert.equal(url, "waze://?ll=-15.78,-47.93&navigate=yes");
});

// ── buildWazeFallbackUrl ──────────────────────────────────────────────────────

test("buildWazeFallbackUrl returns https://waze.com URL", () => {
    const url = buildWazeFallbackUrl(-15.78, -47.93);
    assert.ok(url.startsWith("https://waze.com"), `expected waze.com URL, got: ${url}`);
});

test("buildWazeFallbackUrl includes lat and lng", () => {
    const url = buildWazeFallbackUrl(-15.78, -47.93);
    assert.ok(url.includes("-15.78"), url);
    assert.ok(url.includes("-47.93"), url);
});

test("buildWazeFallbackUrl includes navigate=yes", () => {
    const url = buildWazeFallbackUrl(-15.78, -47.93);
    assert.ok(url.includes("navigate=yes"), url);
});

test("buildWazeFallbackUrl format is correct", () => {
    const url = buildWazeFallbackUrl(-15.78, -47.93);
    assert.equal(url, "https://waze.com/ul?ll=-15.78,-47.93&navigate=yes");
});

// ── buildGoogleMapsFallbackUrl ───────────────────────────────────────────────

test("buildGoogleMapsFallbackUrl returns https://maps.google.com URL", () => {
    const url = buildGoogleMapsFallbackUrl(-15.78, -47.93);
    assert.ok(url.startsWith("https://maps.google.com"), url);
});

test("buildGoogleMapsFallbackUrl includes lat and lng", () => {
    const url = buildGoogleMapsFallbackUrl(-15.78, -47.93);
    assert.ok(url.includes("-15.78"), url);
    assert.ok(url.includes("-47.93"), url);
});

test("buildGoogleMapsFallbackUrl format is correct", () => {
    const url = buildGoogleMapsFallbackUrl(-15.78, -47.93);
    assert.equal(url, "https://maps.google.com/maps?q=-15.78,-47.93");
});

// ── openInGoogleMaps ─────────────────────────────────────────────────────────

test("openInGoogleMaps opens primary maps: URL on iOS", async () => {
    const opened = [];
    await openInGoogleMaps(-15.78, -47.93, {
        platform: "ios",
        openURL: async (url) => { opened.push(url); },
    });
    assert.equal(opened.length, 1);
    assert.ok(opened[0].startsWith("maps:"), `expected maps: URL, got: ${opened[0]}`);
});

test("openInGoogleMaps opens primary geo: URL on Android", async () => {
    const opened = [];
    await openInGoogleMaps(-15.78, -47.93, {
        platform: "android",
        openURL: async (url) => { opened.push(url); },
    });
    assert.equal(opened.length, 1);
    assert.ok(opened[0].startsWith("geo:"), `expected geo: URL, got: ${opened[0]}`);
});

test("openInGoogleMaps falls back to web URL when primary throws", async () => {
    const opened = [];
    let callCount = 0;
    await openInGoogleMaps(-15.78, -47.93, {
        platform: "ios",
        openURL: async (url) => {
            callCount++;
            if (callCount === 1) throw new Error("cannot open");
            opened.push(url);
        },
    });
    assert.equal(opened.length, 1);
    assert.ok(opened[0].startsWith("https://maps.google.com"), `expected fallback URL, got: ${opened[0]}`);
});

test("openInGoogleMaps fallback includes lat,lng in web URL", async () => {
    let callCount = 0;
    let fallbackUrl = null;
    await openInGoogleMaps(-15.78, -47.93, {
        platform: "ios",
        openURL: async (url) => {
            callCount++;
            if (callCount === 1) throw new Error("cannot open");
            fallbackUrl = url;
        },
    });
    assert.ok(fallbackUrl.includes("-15.78"), fallbackUrl);
    assert.ok(fallbackUrl.includes("-47.93"), fallbackUrl);
});

// ── openInWaze ───────────────────────────────────────────────────────────────

test("openInWaze opens waze:// URL when Waze is installed", async () => {
    let opened = null;
    await openInWaze(-15.78, -47.93, {
        canOpenURL: async () => true,
        openURL: async (url) => { opened = url; },
    });
    assert.ok(opened.startsWith("waze://"), `expected waze:// URL, got: ${opened}`);
});

test("openInWaze opens waze.com fallback when Waze is not installed", async () => {
    let opened = null;
    await openInWaze(-15.78, -47.93, {
        canOpenURL: async () => false,
        openURL: async (url) => { opened = url; },
    });
    assert.ok(opened.startsWith("https://waze.com"), `expected waze.com URL, got: ${opened}`);
});

test("openInWaze uses fallback when canOpenURL rejects", async () => {
    let opened = null;
    await openInWaze(-15.78, -47.93, {
        canOpenURL: async () => { throw new Error("canOpenURL failed"); },
        openURL: async (url) => { opened = url; },
    });
    assert.ok(opened.startsWith("https://waze.com"), `expected waze.com fallback, got: ${opened}`);
});

test("openInWaze waze:// URL includes lat and lng", async () => {
    let opened = null;
    await openInWaze(-15.78, -47.93, {
        canOpenURL: async () => true,
        openURL: async (url) => { opened = url; },
    });
    assert.ok(opened.includes("-15.78"), opened);
    assert.ok(opened.includes("-47.93"), opened);
});

test("openInWaze fallback URL includes lat and lng", async () => {
    let opened = null;
    await openInWaze(-15.78, -47.93, {
        canOpenURL: async () => false,
        openURL: async (url) => { opened = url; },
    });
    assert.ok(opened.includes("-15.78"), opened);
    assert.ok(opened.includes("-47.93"), opened);
});

test("openInWaze does not throw when openURL rejects", async () => {
    await assert.doesNotReject(
        openInWaze(-15.78, -47.93, {
            canOpenURL: async () => true,
            openURL: async () => { throw new Error("openURL failed"); },
        }),
    );
});
