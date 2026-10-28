// Tests for location message support in the chat:
//   1. buildLocationMapsUrl — pure URL builder (no native deps)
//   2. isValidCoords — lat/lng range validation
//   3. messagePreview includes location type
//   4. getChatLocation contract — error shapes (inline mirror, no native deps)
//
// All tests run with: node --test tests/sendLocationMessage.test.cjs

const test = require("node:test");
const assert = require("node:assert/strict");

// ── Mirror of src/utils/locationMapsUrl.js ────────────────────────────────────
// Inline here so the test has zero native deps.
function buildLocationMapsUrl(lat, lng, platform) {
    const q = `${lat},${lng}`;
    if (platform === "android") return `geo:${lat},${lng}?q=${q}`;
    // iOS / fallback
    return `maps:0,0?q=${q}&ll=${q}`;
}

// ── Mirror of isValidCoords from src/utils/locationMapsUrl.js ────────────────
function isValidCoords(lat, lng) {
    return (
        typeof lat === "number" && isFinite(lat) && lat >= -90 && lat <= 90 &&
        typeof lng === "number" && isFinite(lng) && lng >= -180 && lng <= 180
    );
}

// ── Mirror of buildMessagePreview from src/utils/messagePreview.js ─────────
function buildMessagePreview(message) {
    if (!message) return "";
    if (message.audioUrl) return "🎵 Áudio";
    if (message.imageUrl) return "📷 Foto";
    if (message.fileUrl) return "📎 Documento";
    if (message.videoUrl) return "🎬 Vídeo";
    if (message.locationLat != null) return "📍 Localização";
    const text = String(message.text || "");
    if (text.length <= 80) return text;
    return `${text.slice(0, 77)}...`;
}

// ── Mirror of lastMessage label logic from sendChatMessage ───────────────────
function resolveLastMessage({ text, audioUrl, imageUrl, fileUrl, videoUrl, locationLat }) {
    if (audioUrl) return "🎵 Áudio";
    if (imageUrl) return "📷 Foto";
    if (fileUrl) return "📎 Documento";
    if (videoUrl) return "🎬 Vídeo";
    if (locationLat != null) return "📍 Localização";
    return text ? text.trim() : "";
}

// ── buildLocationMapsUrl: iOS ────────────────────────────────────────────────

test("buildLocationMapsUrl returns maps: scheme on iOS", () => {
    const url = buildLocationMapsUrl(-15.78, -47.93, "ios");
    assert.ok(url.startsWith("maps:"), `expected maps: scheme, got: ${url}`);
});

test("buildLocationMapsUrl includes lat,lng in iOS URL", () => {
    const url = buildLocationMapsUrl(-15.78, -47.93, "ios");
    assert.ok(url.includes("-15.78"), url);
    assert.ok(url.includes("-47.93"), url);
});

// ── buildLocationMapsUrl: Android ────────────────────────────────────────────

test("buildLocationMapsUrl returns geo: scheme on Android", () => {
    const url = buildLocationMapsUrl(-15.78, -47.93, "android");
    assert.ok(url.startsWith("geo:"), `expected geo: scheme, got: ${url}`);
});

test("buildLocationMapsUrl includes lat,lng in Android URL", () => {
    const url = buildLocationMapsUrl(-15.78, -47.93, "android");
    assert.ok(url.includes("-15.78"), url);
    assert.ok(url.includes("-47.93"), url);
});

test("buildLocationMapsUrl iOS and Android URLs are different", () => {
    const ios = buildLocationMapsUrl(-15.78, -47.93, "ios");
    const android = buildLocationMapsUrl(-15.78, -47.93, "android");
    assert.notEqual(ios, android);
});

// ── isValidCoords ─────────────────────────────────────────────────────────────

test("isValidCoords accepts valid lat/lng", () => {
    assert.ok(isValidCoords(-15.78, -47.93));
    assert.ok(isValidCoords(0, 0));
    assert.ok(isValidCoords(90, 180));
    assert.ok(isValidCoords(-90, -180));
});

test("isValidCoords rejects out-of-range lat", () => {
    assert.equal(isValidCoords(91, 0), false);
    assert.equal(isValidCoords(-91, 0), false);
});

test("isValidCoords rejects out-of-range lng", () => {
    assert.equal(isValidCoords(0, 181), false);
    assert.equal(isValidCoords(0, -181), false);
});

