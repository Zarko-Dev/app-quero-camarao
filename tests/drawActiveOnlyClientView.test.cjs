'use strict';
// Regression test for the in-memory active-draw filter in getAllDrawPrizesLiveWhereParticipant.
//
// Production code (live.js):
//   const data = querySnapshot.docs
//       .map((dataDoc) => dataDoc.data())
//       .filter(item => item.status === true)  // ← filtra só ativos
//
// The Firestore query for regular users already filters by participants array-contains,
// but status filtering is applied in memory for both admin (returnAll=true) and regular users.
// This test guards against regressions that would show closed draws on the client screen.

const test = require('node:test');
const assert = require('node:assert/strict');

const { filterActiveOnly } = require('../src/controllers/DrawPrizes/helpers');

test('returns only draws with status === true', () => {
    const draws = [
        { id: 'd1', status: true, code: 'A' },
        { id: 'd2', status: false, code: 'B' },
        { id: 'd3', status: true, code: 'C' },
    ];
    const active = filterActiveOnly(draws);
    assert.equal(active.length, 2);
    assert.ok(active.every((d) => d.status === true));
});

test('draw with status === false (closed) is excluded — regression: closed draw must not appear on client', () => {
    const draws = [{ id: 'd1', status: false }];
    const active = filterActiveOnly(draws);
    assert.equal(active.length, 0);
});

test('draw with missing status field is excluded (strict === true comparison)', () => {
    const draws = [
        { id: 'd1' },                      // no status → excluded
        { id: 'd2', status: true },         // included
        { id: 'd3', status: 1 },            // 1 !== true → excluded
        { id: 'd4', status: 'true' },       // string 'true' !== true → excluded
    ];
    const active = filterActiveOnly(draws);
    assert.equal(active.length, 1);
    assert.equal(active[0].id, 'd2');
});

test('empty array returns empty array', () => {
    assert.deepEqual(filterActiveOnly([]), []);
});

test('all draws active — returns all', () => {
    const draws = [
        { id: 'a', status: true },
        { id: 'b', status: true },
    ];
    assert.equal(filterActiveOnly(draws).length, 2);
});

test('admin-view (returnAll=true) still respects in-memory status filter', () => {
    // Simulates admin querying ALL docs (no Firestore where clause), but status filter still applies
    const allDocs = [
        { id: 'live', status: true, code: 'X' },
        { id: 'closed', status: false, code: 'Y' },
        { id: 'unknown', code: 'Z' }, // no status
    ];
    const active = filterActiveOnly(allDocs);
    assert.equal(active.length, 1);
    assert.equal(active[0].id, 'live');
});
