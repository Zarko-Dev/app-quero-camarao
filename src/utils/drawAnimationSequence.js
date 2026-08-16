const TIMING = {
    LOADING_REVEAL_MS: 7000,
    WIN_TO_CONTINUOUS_MS: 2500,
};

const animationSteps = {
    loading: {
        key: "loading",
        width: 350,
        height: 350,
        loop: false,
        speed: 0.4,
    },
    win: {
        key: "win",
        width: 500,
        height: 500,
        loop: false,
        speed: 0.7,
    },
    continuous: {
        key: "continuous",
        width: 500,
        height: 500,
        loop: true,
        speed: 1,
    },
};

const buildAnimationSequence = () => [
    { step: "loading", delayMs: 0 },
    { step: "win", delayMs: TIMING.LOADING_REVEAL_MS },
    {
        step: "continuous",
        delayMs: TIMING.LOADING_REVEAL_MS + TIMING.WIN_TO_CONTINUOUS_MS,
    },
];

module.exports = { TIMING, animationSteps, buildAnimationSequence };
