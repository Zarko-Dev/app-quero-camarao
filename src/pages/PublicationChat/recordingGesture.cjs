const LOCK_DISTANCE = 48;

function shouldLockRecording(translationY, lockDistance = LOCK_DISTANCE) {
    return Number.isFinite(translationY) && translationY <= -Math.abs(lockDistance);
}

function shouldKeepRecordingOnRelease(isLocked) {
    return Boolean(isLocked);
}

module.exports = {
    LOCK_DISTANCE,
    shouldLockRecording,
    shouldKeepRecordingOnRelease,
};
