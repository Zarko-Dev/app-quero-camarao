'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildSoftDeleteDrawPrizeUpdate,
    buildCloseDrawUpdate,
    filterActiveDrawPrizes,
} = require('../src/controllers/DrawPrizes/helpers');

// ---------------------------------------------------------------------------
// buildSoftDeleteDrawPrizeUpdate — date equality and defaults
// ---------------------------------------------------------------------------

test('buildSoftDeleteDrawPrizeUpdate returns isDeleted=true', () => {
    const result = buildSoftDeleteDrawPrizeUpdate(new Date('2026-08-22T10:00:00Z'));
    assert.equal(result.isDeleted, true);
});

test('buildSoftDeleteDrawPrizeUpdate: deletedAt and updatedAt have the same value', () => {
    const now = new Date('2026-08-22T10:00:00Z');
    const result = buildSoftDeleteDrawPrizeUpdate(now);
    assert.equal(result.deletedAt.getTime(), result.updatedAt.getTime());
});

test('buildSoftDeleteDrawPrizeUpdate: deletedAt reflects the provided date', () => {
    const specificDate = new Date('2026-01-15T08:30:00Z');
    const result = buildSoftDeleteDrawPrizeUpdate(specificDate);
    assert.equal(result.deletedAt.toISOString(), '2026-01-15T08:30:00.000Z');
});

test('buildSoftDeleteDrawPrizeUpdate with no argument uses a Date instance (default now)', () => {
    const before = Date.now();
    const result = buildSoftDeleteDrawPrizeUpdate();
    const after = Date.now();

    assert.ok(result.deletedAt instanceof Date);
    assert.ok(result.updatedAt instanceof Date);
    // The default date should be "now" (within a small window)
    assert.ok(result.deletedAt.getTime() >= before);
    assert.ok(result.deletedAt.getTime() <= after);
});

// ---------------------------------------------------------------------------
// filterActiveDrawPrizes — edge cases
// ---------------------------------------------------------------------------

test('filterActiveDrawPrizes with empty array returns empty array', () => {
    assert.deepEqual(filterActiveDrawPrizes([]), []);
});

test('filterActiveDrawPrizes with all deleted items returns empty array', () => {
    const draws = [
        { id: '1', isDeleted: true },
        { id: '2', isDeleted: true },
    ];
    assert.deepEqual(filterActiveDrawPrizes(draws), []);
});

test('filterActiveDrawPrizes returns items where isDeleted is missing (undefined)', () => {
    const draws = [
        { id: '1' },               // isDeleted missing → active
        { id: '2', isDeleted: false }, // explicitly not deleted → active
        { id: '3', isDeleted: true },  // deleted → excluded
    ];
    const result = filterActiveDrawPrizes(draws);
    assert.deepEqual(result.map((d) => d.id), ['1', '2']);
});

test('filterActiveDrawPrizes handles null item gracefully (optional chaining)', () => {
    // The implementation uses drawPrize?.isDeleted, so null items should not throw
    assert.doesNotThrow(() => filterActiveDrawPrizes([null, undefined]));
    const result = filterActiveDrawPrizes([null, undefined]);
    // null and undefined don't have isDeleted, so they pass the filter (not deleted)
    assert.equal(result.length, 2);
});

// ---------------------------------------------------------------------------
// Regression: closing a draw sets status=false (business rule documented)
// This tests the pure shape of what the Firestore update should look like.
// CloseDrawPrizeLiveById sets { status: false, updatedAt: new Date() }.
// We validate the shape here without hitting Firestore.
// ---------------------------------------------------------------------------

test('close draw update shape: status false and updatedAt present', () => {
    const update = buildCloseDrawUpdate();
    assert.equal(update.status, false);
    assert.ok(update.updatedAt instanceof Date);
});

test('close draw update shape: accepts explicit timestamp', () => {
    const ts = new Date('2024-06-01T00:00:00Z');
    const update = buildCloseDrawUpdate(ts);
    assert.equal(update.status, false);
    assert.equal(update.updatedAt.toISOString(), ts.toISOString());
});
