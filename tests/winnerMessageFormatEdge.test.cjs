'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildSingleWinnerShareMessage,
    buildWinnersShareMessage,
    buildCongratulatoryMessage,
} = require('../src/utils/winnerShareMessage');

// ---------------------------------------------------------------------------
// buildSingleWinnerShareMessage — produtor vs cliente comum (location field)
// ---------------------------------------------------------------------------

test('buildSingleWinnerShareMessage uses address.city/state for productor userType', () => {
    const winner = {
        name: 'Carlos Produtor',
        phone: '85999990000',
        drawName: 'Sorteio Rural',
        userType: 'productor',
        address: { city: 'Mossoró', state: 'RN' },
        city: 'WRONG_CITY', // should NOT be used for productor
        state: 'WRONG_STATE',
    };

    const msg = buildSingleWinnerShareMessage(winner, '');
    assert.ok(msg.includes('Mossoró'), 'should use address.city for productor');
    assert.ok(msg.includes('RN'), 'should use address.state for productor');
    assert.ok(!msg.includes('WRONG_CITY'), 'should NOT use flat city for productor');
});

test('buildSingleWinnerShareMessage uses flat city/state for non-productor user', () => {
    const winner = {
        name: 'Ana Cliente',
        phone: '11988880000',
        drawName: 'Sorteio Normal',
        userType: 'buyer',
        city: 'Recife',
        state: 'PE',
        address: { city: 'WRONG_CITY', state: 'WRONG_STATE' }, // should NOT be used
    };

    const msg = buildSingleWinnerShareMessage(winner, '');
    assert.ok(msg.includes('Recife'), 'should use flat city for buyer');
    assert.ok(msg.includes('PE'), 'should use flat state for buyer');
    assert.ok(!msg.includes('WRONG_CITY'), 'should NOT use address.city for buyer');
});

// ---------------------------------------------------------------------------
// normalizePhone — tested via buildSingleWinnerShareMessage
// ---------------------------------------------------------------------------

test('normalizePhone strips non-digits from phone', () => {
    const winner = {
        name: 'Test',
        phone: '(85) 9 9999-1234',
        drawName: 'S',
    };
    const msg = buildSingleWinnerShareMessage(winner, '');
    assert.ok(msg.includes('85999991234'), 'phone should have only digits');
});

test('normalizePhone with undefined phone shows fallback text', () => {
    const winner = { name: 'Test', drawName: 'S' };
    const msg = buildSingleWinnerShareMessage(winner, '');
    assert.ok(msg.includes('Nao informado'), 'should show Nao informado for missing phone');
});

test('normalizePhone with null phone shows fallback text', () => {
    const winner = { name: 'Test', phone: null, drawName: 'S' };
    const msg = buildSingleWinnerShareMessage(winner, '');
    assert.ok(msg.includes('Nao informado'));
});

// ---------------------------------------------------------------------------
// buildCongratulatoryMessage
// ---------------------------------------------------------------------------

test('buildCongratulatoryMessage URL-encodes the message', () => {
    const winner = { name: 'João' };
    const draw = { name: 'Sorteio', createdAt: new Date('2026-08-22') };
    const result = buildCongratulatoryMessage(winner, draw);
    // Result should be URL-encoded (decoding should restore the name)
    const decoded = decodeURIComponent(result);
    assert.ok(decoded.includes('João'));
});

test('buildCongratulatoryMessage falls back to Participante for null winner', () => {
    const draw = { name: 'S', createdAt: new Date() };
    const decoded = decodeURIComponent(buildCongratulatoryMessage(null, draw));
    assert.ok(decoded.includes('Participante'));
});

test('buildCongratulatoryMessage handles Firestore Timestamp (toDate method)', () => {
    const tsDate = new Date('2026-06-01T12:00:00Z');
    const draw = {
        name: 'Sorteio TS',
        createdAt: { toDate: () => tsDate },
    };
    const decoded = decodeURIComponent(buildCongratulatoryMessage({ name: 'Bia' }, draw));
    assert.ok(decoded.includes('Bia'));
    assert.ok(decoded.includes('Sorteio TS'));
});

test('buildCongratulatoryMessage includes theme when present', () => {
    const draw = { name: 'S', theme: 'Natal', createdAt: new Date() };
    const decoded = decodeURIComponent(buildCongratulatoryMessage({ name: 'Lu' }, draw));
    assert.ok(decoded.includes('Natal'));
});

test('buildCongratulatoryMessage omits comma when theme is absent', () => {
    const draw = { name: 'S', theme: '', createdAt: new Date() };
    const decoded = decodeURIComponent(buildCongratulatoryMessage({ name: 'Lu' }, draw));
    assert.ok(!decoded.includes(', ,'), 'no double-comma when theme is empty');
});

// ---------------------------------------------------------------------------
// buildWinnersShareMessage — additional edge cases
// ---------------------------------------------------------------------------

test('buildWinnersShareMessage with empty winners array returns a string', () => {
    const result = buildWinnersShareMessage([]);
    assert.equal(typeof result, 'string');
    assert.ok(result.length > 0);
});

test('buildWinnersShareMessage groups winners by drawName', () => {
    const winners = [
        { name: 'Ana', drawName: 'Sorteio A', phone: '11111111111', city: 'SP', state: 'SP' },
        { name: 'Bruno', drawName: 'Sorteio B', phone: '22222222222', city: 'RJ', state: 'RJ' },
        { name: 'Carla', drawName: 'Sorteio A', phone: '33333333333', city: 'CE', state: 'CE' },
    ];
    const msg = buildWinnersShareMessage(winners, '');
    // Both Sorteio A and Sorteio B headings should appear
    assert.ok(msg.includes('Sorteio A'));
    assert.ok(msg.includes('Sorteio B'));
});

test('buildWinnersShareMessage with one winner uses singular label Vencedor', () => {
    const winners = [{ name: 'Solo', drawName: 'S', phone: '11111111111', city: 'CE', state: 'CE' }];
    const msg = buildWinnersShareMessage(winners, '');
    // "Vencedores" should NOT appear, "Vencedor" (singular) should
    const occurrences = (msg.match(/Vencedor/g) || []).length;
    assert.ok(occurrences >= 1);
    assert.ok(!msg.includes('Vencedores'));
});

test('buildWinnersShareMessage with multiple winners uses plural label Vencedores', () => {
    const winners = [
        { name: 'A', drawName: 'S', phone: '1', city: 'X', state: 'Y' },
        { name: 'B', drawName: 'S', phone: '2', city: 'X', state: 'Y' },
    ];
    const msg = buildWinnersShareMessage(winners, '');
    assert.ok(msg.includes('Vencedores'));
});
