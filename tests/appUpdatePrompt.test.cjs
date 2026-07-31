const test = require("node:test");
const assert = require("node:assert/strict");

const {
    shouldForceAppUpdate,
} = require("../src/utils/appUpdatePrompt");

test("shouldForceAppUpdate stays off when update is not forced", () => {
    assert.equal(
        shouldForceAppUpdate({
            forceUpdate: false,
            remoteVersion: "2.0.6",
            appVersion: "2.0.5",
            buildVersion: "62",
        }),
        false,
    );
});

test("shouldForceAppUpdate turns on when forced remote version is newer", () => {
    assert.equal(
        shouldForceAppUpdate({
            forceUpdate: true,
            remoteVersion: "2.0.6",
            appVersion: "2.0.5",
            buildVersion: "62",
        }),
        true,
    );
});

test("shouldForceAppUpdate stays off when versions are equal", () => {
    assert.equal(
        shouldForceAppUpdate({
            forceUpdate: true,
            remoteVersion: "2.0.5",
            appVersion: "2.0.5",
            buildVersion: "62",
        }),
        false,
    );
});

test("shouldForceAppUpdate stays off when remote version is missing", () => {
    assert.equal(
        shouldForceAppUpdate({
            forceUpdate: true,
            remoteVersion: "",
            appVersion: "2.0.5",
            buildVersion: "62",
        }),
        false,
    );
});
