const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildEligibleParticipants,
    pickRandomUniqueWinners,
} = require("../src/utils/drawEligibility");

test("excludes previous winners by uid from eligible participants", () => {
    const participants = [
        { uid: "u1", email: "u1@test.com", address: { state: "SP", city: "Santos" } },
        { uid: "u2", email: "u2@test.com", address: { state: "SP", city: "Santos" } },
    ];

    const previousWinners = [{ uid: "u1", email: "u1@test.com" }];
    const logs = [];

    const eligible = buildEligibleParticipants({
        participants,
        previousWinners,
        logger: (message) => logs.push(message),
    });

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].uid, "u2");
    assert.ok(logs.some((line) => line.includes("excluded") && line.includes("u1")));
});

test("excludes participant without location and logs reason", () => {
    const participants = [
        { uid: "u1", email: "u1@test.com" },
        { uid: "u2", email: "u2@test.com", state: "SP", city: "Santos" },
    ];

    const logs = [];
    const eligible = buildEligibleParticipants({
        participants,
        previousWinners: [],
        logger: (message) => logs.push(message),
    });

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].uid, "u2");
    assert.ok(logs.some((line) => line.includes("missing_location") && line.includes("u1")));
});

test("pickRandomUniqueWinners never repeats winners in the same draw", () => {
    const eligible = [
        { uid: "u1" },
        { uid: "u2" },
        { uid: "u3" },
    ];

    const winners = pickRandomUniqueWinners(eligible, 3, () => 0);
    const winnerUids = winners.map((winner) => winner.uid);

    assert.deepEqual(winnerUids, ["u1", "u2", "u3"]);
    assert.equal(new Set(winnerUids).size, winnerUids.length);
});
