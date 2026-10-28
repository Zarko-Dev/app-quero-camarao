'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildEligibleParticipants,
    pickRandomUniqueWinners,
    partitionIndicatedAndRandom,
} = require('../src/utils/drawEligibility');

const withLocation = (uid) => ({ uid, address: { state: 'CE', city: 'Fortaleza' } });
const withFlatLocation = (uid) => ({ uid, state: 'SP', city: 'Santos' });

// ---------------------------------------------------------------------------
// buildEligibleParticipants — participant without any identifier
// ---------------------------------------------------------------------------

test('buildEligibleParticipants excludes participant without uid/email/cpf', () => {
    const participants = [
        { name: 'Sem Identificador', address: { state: 'SP', city: 'Santos' } }, // no uid, email, cpf
        withLocation('u1'),
    ];
    const logs = [];

    const eligible = buildEligibleParticipants({
        participants,
        previousWinners: [],
        logger: (msg) => logs.push(msg),
    });

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].uid, 'u1');
    assert.ok(logs.some((l) => l.includes('missing_identifier')));
});

test('buildEligibleParticipants includes participant with email identifier (no uid)', () => {
    const participants = [
        { email: 'ana@test.com', address: { state: 'SP', city: 'Santos' } },
    ];

    const eligible = buildEligibleParticipants({
        participants,
        previousWinners: [],
    });

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].email, 'ana@test.com');
});

test('buildEligibleParticipants includes participant with cpf identifier (no uid/email)', () => {
    const participants = [
        { cpf: '12345678900', address: { state: 'RJ', city: 'Rio' } },
    ];

    const eligible = buildEligibleParticipants({ participants, previousWinners: [] });

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].cpf, '12345678900');
});

test('buildEligibleParticipants excludes previous winner identified by email', () => {
    const participants = [
        { email: 'ana@test.com', address: { state: 'SP', city: 'Santos' } },
        { email: 'bruno@test.com', address: { state: 'SP', city: 'Santos' } },
    ];

    const eligible = buildEligibleParticipants({
        participants,
        previousWinners: [{ email: 'ana@test.com' }],
    });

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].email, 'bruno@test.com');
});

test('buildEligibleParticipants excludes previous winner identified by cpf', () => {
    const participants = [
        { cpf: '111', address: { state: 'SP', city: 'Santos' } },
        { cpf: '222', address: { state: 'SP', city: 'Santos' } },
    ];

    const eligible = buildEligibleParticipants({
        participants,
        previousWinners: [{ cpf: '111' }],
    });

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].cpf, '222');
});

test('buildEligibleParticipants returns empty array when all participants excluded', () => {
    const participants = [withLocation('u1')];

    const eligible = buildEligibleParticipants({
        participants,
        previousWinners: [{ uid: 'u1' }],
    });

    assert.equal(eligible.length, 0);
});

test('buildEligibleParticipants accepts flat location (state/city at root, not nested address)', () => {
    const participants = [withFlatLocation('u1')];

    const eligible = buildEligibleParticipants({
        participants,
        previousWinners: [],
    });

    assert.equal(eligible.length, 1);
});

test('buildEligibleParticipants works with no logger provided (optional param)', () => {
    const participants = [withLocation('u1')];

    assert.doesNotThrow(() => {
        buildEligibleParticipants({ participants, previousWinners: [] });
    });
});

// ---------------------------------------------------------------------------
// pickRandomUniqueWinners — edge cases
// ---------------------------------------------------------------------------

test('pickRandomUniqueWinners with count=0 returns empty array', () => {
    const eligible = [withLocation('u1'), withLocation('u2')];
    const winners = pickRandomUniqueWinners(eligible, 0, () => 0);
    assert.equal(winners.length, 0);
});

test('pickRandomUniqueWinners with count > pool returns all without repetition', () => {
    const eligible = [withLocation('u1'), withLocation('u2')];
    const winners = pickRandomUniqueWinners(eligible, 5, () => 0);
    assert.equal(winners.length, 2);
    const uids = winners.map((w) => w.uid);
    assert.equal(new Set(uids).size, 2);
});