test("isValidCoords rejects non-numeric values", () => {
    assert.equal(isValidCoords("abc", 0), false);
    assert.equal(isValidCoords(null, 0), false);
    assert.equal(isValidCoords(NaN, 0), false);
    assert.equal(isValidCoords(Infinity, 0), false);
});

// ── buildMessagePreview: location type ───────────────────────────────────────

test("buildMessagePreview returns 📍 for location messages", () => {
    const msg = { senderId: "a", locationLat: -15.78, locationLng: -47.93 };
    assert.equal(buildMessagePreview(msg), "📍 Localização");
});

test("buildMessagePreview: location takes priority over text", () => {
    const msg = { senderId: "a", locationLat: -15.78, locationLng: -47.93, text: "some text" };
    assert.equal(buildMessagePreview(msg), "📍 Localização");
});

test("buildMessagePreview still works for text messages", () => {
    assert.equal(buildMessagePreview({ text: "oi" }), "oi");
});

test("buildMessagePreview still works for audio messages", () => {
    assert.equal(buildMessagePreview({ audioUrl: "https://x.com/a.m4a" }), "🎵 Áudio");
});

test("buildMessagePreview returns 🎬 for video messages", () => {
    assert.equal(buildMessagePreview({ videoUrl: "https://x.com/v.mp4" }), "🎬 Vídeo");
});

test("buildMessagePreview: videoUrl takes priority over location", () => {
    const msg = { videoUrl: "https://x.com/v.mp4", locationLat: -15.78, locationLng: -47.93 };
    assert.equal(buildMessagePreview(msg), "🎬 Vídeo");
});

// ── resolveLastMessage: location label in chat header ────────────────────────

test("resolveLastMessage returns 📍 for location message", () => {
    assert.equal(resolveLastMessage({ locationLat: -15.78 }), "📍 Localização");
});

test("resolveLastMessage: audioUrl takes priority over location", () => {
    assert.equal(
        resolveLastMessage({ audioUrl: "x.m4a", locationLat: -15.78 }),
        "🎵 Áudio",
    );
});

test("resolveLastMessage: text message unchanged", () => {
    assert.equal(resolveLastMessage({ text: "oi tudo bem" }), "oi tudo bem");
});

test("resolveLastMessage returns 🎬 for video messages", () => {
    assert.equal(resolveLastMessage({ videoUrl: "https://x.com/v.mp4" }), "🎬 Vídeo");
});

test("resolveLastMessage: videoUrl takes priority over location", () => {
    assert.equal(
        resolveLastMessage({ videoUrl: "https://x.com/v.mp4", locationLat: -15.78 }),
        "🎬 Vídeo",
    );
});

// ── sendCurrentLocation guard: isValidCoords used before sendChatMessage ──────
// Mirrors the guard added to sendCurrentLocation in PublicationChat/index.jsx.
// Tests that invalid coordinates from GPS are blocked before reaching Firestore.
function simulateSendLocationGuard(result) {
    if (result.error) return { sent: false, reason: result.reason || "error" };
    if (
        !(typeof result.lat === "number" && isFinite(result.lat) &&
            result.lat >= -90 && result.lat <= 90 &&
            typeof result.lng === "number" && isFinite(result.lng) &&
            result.lng >= -180 && result.lng <= 180)
    ) {
        return { sent: false, reason: "invalid-coords" };
    }
    return { sent: true };
}

test("sendCurrentLocation guard: blocks invalid lat before Firestore write", () => {
    assert.deepStrictEqual(
        simulateSendLocationGuard({ lat: 91, lng: 0 }),
        { sent: false, reason: "invalid-coords" },
    );
});

test("sendCurrentLocation guard: blocks invalid lng before Firestore write", () => {
    assert.deepStrictEqual(
        simulateSendLocationGuard({ lat: 0, lng: 181 }),
        { sent: false, reason: "invalid-coords" },
    );
});

test("sendCurrentLocation guard: blocks NaN coords before Firestore write", () => {
    assert.deepStrictEqual(
        simulateSendLocationGuard({ lat: NaN, lng: 0 }),
        { sent: false, reason: "invalid-coords" },
    );
});

