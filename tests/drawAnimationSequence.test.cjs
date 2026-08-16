const test = require("node:test");
const assert = require("node:assert/strict");

const {
    TIMING,
    animationSteps,
    buildAnimationSequence,
} = require("../src/utils/drawAnimationSequence");

test("TIMING.LOADING_REVEAL_MS is 7000ms", () => {
    assert.equal(TIMING.LOADING_REVEAL_MS, 7000);
});

test("TIMING.WIN_TO_CONTINUOUS_MS is 2500ms", () => {
    assert.equal(TIMING.WIN_TO_CONTINUOUS_MS, 2500);
});

test("animationSteps.loading has correct shape", () => {
    assert.equal(animationSteps.loading.key, "loading");
    assert.equal(animationSteps.loading.width, 350);
    assert.equal(animationSteps.loading.height, 350);
    assert.equal(animationSteps.loading.loop, false);
    assert.equal(animationSteps.loading.speed, 0.4);
});

test("animationSteps.win has correct shape", () => {
    assert.equal(animationSteps.win.key, "win");
    assert.equal(animationSteps.win.width, 500);
    assert.equal(animationSteps.win.height, 500);
    assert.equal(animationSteps.win.loop, false);
    assert.equal(animationSteps.win.speed, 0.7);
});

test("animationSteps.continuous has correct shape and loops", () => {
    assert.equal(animationSteps.continuous.key, "continuous");
    assert.equal(animationSteps.continuous.width, 500);
    assert.equal(animationSteps.continuous.height, 500);
    assert.equal(animationSteps.continuous.loop, true);
    assert.equal(animationSteps.continuous.speed, 1);
});

test("buildAnimationSequence returns 3 steps", () => {
    const seq = buildAnimationSequence();
    assert.equal(seq.length, 3);
});

test("buildAnimationSequence first step is loading at delay 0", () => {
    const [first] = buildAnimationSequence();
    assert.equal(first.step, "loading");
    assert.equal(first.delayMs, 0);
});

test("buildAnimationSequence second step is win at LOADING_REVEAL_MS", () => {
    const [, second] = buildAnimationSequence();
    assert.equal(second.step, "win");
    assert.equal(second.delayMs, TIMING.LOADING_REVEAL_MS);
});

test("buildAnimationSequence third step is continuous at LOADING_REVEAL_MS + WIN_TO_CONTINUOUS_MS", () => {
    const [, , third] = buildAnimationSequence();
    assert.equal(third.step, "continuous");
    assert.equal(
        third.delayMs,
        TIMING.LOADING_REVEAL_MS + TIMING.WIN_TO_CONTINUOUS_MS,
    );
});

test("buildAnimationSequence steps match animationSteps keys", () => {
    const seq = buildAnimationSequence();
    for (const { step } of seq) {
        assert.ok(
            animationSteps[step] !== undefined,
            `step "${step}" must exist in animationSteps`,
        );
    }
});
