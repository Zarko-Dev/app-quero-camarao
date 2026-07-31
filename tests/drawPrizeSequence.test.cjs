const test = require("node:test");
const assert = require("node:assert/strict");

const {
    partitionIndicatedAndRandom,
} = require("../src/utils/drawEligibility");

test("partitions indicated winners sequentially up to countPrizes and returns remaining indicated ids", () => {
    const participants = [
        { uid: "u1", email: "u1@test.com" },
        { uid: "u2", email: "u2@test.com" },
        { uid: "u3", email: "u3@test.com" },
        { uid: "u4", email: "u4@test.com" },
    ];
    const eligibleParticipants = [...participants];
    const indicatedIds = ["u1", "u2", "u3"];

    // Draw 2 winners
    const { winners, remainingIndicatedIds } = partitionIndicatedAndRandom({
        indicatedIds,
        previousWinners: [],
        participants,
        eligibleParticipants,
        countPrizes: 2,
        pickRandomFn: () => [], // no randoms needed/expected
    });

    assert.equal(winners.length, 2);
    assert.equal(winners[0].uid, "u1");
    assert.ok(winners[0].indicated);
    assert.equal(winners[1].uid, "u2");
    assert.ok(winners[1].indicated);

    assert.deepEqual(remainingIndicatedIds, ["u3"]);
});

test("falls back to random drawings when countPrizes exceeds active indicated list", () => {
    const participants = [
        { uid: "u1", email: "u1@test.com" },
        { uid: "u2", email: "u2@test.com" },
        { uid: "u3", email: "u3@test.com" },
        { uid: "u4", email: "u4@test.com" },
    ];
    const eligibleParticipants = [...participants];
    const indicatedIds = ["u1"];

    // Draw 3 winners. u1 should win as indicated, u2 and u3 randomly.
    // Ensure the pool for random excludes u1.
    let calledPool = null;
    const mockPickRandom = (pool, count) => {
        calledPool = pool;
        return pool.slice(0, count);
    };

    const { winners, remainingIndicatedIds } = partitionIndicatedAndRandom({
        indicatedIds,
        previousWinners: [],
        participants,
        eligibleParticipants,
        countPrizes: 3,
        pickRandomFn: mockPickRandom,
    });

    // Indicated winners + random winners
    assert.equal(winners.length, 3);
    assert.equal(winners[0].uid, "u1");
    assert.ok(winners[0].indicated);
    assert.equal(winners[1].uid, "u2"); // from mockPickRandom
    assert.equal(winners[2].uid, "u3"); // from mockPickRandom

    // The random pool must exclude the active indicated participant (u1)
    assert.ok(calledPool);
    assert.equal(calledPool.some(p => p.uid === "u1"), false);

    assert.deepEqual(remainingIndicatedIds, []);
});

test("skips indicated participants who have already won, and does not let them win again", () => {
    const participants = [
        { uid: "u1", email: "u1@test.com" },
        { uid: "u2", email: "u2@test.com" },
        { uid: "u3", email: "u3@test.com" },
    ];
    const eligibleParticipants = [
        { uid: "u2", email: "u2@test.com" },
        { uid: "u3", email: "u3@test.com" },
    ]; // u1 already excluded from eligible pool in buildEligibleParticipants
    const previousWinners = [{ uid: "u1", email: "u1@test.com" }];
    const indicatedIds = ["u1", "u2"];

    // Draw 1 winner. u1 should be skipped because they are a previous winner. u2 should win.
    const { winners, remainingIndicatedIds } = partitionIndicatedAndRandom({
        indicatedIds,
        previousWinners,
        participants,
        eligibleParticipants,
        countPrizes: 1,
        pickRandomFn: () => [],
    });

    assert.equal(winners.length, 1);
    assert.equal(winners[0].uid, "u2");
    assert.ok(winners[0].indicated);

    assert.deepEqual(remainingIndicatedIds, []);
});
