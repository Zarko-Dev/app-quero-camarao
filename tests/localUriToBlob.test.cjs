// Tests for src/controllers/Chat/localUriToBlob.js
// Mirrors the module logic (ES module with XHR) in CJS style — same pattern
// as other chat upload tests in this project.
const test = require("node:test");
const assert = require("node:assert/strict");

// ── Mirror of localUriToBlob ─────────────────────────────────────────────────
function makeLocalUriToBlob(xhrFactory) {
    return (uri, { timeout = 0 } = {}) => new Promise((resolve, reject) => {
        const xhr = xhrFactory();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error("localUriToBlob: fetch failed"));
        xhr.responseType = "blob";
        if (timeout > 0) {
            xhr.ontimeout = () => reject(new Error("localUriToBlob: timeout"));
            xhr.timeout = timeout;
        }
        xhr.open("GET", uri, true);
        xhr.send(null);
    });
}

// ── Default (no timeout) ─────────────────────────────────────────────────────

test("without timeout option, xhr.timeout is not set", () => {
    let capturedXhr;
    const xhrFactory = () => {
        capturedXhr = { open: () => {}, send: () => {} };
        return capturedXhr;
    };
    const localUriToBlob = makeLocalUriToBlob(xhrFactory);
    localUriToBlob("local://fake");
    assert.equal(capturedXhr.timeout, undefined);
    assert.equal(capturedXhr.ontimeout, undefined);
});

// ── Audio usage: timeout 15000 ───────────────────────────────────────────────

test("with timeout 15000, xhr.timeout is set to 15000 (audio usage)", () => {
    let capturedXhr;
    const xhrFactory = () => {
        capturedXhr = { open: () => {}, send: () => {} };
        return capturedXhr;
    };
    const localUriToBlob = makeLocalUriToBlob(xhrFactory);
    localUriToBlob("local://fake", { timeout: 15000 });
    assert.equal(capturedXhr.timeout, 15000);
});

// ── Video usage: timeout 60000 ───────────────────────────────────────────────

test("with timeout 60000, xhr.timeout is set to 60000 (video usage)", () => {
    let capturedXhr;
    const xhrFactory = () => {
        capturedXhr = { open: () => {}, send: () => {} };
        return capturedXhr;
    };
    const localUriToBlob = makeLocalUriToBlob(xhrFactory);
    localUriToBlob("local://fake", { timeout: 60000 });
    assert.equal(capturedXhr.timeout, 60000);
});

// ── Rejection paths ──────────────────────────────────────────────────────────

test("rejects with timeout message when xhr.ontimeout fires", async () => {
    let capturedXhr;
    const xhrFactory = () => {
        capturedXhr = { open: () => {}, send: () => {} };
        return capturedXhr;
    };
    const localUriToBlob = makeLocalUriToBlob(xhrFactory);
    const p = localUriToBlob("local://fake", { timeout: 15000 });
    capturedXhr.ontimeout();
    await assert.rejects(p, /timeout/);
});

test("rejects with fetch-failed message when xhr.onerror fires", async () => {
    let capturedXhr;
    const xhrFactory = () => {
        capturedXhr = { open: () => {}, send: () => {} };
        return capturedXhr;
    };
    const localUriToBlob = makeLocalUriToBlob(xhrFactory);
    const p = localUriToBlob("local://fake");
    capturedXhr.onerror();
    await assert.rejects(p, /fetch failed/);
});

// ── Success path ─────────────────────────────────────────────────────────────

test("resolves with xhr.response on load", async () => {
    let capturedXhr;
    const fakeBlob = { size: 1024 };
    const xhrFactory = () => {
        capturedXhr = { open: () => {}, send: () => {}, response: fakeBlob };
        return capturedXhr;
    };
    const localUriToBlob = makeLocalUriToBlob(xhrFactory);
    const p = localUriToBlob("local://fake");
    capturedXhr.onload();
    const result = await p;
    assert.equal(result, fakeBlob);
});
