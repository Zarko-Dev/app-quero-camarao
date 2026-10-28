'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { planDrawExecution } = require('../src/utils/drawEligibility');

const u = (uid) => ({ uid, email: `${uid}@x.com`, state: 'CE', city: 'Fortaleza' });
const first = (pool, n) => pool.slice(0, n);

test('indicated wins first, tagged with drawName, previous winners kept', () => {
    const plan = planDrawExecution({
        draw: { winners: [{ ...u('old'), drawName: 'A' }], indicatedParticipants: ['b', 'c'] },
        users: [u('old'), u('a'), u('b'), u('c')],
        prizeName: 'B',
        countPrizes: 1,
        pickRandomFn: first,
    });
    assert.deepEqual(plan.newWinners.map((w) => w.uid), ['b']);
    assert.equal(plan.newWinners[0].drawName, 'B');
    assert.equal(plan.newWinners[0].indicated, true);
    assert.deepEqual(plan.remainingIndicatedIds, ['c']);
    assert.deepEqual(plan.allWinners.map((w) => w.uid), ['old', 'b']);
});

test('previous winner never wins again; empty when everyone already won', () => {
    const plan = planDrawExecution({
        draw: { winners: [u('a')], indicatedParticipants: [] },
        users: [u('a')],
        prizeName: 'B',
        pickRandomFn: first,
    });
    assert.deepEqual(plan.newWinners, []);
    assert.equal(plan.allWinners.length, 1);
});
