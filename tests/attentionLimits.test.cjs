const test = require("node:test");
const assert = require("node:assert/strict");

const {
    canSendAttention,
    appendAttention,
} = require("../src/utils/attentionLimits");

const NOW = 1_800_000_000_000;

test("canSendAttention allows when history is empty", () => {
    assert.deepEqual(canSendAttention([], NOW), { allowed: true });
});

test("canSendAttention allows when history is null or undefined", () => {
    assert.deepEqual(canSendAttention(null, NOW), { allowed: true });
    assert.deepEqual(canSendAttention(undefined, NOW), { allowed: true });
});

test("canSendAttention blocks with cooldown within 30s of last send", () => {
    assert.deepEqual(
        canSendAttention([NOW - 10_000], NOW),
        { allowed: false, reason: "cooldown" },
    );
});

test("canSendAttention blocks with cooldown right below the 30s edge", () => {
    assert.deepEqual(
        canSendAttention([NOW - 29_999], NOW),
        { allowed: false, reason: "cooldown" },
    );
});

test("canSendAttention allows exactly at 30s since last send", () => {
    assert.deepEqual(canSendAttention([NOW - 30_000], NOW), { allowed: true });
});

test("canSendAttention blocks with window when 5 sends in last 10min", () => {
    const timestamps = [
        NOW - 500_000,
        NOW - 400_000,
        NOW - 300_000,
        NOW - 200_000,
        NOW - 100_000,
    ];
    assert.deepEqual(
        canSendAttention(timestamps, NOW),
        { allowed: false, reason: "window" },
    );
});

test("canSendAttention allows when older sends fall out of the 10min window", () => {
    const timestamps = [
        NOW - 700_000,
        NOW - 650_000,
        NOW - 300_000,
        NOW - 200_000,
        NOW - 100_000,
    ];
    assert.deepEqual(canSendAttention(timestamps, NOW), { allowed: true });
});

test("canSendAttention allows with 4 sends in window past cooldown", () => {
    const timestamps = [
        NOW - 400_000,
        NOW - 300_000,
        NOW - 200_000,
        NOW - 100_000,
    ];
    assert.deepEqual(canSendAttention(timestamps, NOW), { allowed: true });
});

test("canSendAttention reports cooldown before window when both apply", () => {
    const timestamps = [
        NOW - 500_000,
        NOW - 400_000,
        NOW - 300_000,
        NOW - 200_000,
        NOW - 10_000,
    ];
    assert.deepEqual(
        canSendAttention(timestamps, NOW),
        { allowed: false, reason: "cooldown" },
    );
});

test("canSendAttention ignores unsorted input and uses most recent timestamp", () => {
    const timestamps = [NOW - 10_000, NOW - 500_000];
    assert.deepEqual(
        canSendAttention(timestamps, NOW),
        { allowed: false, reason: "cooldown" },
    );
});

test("appendAttention appends now to empty or missing history", () => {
    assert.deepEqual(appendAttention([], NOW), [NOW]);
    assert.deepEqual(appendAttention(null, NOW), [NOW]);
    assert.deepEqual(appendAttention(undefined, NOW), [NOW]);
});

test("appendAttention keeps existing entries plus new one", () => {
    assert.deepEqual(
        appendAttention([NOW - 60_000, NOW - 40_000], NOW),
        [NOW - 60_000, NOW - 40_000, NOW],
    );
});

test("appendAttention trims to the 5 most recent", () => {
    const timestamps = [
        NOW - 500_000,
        NOW - 400_000,
        NOW - 300_000,
        NOW - 200_000,
        NOW - 100_000,
    ];
    assert.deepEqual(appendAttention(timestamps, NOW), [
        NOW - 400_000,
        NOW - 300_000,
        NOW - 200_000,
        NOW - 100_000,
        NOW,
    ]);
});

test("appendAttention does not mutate the input array", () => {
    const timestamps = [NOW - 60_000];
    appendAttention(timestamps, NOW);
    assert.deepEqual(timestamps, [NOW - 60_000]);
});

test("appendAttention sorts unsorted input before trimming", () => {
    const timestamps = [
        NOW - 100_000,
        NOW - 500_000,
        NOW - 300_000,
        NOW - 400_000,
        NOW - 200_000,
    ];
    assert.deepEqual(appendAttention(timestamps, NOW), [
        NOW - 400_000,
        NOW - 300_000,
        NOW - 200_000,
        NOW - 100_000,
        NOW,
    ]);
});