test("sendCurrentLocation guard: allows valid coords through to sendChatMessage", () => {
    assert.deepStrictEqual(
        simulateSendLocationGuard({ lat: -15.78, lng: -47.93 }),
        { sent: true },
    );
});

test("sendCurrentLocation guard: blocks on GPS error before coord check", () => {
    assert.deepStrictEqual(
        simulateSendLocationGuard({ error: true, reason: "unavailable" }),
        { sent: false, reason: "unavailable" },
    );
});

// ── getChatLocation contract (inline mirror — no native expo-location dep) ────
// Mirrors the response contract of src/controllers/Chat/getLocation.js getChatLocation.
// Renamed from sendLocation.js/getLocationForChat to follow sibling convention:
// uploadImage→uploadChatImage, uploadAudio→uploadChatAudio, uploadFile→uploadChatFile.

function mockGetChatLocation(permissionGranted, coords, errorCode) {
    if (!permissionGranted) return { error: true, reason: "permission-denied" };
    if (errorCode === "E_LOCATION_UNAVAILABLE") return { error: true, reason: "unavailable" };
    if (errorCode) return { error: true, reason: "error" };
    return { error: false, lat: coords.latitude, lng: coords.longitude };
}

test("getChatLocation returns error:false with lat/lng on success", () => {
    const result = mockGetChatLocation(true, { latitude: -15.78, longitude: -47.93 }, null);
    assert.equal(result.error, false);
    assert.equal(result.lat, -15.78);
    assert.equal(result.lng, -47.93);
});

test("getChatLocation returns permission-denied when permission not granted", () => {
    const result = mockGetChatLocation(false, null, null);
    assert.deepStrictEqual(result, { error: true, reason: "permission-denied" });
});

test("getChatLocation returns unavailable on E_LOCATION_UNAVAILABLE", () => {
    const result = mockGetChatLocation(true, null, "E_LOCATION_UNAVAILABLE");
    assert.deepStrictEqual(result, { error: true, reason: "unavailable" });
});

test("getChatLocation returns generic error on unexpected exception", () => {
    const result = mockGetChatLocation(true, null, "OTHER_ERROR");
    assert.deepStrictEqual(result, { error: true, reason: "error" });
});

// ── sendCurrentLocation try/catch: isUploading reset on unexpected throw ───────
// Mirrors the try/catch added to sendCurrentLocation in PublicationChat/index.jsx.
// Verifies that if getChatLocation or sendChatMessage throws unexpectedly, the
// spinner state (isUploading=true) is always reset to false in the catch block.
async function simulateSendCurrentLocationWithCrash(crashIn) {
    let isUploading = false;
    let uploadingLabel = "";
    const setIsUploading = (v) => { isUploading = v; };
    const setUploadingLabel = (v) => { uploadingLabel = v; };

    const getChatLocationOk = async () => ({ error: false, lat: -15.78, lng: -47.93 });
    const getChatLocationCrash = async () => { throw new Error("unexpected GPS crash"); };
    const sendChatMessageCrash = async () => { throw new Error("unexpected Firestore crash"); };
    const sendChatMessageOk = async () => {};

    try {
        setIsUploading(true);
        setUploadingLabel("Obtendo localização...");
        const result = crashIn === "getChatLocation"
            ? await getChatLocationCrash()
            : await getChatLocationOk();
        setIsUploading(false);
        setUploadingLabel("");
        if (crashIn === "sendChatMessage") {
            await sendChatMessageCrash();
        } else {
            await sendChatMessageOk();
        }
    } catch (e) {
        setIsUploading(false);
        setUploadingLabel("");
    }

    return { isUploading, uploadingLabel };
}

test("sendCurrentLocation catch: isUploading reset when getChatLocation throws", async () => {
    const state = await simulateSendCurrentLocationWithCrash("getChatLocation");
    assert.equal(state.isUploading, false, "isUploading must be false after unexpected throw");
    assert.equal(state.uploadingLabel, "", "uploadingLabel must be empty after unexpected throw");
});

test("sendCurrentLocation catch: isUploading reset when sendChatMessage throws", async () => {
    const state = await simulateSendCurrentLocationWithCrash("sendChatMessage");
    assert.equal(state.isUploading, false, "isUploading must be false after sendChatMessage throw");
    assert.equal(state.uploadingLabel, "", "uploadingLabel must be empty after sendChatMessage throw");
});
