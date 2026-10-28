'use strict';
// Regression test for the "already participating" exclusion in findDrawPrizeLiveByCode.
//
// Production code (live.js):
//   const filteredDocs = querySnapshot.docs.filter((dataDoc) => {
//       const data = dataDoc.data();
//       return !data.participants?.includes(participant);
//   });
//   if (filteredDocs.length > 0) { return { error: false, data: filteredDocs[0].data() }; }
//   return { error: true, data: null };
//
// This test verifies the pure filter rule without hitting Firestore.

const test = require('node:test');
const assert = require('node:assert/strict');

const { filterNotYetParticipating } = require('../src/controllers/DrawPrizes/helpers');

test('returns draw when participant is NOT in participants list', () => {
    const docs = [
        { code: 'NATAL25', participants: ['user@a.com', 'user@b.com'] },
    ];
    const filtered = filterNotYetParticipating(docs, 'new@user.com');
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].code, 'NATAL25');
});

test('excludes draw when participant IS already in participants list', () => {
    const docs = [
        { code: 'NATAL25', participants: ['already@user.com', 'other@user.com'] },
    ];
    const filtered = filterNotYetParticipating(docs, 'already@user.com');
    assert.equal(filtered.length, 0);
});

test('draw with undefined participants array is treated as not-participating (returns draw)', () => {
    const docs = [
        { code: 'NOVO', participants: undefined },
    ];
    const filtered = filterNotYetParticipating(docs, 'any@user.com');
    assert.equal(filtered.length, 1);
});

test('draw with empty participants array returns draw (participant not yet in)', () => {
    const docs = [{ code: 'VAZIO', participants: [] }];
    const filtered = filterNotYetParticipating(docs, 'x@x.com');
    assert.equal(filtered.length, 1);
});

test('when multiple active draws: only the one where participant is NOT present is returned', () => {
    const docs = [
        { code: 'DRAW_A', participants: ['me@user.com'] }, // already participating
        { code: 'DRAW_B', participants: ['other@user.com'] }, // not participating
    ];
    const filtered = filterNotYetParticipating(docs, 'me@user.com');
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].code, 'DRAW_B');
});

test('first valid draw is returned when multiple draws match (not participating in any)', () => {
    const docs = [
        { code: 'FIRST', participants: [] },
        { code: 'SECOND', participants: [] },
    ];
    const filtered = filterNotYetParticipating(docs, 'me@user.com');
    assert.equal(filtered.length, 2);
    // Production code picks filteredDocs[0]
    assert.equal(filtered[0].code, 'FIRST');
});

test('participant matched by exact string equality (case-sensitive)', () => {
    const docs = [{ code: 'S', participants: ['User@Email.com'] }];
    // Different case → not found → draw returned
    const filtered = filterNotYetParticipating(docs, 'user@email.com');
    assert.equal(filtered.length, 1);
});

test('empty docs array returns empty filtered array', () => {
    const filtered = filterNotYetParticipating([], 'any@user.com');
    assert.equal(filtered.length, 0);
});
