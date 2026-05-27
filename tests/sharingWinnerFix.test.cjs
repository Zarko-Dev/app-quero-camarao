const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildWinnersShareMessage,
    buildSingleWinnerShareMessage,
} = require("../src/utils/winnerShareMessage");

test("buildWinnersShareMessage includes winners, draw name and link", () => {
    const message = buildWinnersShareMessage(
        [
            { name: "Ana", drawName: "Sorteio Camarao", phone: "11999999999" },
            { name: "Bruno", drawName: "Sorteio Camarao", phone: "11888888888" },
        ],
        "https://quero-camarao.app"
    );

    assert.ok(message.includes("Vencedores"));
    assert.ok(message.includes("Sorteio Camarao"));
    assert.ok(message.includes("Ana"));
    assert.ok(message.includes("Bruno"));
    assert.ok(message.includes("https://quero-camarao.app"));
});

test("buildSingleWinnerShareMessage includes winner name and link", () => {
    const message = buildSingleWinnerShareMessage(
        { name: "Carla", drawName: "Rodada 7", phone: "11977777777" },
        "https://quero-camarao.app"
    );

    assert.ok(message.includes("Carla"));
    assert.ok(message.includes("Rodada 7"));
    assert.ok(message.includes("https://quero-camarao.app"));
});
