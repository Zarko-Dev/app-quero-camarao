'use strict';
// Regression tests for the participant merge+dedup logic in seedParticipantsDrawPrizeLive.
//
// Production code (live.js):
//   const existing = response.data?.participants ?? [];
//   const merged = Array.from(new Set([...existing, ...participantIds]));
//   await setDoc(..., { participants: merged, updatedAt: new Date() }, { merge: true });
//
// This guards against double-adding participants when the function is called multiple times.

const test = require('node:test');
const assert = require('node:assert/strict');

const { mergeParticipants } = require('../src/controllers/DrawPrizes/helpers');

test('adds new participants to the existing list', () => {
    const merged = mergeParticipants(['u1', 'u2'], ['u3', 'u4']);
    assert.deepEqual(merged.sort(), ['u1', 'u2', 'u3', 'u4']);
});

test('deduplicates: does not add an id already in existing list', () => {
    const merged = mergeParticipants(['u1', 'u2'], ['u2', 'u3']);
    const unique = new Set(merged);
    assert.equal(unique.size, merged.length, 'result must have no duplicates');
    assert.ok(merged.includes('u1'));
    assert.ok(merged.includes('u2'));
    assert.ok(merged.includes('u3'));
});

test('deduplicates within incoming list itself', () => {
    const merged = mergeParticipants([], ['u1', 'u1', 'u2', 'u2']);
    assert.equal(merged.length, 2);
    assert.ok(merged.includes('u1'));
    assert.ok(merged.includes('u2'));
});

test('calling merge twice with same ids is idempotent', () => {
    const first = mergeParticipants([], ['u1', 'u2']);
    const second = mergeParticipants(first, ['u1', 'u2']); // same ids again
    assert.equal(second.length, 2);
    assert.ok(second.includes('u1'));
    assert.ok(second.includes('u2'));
});

test('existing undefined (response.data?.participants ?? []) treated as empty list', () => {
    const existing = undefined ?? [];
    const merged = mergeParticipants(existing, ['u1']);
    assert.deepEqual(merged, ['u1']);
});

test('incoming empty: result equals existing', () => {
    const merged = mergeParticipants(['u1', 'u2'], []);
    assert.deepEqual(merged.sort(), ['u1', 'u2']);
});

test('both empty: result is empty', () => {
    const merged = mergeParticipants([], []);
    assert.deepEqual(merged, []);
});

test('large batch: all unique ids preserved', () => {
    const existing = Array.from({ length: 50 }, (_, i) => `u${i}`);
    const incoming = Array.from({ length: 50 }, (_, i) => `u${i + 50}`);
    const merged = mergeParticipants(existing, incoming);
    assert.equal(merged.length, 100);
    const unique = new Set(merged);
    assert.equal(unique.size, 100);
});