test('pickRandomUniqueWinners with empty pool returns empty array', () => {
    const winners = pickRandomUniqueWinners([], 3, () => 0);
    assert.equal(winners.length, 0);
});

test('pickRandomUniqueWinners with negative count returns empty array', () => {
    const eligible = [withLocation('u1')];
    const winners = pickRandomUniqueWinners(eligible, -1, () => 0);
    assert.equal(winners.length, 0);
});

test('pickRandomUniqueWinners does not mutate the original pool array', () => {
    const eligible = [withLocation('u1'), withLocation('u2')];
    const original = [...eligible];
    pickRandomUniqueWinners(eligible, 2, () => 0);
    assert.equal(eligible.length, original.length);
});

// ---------------------------------------------------------------------------
// partitionIndicatedAndRandom — edge cases
// ---------------------------------------------------------------------------

test('partitionIndicatedAndRandom with countPrizes=0 returns no winners', () => {
    const participants = [withLocation('u1'), withLocation('u2')];

    const { winners, remainingIndicatedIds } = partitionIndicatedAndRandom({
        indicatedIds: ['u1'],
        previousWinners: [],
        participants,
        eligibleParticipants: participants,
        countPrizes: 0,
        pickRandomFn: () => [],
    });

    assert.equal(winners.length, 0);
    // u1 was indicated but countPrizes=0 means none drawn; u1 stays remaining
    assert.deepEqual(remainingIndicatedIds, ['u1']);
});

test('partitionIndicatedAndRandom with all indicated already won: all skip, randoms fill', () => {
    const participants = [
        withLocation('u1'),
        withLocation('u2'),
        withLocation('u3'),
    ];
    // u1 and u2 are indicated but already won
    const previousWinners = [{ uid: 'u1' }, { uid: 'u2' }];
    const eligibleParticipants = [withLocation('u3')]; // only u3 eligible

    let randomPoolReceived = null;
    const mockPick = (pool, count) => {
        randomPoolReceived = pool;
        return pool.slice(0, count);
    };

    const { winners, remainingIndicatedIds } = partitionIndicatedAndRandom({
        indicatedIds: ['u1', 'u2'],
        previousWinners,
        participants,
        eligibleParticipants,
        countPrizes: 1,
        pickRandomFn: mockPick,
    });

    assert.equal(winners.length, 1);
    assert.equal(winners[0].uid, 'u3'); // random, not indicated
    assert.ok(!winners[0].indicated);
    assert.deepEqual(remainingIndicatedIds, []);
    // random pool must not include u1 or u2 (they're not eligible anyway)
    assert.ok(randomPoolReceived !== null);
});

test('partitionIndicatedAndRandom with empty indicatedIds uses only random', () => {
    const participants = [withLocation('u1'), withLocation('u2')];

    let calledCount = 0;
    const mockPick = (pool, count) => {
        calledCount++;
        return pool.slice(0, count);
    };

    const { winners, remainingIndicatedIds } = partitionIndicatedAndRandom({
        indicatedIds: [],
        previousWinners: [],
        participants,
        eligibleParticipants: participants,
        countPrizes: 2,
        pickRandomFn: mockPick,
    });

    assert.equal(winners.length, 2);
    assert.equal(remainingIndicatedIds.length, 0);
    assert.equal(calledCount, 1);
    assert.ok(winners.every((w) => !w.indicated));
});

test('partitionIndicatedAndRandom indicated participant not in participants list is skipped', () => {
    const participants = [withLocation('u1')];
    const eligibleParticipants = [withLocation('u1')];

    const { winners } = partitionIndicatedAndRandom({
        indicatedIds: ['u999'], // doesn't exist in participants
        previousWinners: [],
        participants,
        eligibleParticipants,
        countPrizes: 1,
        pickRandomFn: (pool, count) => pool.slice(0, count),
    });

    // u999 not found, so u1 wins via random
    assert.equal(winners.length, 1);
    assert.equal(winners[0].uid, 'u1');
    assert.ok(!winners[0].indicated);
});
