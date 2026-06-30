const test = require("node:test");
const assert = require("node:assert/strict");

const { filterParticipantsByName } = require("../src/pages/Admin/Parabens/filterParticipantsByName.cjs");

const PARTICIPANTS = [
    { uid: "1", name: "Ana Paula", email: "ana@test.com" },
    { uid: "2", name: "Bruno Costa", email: "bruno@test.com" },
    { uid: "3", displayName: "Carlos Melo", email: "carlos@test.com" },
    { uid: "4", name: "", email: "sem-nome@test.com" },
    { uid: "5", name: "Joao Silva", email: "joao@test.com" },
];

test("returns all participants when query is empty string", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "");
    assert.equal(result.length, PARTICIPANTS.length);
});

test("returns all participants when query is only whitespace", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "   ");
    assert.equal(result.length, PARTICIPANTS.length);
});

test("filters by name case-insensitively", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "ana");
    assert.equal(result.length, 1);
    assert.equal(result[0].uid, "1");
});

test("filters by name with uppercase query", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "BRUNO");
    assert.equal(result.length, 1);
    assert.equal(result[0].uid, "2");
});

test("filters by partial name match", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "Silva");
    assert.equal(result.length, 1);
    assert.equal(result[0].uid, "5");
});

test("matches against displayName when name is absent", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "Carlos");
    assert.equal(result.length, 1);
    assert.equal(result[0].uid, "3");
});

test("returns empty array when no participant matches", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "zzznomatch");
    assert.equal(result.length, 0);
});

test("excludes participants with empty name when query is non-empty", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "sem");
    assert.equal(result.length, 0);
});

test("returns multiple matches when several names contain query", () => {
    const result = filterParticipantsByName(PARTICIPANTS, "a");
    const uids = result.map((p) => p.uid).sort();
    assert.deepEqual(uids, ["1", "2", "3", "5"]);
});
