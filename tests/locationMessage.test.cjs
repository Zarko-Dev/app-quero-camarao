const test = require("node:test");
const assert = require("node:assert/strict");

const { buildLocationPayload } = require("../src/utils/locationMessage");

test("coords validas viram payload lat/lng", () => {
    assert.deepEqual(buildLocationPayload({ error: false, lat: -3.7, lng: -38.5 }), { lat: -3.7, lng: -38.5 });
});

test("erro de permissao ou coords invalidas retornam null", () => {
    assert.equal(buildLocationPayload({ error: true, reason: "permission-denied" }), null);
    assert.equal(buildLocationPayload({ error: false, lat: 91, lng: 0 }), null);
    assert.equal(buildLocationPayload({ error: false, lat: "1", lng: 0 }), null);
    assert.equal(buildLocationPayload(null), null);
});
