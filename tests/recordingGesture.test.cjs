const test = require("node:test");
const assert = require("node:assert/strict");

const {
    LOCK_DISTANCE,
    shouldLockRecording,
    shouldKeepRecordingOnRelease,
} = require("../src/pages/PublicationChat/recordingGesture.cjs");

test("LOCK_DISTANCE uses the same upward gesture threshold for lock", () => {
    assert.equal(LOCK_DISTANCE, 48);
});

test("shouldLockRecording returns true only after dragging upward past the lock distance", () => {
    assert.equal(shouldLockRecording(-47), false);
    assert.equal(shouldLockRecording(-48), true);
    assert.equal(shouldLockRecording(-120), true);
    assert.equal(shouldLockRecording(18), false);
});

test("shouldKeepRecordingOnRelease keeps recording only when it is locked", () => {
    assert.equal(shouldKeepRecordingOnRelease(true), true);
    assert.equal(shouldKeepRecordingOnRelease(false), false);
});
