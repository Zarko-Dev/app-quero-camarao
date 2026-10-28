'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const {
    validateDrawCode,
    applyDrawCodeEdit,
    findDrawById,
} = require('../src/utils/multipleLiveDraws');

// ---------------------------------------------------------------------------
// validateDrawCode
// Limites: DRAW_CODE_MIN=1, DRAW_CODE_MAX=50
// ---------------------------------------------------------------------------

test('validateDrawCode rejects empty string', () => {
    assert.deepEqual(validateDrawCode(''), { valid: false, error: 'code_required' });
});

test('validateDrawCode rejects whitespace-only string', () => {
    assert.deepEqual(validateDrawCode('   '), { valid: false, error: 'code_required' });
});

test('validateDrawCode rejects undefined', () => {
    assert.deepEqual(validateDrawCode(undefined), { valid: false, error: 'code_required' });
});

test('validateDrawCode rejects null', () => {
    assert.deepEqual(validateDrawCode(null), { valid: false, error: 'code_required' });
});

test('validateDrawCode rejects non-string (number)', () => {
    assert.deepEqual(validateDrawCode(123), { valid: false, error: 'code_required' });
});

test('validateDrawCode accepts 1-char code (boundary DRAW_CODE_MIN=1)', () => {
    const result = validateDrawCode('A');
    assert.equal(result.valid, true);
    assert.equal(result.value, 'A');
});

test('validateDrawCode accepts code with exactly 50 chars (boundary DRAW_CODE_MAX=50)', () => {
    const code = 'a'.repeat(50);
    const result = validateDrawCode(code);
    assert.equal(result.valid, true);
    assert.equal(result.value, code);
});

test('validateDrawCode rejects code longer than 50 chars', () => {
    const code = 'a'.repeat(51);
    assert.deepEqual(validateDrawCode(code), { valid: false, error: 'code_too_long' });
});

test('validateDrawCode trims whitespace before validating and returns trimmed value', () => {
    const result = validateDrawCode('  NATAL2025  ');
    assert.equal(result.valid, true);
    assert.equal(result.value, 'NATAL2025');
});

test('validateDrawCode accepts alphanumeric codes', () => {
    const result = validateDrawCode('SORTEIO123');
    assert.equal(result.valid, true);
    assert.equal(result.value, 'SORTEIO123');
});

// ---------------------------------------------------------------------------
// applyDrawCodeEdit
// Mirrors applyDrawNameEdit but for the code field.
// ---------------------------------------------------------------------------

test('applyDrawCodeEdit updates code of matching draw, leaves others unchanged', () => {
    const draws = [
        { id: 'a', code: 'OLD_A' },
        { id: 'b', code: 'OLD_B' },
    ];

    const updated = applyDrawCodeEdit(draws, 'b', '  NEW_B  ');

    assert.deepEqual(updated, [
        { id: 'a', code: 'OLD_A' },
        { id: 'b', code: 'NEW_B' },
    ]);
});

test('applyDrawCodeEdit does not mutate the original list', () => {
    const draws = [{ id: 'a', code: 'OLD' }];

    applyDrawCodeEdit(draws, 'a', 'NEW');

    assert.equal(draws[0].code, 'OLD');
});

test('applyDrawCodeEdit throws on empty code (code_required)', () => {
    const draws = [{ id: 'a', code: 'OLD' }];
    assert.throws(() => applyDrawCodeEdit(draws, 'a', ''), /code_required/);
});

test('applyDrawCodeEdit throws on code too long (>50 chars)', () => {
    const draws = [{ id: 'a', code: 'OLD' }];
    assert.throws(() => applyDrawCodeEdit(draws, 'a', 'x'.repeat(51)), /code_too_long/);
});

test('applyDrawCodeEdit throws when draw id not found', () => {
    const draws = [{ id: 'a', code: 'OLD' }];
    assert.throws(() => applyDrawCodeEdit(draws, 'z', 'VALID'), /draw_not_found/);
});

test('applyDrawCodeEdit accepts 1-char code (boundary DRAW_CODE_MIN=1)', () => {
    const draws = [{ id: 'a', code: 'OLD' }];
    const updated = applyDrawCodeEdit(draws, 'a', 'X');
    assert.equal(updated[0].code, 'X');
});
