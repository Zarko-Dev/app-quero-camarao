'use strict';
// Extended tests for drawAnimationSequence — timing consistency and structural invariants.
// These complement the basic property tests in drawAnimationSequence.test.cjs.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    TIMING,
    animationSteps,
    buildAnimationSequence,
} = require('../src/utils/drawAnimationSequence');

test('buildAnimationSequence steps have strictly ascending delayMs (no step starts before previous)', () => {
    const seq = buildAnimationSequence();
    for (let i = 1; i < seq.length; i++) {
        assert.ok(
            seq[i].delayMs > seq[i - 1].delayMs,
            `step[${i}].delayMs (${seq[i].delayMs}) must be > step[${i - 1}].delayMs (${seq[i - 1].delayMs})`
        );
    }
});

test('first step always starts at delayMs=0 (no initial delay)', () => {
    const [first] = buildAnimationSequence();
    assert.equal(first.delayMs, 0);
});

test('all step keys in sequence exist in animationSteps dictionary', () => {
    const seq = buildAnimationSequence();
    seq.forEach(({ step }) => {
        assert.ok(
            step in animationSteps,
            `step key "${step}" must exist in animationSteps`
        );
    });
});

test('only the last step has loop=true (continuous)', () => {
    const seq = buildAnimationSequence();
    const lastStep = seq[seq.length - 1];
    assert.equal(animationSteps[lastStep.step].loop, true, 'last step loops');
    seq.slice(0, -1).forEach(({ step }) => {
        assert.equal(animationSteps[step].loop, false, `step "${step}" must not loop`);
    });
});

test('TIMING values are positive integers (not zero, not NaN)', () => {
    Object.entries(TIMING).forEach(([key, value]) => {
        assert.ok(Number.isInteger(value) && value > 0, `TIMING.${key} must be a positive integer, got ${value}`);
    });
});

test('animationSteps win and continuous have larger dimensions than loading (reveal is bigger)', () => {
    assert.ok(animationSteps.win.width >= animationSteps.loading.width);
    assert.ok(animationSteps.win.height >= animationSteps.loading.height);
    assert.ok(animationSteps.continuous.width >= animationSteps.loading.width);
    assert.ok(animationSteps.continuous.height >= animationSteps.loading.height);
});

test('loading step is slower than win step (lower speed is slower)', () => {
    assert.ok(
        animationSteps.loading.speed < animationSteps.win.speed,
        'loading should play slower than win reveal'
    );
});

test('buildAnimationSequence is pure — returns a new array each call', () => {
    const seq1 = buildAnimationSequence();
    const seq2 = buildAnimationSequence();
    assert.notEqual(seq1, seq2, 'must return a new array reference each call');
    assert.deepEqual(seq1, seq2, 'but with identical content');
});
