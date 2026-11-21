const test = require("node:test");
const assert = require("node:assert/strict");

const { withSnapshotErrorHandler } = require("../src/utils/snapshotArgs");

const onNext = () => {};
const onError = () => {};
const fallback = () => {};

test("só onNext: acrescenta o onError de fallback", () => {
    assert.deepEqual(withSnapshotErrorHandler([onNext], fallback), [onNext, fallback]);
});

test("options + onNext: fallback vai para o fim", () => {
    const options = { includeMetadataChanges: true };
    assert.deepEqual(
        withSnapshotErrorHandler([options, onNext], fallback),
        [options, onNext, fallback],
    );
});

test("onNext + onError próprios: não mexe", () => {
    assert.deepEqual(withSnapshotErrorHandler([onNext, onError], fallback), [onNext, onError]);
});

test("observer { next, error }: não mexe", () => {
    const observer = { next: onNext, error: onError };
    assert.deepEqual(withSnapshotErrorHandler([observer], fallback), [observer]);
});
