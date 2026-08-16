const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateDrawName,
    buildDrawSummary,
    sortDrawsByCreatedDesc,
    filterActiveDraws,
    findDrawById,
    applyDrawNameEdit,
} = require("../src/utils/multipleLiveDraws");

test("validateDrawName rejects empty or whitespace-only name", () => {
    assert.deepEqual(validateDrawName(""), {
        valid: false,
        error: "name_required",
    });
    assert.deepEqual(validateDrawName("   "), {
        valid: false,
        error: "name_required",
    });
    assert.deepEqual(validateDrawName(undefined), {
        valid: false,
        error: "name_required",
    });
});

test("validateDrawName rejects names shorter than 2 chars after trim", () => {
    assert.deepEqual(validateDrawName("a"), {
        valid: false,
        error: "name_too_short",
    });
    assert.deepEqual(validateDrawName("  x  "), {
        valid: false,
        error: "name_too_short",
    });
});

test("validateDrawName rejects names longer than 50 chars after trim", () => {
    const longName = "a".repeat(51);
    assert.deepEqual(validateDrawName(longName), {
        valid: false,
        error: "name_too_long",
    });
});

test("validateDrawName accepts valid name and returns trimmed value", () => {
    assert.deepEqual(validateDrawName("  Sorteio Natal  "), {
        valid: true,
        value: "Sorteio Natal",
    });
});

test("buildDrawSummary maps firestore draw doc to UI-ready summary", () => {
    const doc = {
        id: "draw-1",
        code: "ABC123",
        name: "Sorteio de Natal",
        status: true,
        participants: ["u1", "u2", "u3"],
        winners: [{ uid: "u1" }],
        createdAt: { seconds: 1700000000 },
    };

    const summary = buildDrawSummary(doc);

    assert.equal(summary.id, "draw-1");
    assert.equal(summary.code, "ABC123");
    assert.equal(summary.name, "Sorteio de Natal");
    assert.equal(summary.status, true);
    assert.equal(summary.participantsCount, 3);
    assert.equal(summary.winnersCount, 1);
    assert.equal(summary.createdAtSeconds, 1700000000);
});

test("buildDrawSummary handles missing participants/winners arrays", () => {
    const doc = { id: "draw-2", code: "X", name: "N", status: false };

    const summary = buildDrawSummary(doc);

    assert.equal(summary.participantsCount, 0);
    assert.equal(summary.winnersCount, 0);
});

test("buildDrawSummary falls back to first names[] entry when name field missing", () => {
    const doc = {
        id: "legacy",
        code: "C",
        names: ["Sorteio Antigo"],
        status: true,
    };

    const summary = buildDrawSummary(doc);

    assert.equal(summary.name, "Sorteio Antigo");
});

test("buildDrawSummary returns empty name string when no name and no names[]", () => {
    const doc = { id: "legacy", code: "C", status: true };

    const summary = buildDrawSummary(doc);

    assert.equal(summary.name, "");
});

test("sortDrawsByCreatedDesc orders by createdAtSeconds descending", () => {
    const draws = [
        { id: "a", createdAtSeconds: 100 },
        { id: "b", createdAtSeconds: 300 },
        { id: "c", createdAtSeconds: 200 },
    ];

    const sorted = sortDrawsByCreatedDesc(draws);

    assert.deepEqual(
        sorted.map((d) => d.id),
        ["b", "c", "a"],
    );
});

test("sortDrawsByCreatedDesc treats missing createdAtSeconds as 0", () => {
    const draws = [
        { id: "a", createdAtSeconds: 100 },
        { id: "b" },
        { id: "c", createdAtSeconds: 50 },
    ];

    const sorted = sortDrawsByCreatedDesc(draws);

    assert.deepEqual(
        sorted.map((d) => d.id),
        ["a", "c", "b"],
    );
});

test("filterActiveDraws returns only draws with status true", () => {
    const draws = [
        { id: "a", status: true },
        { id: "b", status: false },
        { id: "c", status: true },
    ];

    const active = filterActiveDraws(draws);

    assert.deepEqual(
        active.map((d) => d.id),
        ["a", "c"],
    );
});

test("findDrawById returns matching draw", () => {
    const draws = [{ id: "a" }, { id: "b" }, { id: "c" }];
    assert.deepEqual(findDrawById(draws, "b"), { id: "b" });
});

test("findDrawById returns null when no match", () => {
    const draws = [{ id: "a" }];
    assert.equal(findDrawById(draws, "z"), null);
});

test("findDrawById returns null on empty list or missing id", () => {
    assert.equal(findDrawById([], "a"), null);
    assert.equal(findDrawById([{ id: "a" }], ""), null);
    assert.equal(findDrawById([{ id: "a" }], undefined), null);
});

test("applyDrawNameEdit updates name of matching draw, leaves others unchanged", () => {
    const draws = [
        { id: "a", name: "Old A" },
        { id: "b", name: "Old B" },
    ];

    const updated = applyDrawNameEdit(draws, "b", "  New B  ");

    assert.deepEqual(updated, [
        { id: "a", name: "Old A" },
        { id: "b", name: "New B" },
    ]);
});

test("applyDrawNameEdit does not mutate original list", () => {
    const draws = [{ id: "a", name: "Old" }];

    applyDrawNameEdit(draws, "a", "New");

    assert.equal(draws[0].name, "Old");
});

test("applyDrawNameEdit throws on invalid name", () => {
    const draws = [{ id: "a", name: "Old" }];

    assert.throws(() => applyDrawNameEdit(draws, "a", ""), /name_required/);
    assert.throws(() => applyDrawNameEdit(draws, "a", "x"), /name_too_short/);
});

test("applyDrawNameEdit throws when draw id not found", () => {
    const draws = [{ id: "a", name: "Old" }];

    assert.throws(
        () => applyDrawNameEdit(draws, "z", "Valid Name"),
        /draw_not_found/,
    );
});

test("buildDrawSummary includes theme field from doc", () => {
    const doc = {
        id: "d1",
        code: "C",
        name: "N",
        theme: "Natal",
        status: true,
    };
    const summary = buildDrawSummary(doc);
    assert.equal(summary.theme, "Natal");
});

test("buildDrawSummary returns empty theme string when missing", () => {
    const doc = { id: "d1", code: "C", name: "N", status: true };
    const summary = buildDrawSummary(doc);
    assert.equal(summary.theme, "");
});

