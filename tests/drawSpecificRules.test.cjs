const test = require("node:test");
const assert = require("node:assert/strict");

const {
    calculateSuggestedWinners,
    pickWinnersWithAdminPicks,
    filterBlockableWinners,
} = require("../src/utils/drawSpecificRules");

// ---------------------------------------------------------------------------
// calculateSuggestedWinners
// Regra 2-em-5: Math.floor(n * 2 / 5), mínimo 0.
// Limiar mínimo: qualquer n >= 1 pode gerar sugestão (0 se < 5 arredondar para 0).
// ---------------------------------------------------------------------------

test("calculateSuggestedWinners retorna 0 para 0 participantes", () => {
    assert.equal(calculateSuggestedWinners(0), 0);
});

test("calculateSuggestedWinners retorna 1 para 4 participantes (floor de 1.6)", () => {
    // Math.floor(4 * 2 / 5) = Math.floor(1.6) = 1
    assert.equal(calculateSuggestedWinners(4), 1);
});

test("calculateSuggestedWinners retorna 2 para 5 participantes", () => {
    // Math.floor(5 * 2 / 5) = Math.floor(2) = 2
    assert.equal(calculateSuggestedWinners(5), 2);
});

test("calculateSuggestedWinners retorna 2 para 7 participantes (floor de 2.8)", () => {
    // Math.floor(7 * 2 / 5) = Math.floor(2.8) = 2
    assert.equal(calculateSuggestedWinners(7), 2);
});

test("calculateSuggestedWinners retorna 4 para 10 participantes", () => {
    // Math.floor(10 * 2 / 5) = Math.floor(4) = 4
    assert.equal(calculateSuggestedWinners(10), 4);
});

test("calculateSuggestedWinners retorna 5 para 13 participantes (floor de 5.2)", () => {
    // Math.floor(13 * 2 / 5) = Math.floor(5.2) = 5
    assert.equal(calculateSuggestedWinners(13), 5);
});

test("calculateSuggestedWinners retorna 10 para 25 participantes", () => {
    // Math.floor(25 * 2 / 5) = Math.floor(10) = 10
    assert.equal(calculateSuggestedWinners(25), 10);
});

// ---------------------------------------------------------------------------
// pickWinnersWithAdminPicks
// Estrutura de participante de teste:
//   { uid, name, address: { state, city } }
// Chave de identificação: uid || email || cpf (mesmo critério de drawEligibility)
// ---------------------------------------------------------------------------

const makeParticipant = (uid, name = `User ${uid}`) => ({
    uid,
    name,
    address: { state: "SP", city: "Santos" },
});

test("pickWinnersWithAdminPicks sem indicados comporta-se como sorteio puro", () => {
    const eligible = [
        makeParticipant("u1"),
        makeParticipant("u2"),
        makeParticipant("u3"),
    ];

    // randomFn determinístico: sempre retorna 0 (pega primeiro disponível)
    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: eligible,
        adminPickedKeys: [],
        totalWinners: 2,
        randomFn: () => 0,
    });

    assert.equal(winners.length, 2);
    assert.equal(winners[0].uid, "u1");
    assert.equal(winners[1].uid, "u2");
    assert.ok(winners.every((w) => w.isAdminPicked === false));
});

test("pickWinnersWithAdminPicks: 1 indicado + 1 sorteado dos restantes", () => {
    const eligible = [
        makeParticipant("u1"),
        makeParticipant("u2"),
        makeParticipant("u3"),
    ];

    // u2 é indicado. totalWinners=2, então 1 sorteado do restante (u1, u3).
    // randomFn () => 0 pega índice 0 do pool restante (u1)
    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: eligible,
        adminPickedKeys: ["u2"],
        totalWinners: 2,
        randomFn: () => 0,
    });

    assert.equal(winners.length, 2);
    // indicado aparece primeiro
    assert.equal(winners[0].uid, "u2");
    assert.equal(winners[0].isAdminPicked, true);
    // sorteado aparece depois
    assert.equal(winners[1].uid, "u1");
    assert.equal(winners[1].isAdminPicked, false);
});

test("pickWinnersWithAdminPicks: indicado recebe isAdminPicked=true, sorteado recebe false", () => {
    const eligible = [makeParticipant("u1"), makeParticipant("u2")];

    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: eligible,
        adminPickedKeys: ["u1"],
        totalWinners: 2,
        randomFn: () => 0,
    });

    const adminWinner = winners.find((w) => w.uid === "u1");
    const randomWinner = winners.find((w) => w.uid === "u2");

    assert.ok(adminWinner, "u1 deve estar nos ganhadores");
    assert.equal(adminWinner.isAdminPicked, true);
    assert.ok(randomWinner, "u2 deve estar nos ganhadores");
    assert.equal(randomWinner.isAdminPicked, false);
});

test("pickWinnersWithAdminPicks: indicado nao-elegivel e descartado silenciosamente", () => {
    const eligible = [makeParticipant("u1"), makeParticipant("u2")];

    // u99 não existe nos elegíveis
    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: eligible,
        adminPickedKeys: ["u99"],
        totalWinners: 2,
        randomFn: () => 0,
    });

    // u99 descartado, os 2 ganhadores vêm do sorteio puro
    assert.equal(winners.length, 2);
    assert.ok(winners.every((w) => w.isAdminPicked === false));
    assert.ok(winners.some((w) => w.uid === "u1"));
    assert.ok(winners.some((w) => w.uid === "u2"));
});

test("pickWinnersWithAdminPicks: indicados > totalWinners — trunca indicados, zero sorteados", () => {
    const eligible = [
        makeParticipant("u1"),
        makeParticipant("u2"),
        makeParticipant("u3"),
        makeParticipant("u4"),
    ];

    // 3 indicados mas totalWinners=2 — retorna só os 2 primeiros indicados
    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: eligible,
        adminPickedKeys: ["u1", "u2", "u3"],
        totalWinners: 2,
        randomFn: () => 0,
    });

    assert.equal(winners.length, 2);
    assert.equal(winners[0].uid, "u1");
    assert.equal(winners[1].uid, "u2");
    assert.ok(winners.every((w) => w.isAdminPicked === true));
});

test("pickWinnersWithAdminPicks: totalWinners > elegíveis disponíveis — retorna o que conseguir sem repetir", () => {
    const eligible = [makeParticipant("u1"), makeParticipant("u2")];

    // Pede 5 ganhadores mas só há 2 elegíveis
    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: eligible,
        adminPickedKeys: [],
        totalWinners: 5,
        randomFn: () => 0,
    });

    assert.equal(winners.length, 2);
    const uids = winners.map((w) => w.uid);
    assert.equal(new Set(uids).size, 2); // sem repetições
});

test("pickWinnersWithAdminPicks: adminPickedKeys com duplicatas — deduplicar", () => {
    const eligible = [
        makeParticipant("u1"),
        makeParticipant("u2"),
        makeParticipant("u3"),
    ];

    // u1 duplicado em adminPickedKeys
    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: eligible,
        adminPickedKeys: ["u1", "u1", "u2"],
        totalWinners: 3,
        randomFn: () => 0,
    });

    // u1 deve aparecer apenas 1 vez
    const u1Count = winners.filter((w) => w.uid === "u1").length;
    assert.equal(u1Count, 1);
    assert.equal(winners.length, 3); // u1 (indicado), u2 (indicado), u3 (sorteado)
});

test("pickWinnersWithAdminPicks: lista de elegíveis vazia retorna array vazio", () => {
    const winners = pickWinnersWithAdminPicks({
        eligibleParticipants: [],
        adminPickedKeys: ["u1"],
        totalWinners: 3,
        randomFn: () => 0,
    });

    assert.equal(winners.length, 0);
});

// ---------------------------------------------------------------------------
// filterBlockableWinners
// Retorna apenas winners com isAdminPicked === false
// ---------------------------------------------------------------------------

test("filterBlockableWinners separa sorteados dos indicados", () => {
    const winners = [
        { uid: "u1", isAdminPicked: true },
        { uid: "u2", isAdminPicked: false },
        { uid: "u3", isAdminPicked: true },
        { uid: "u4", isAdminPicked: false },
    ];

    const blockable = filterBlockableWinners(winners);

    assert.equal(blockable.length, 2);
    assert.ok(blockable.every((w) => w.isAdminPicked === false));
    assert.ok(blockable.some((w) => w.uid === "u2"));
    assert.ok(blockable.some((w) => w.uid === "u4"));
});

test("filterBlockableWinners com lista vazia retorna array vazio", () => {
    const blockable = filterBlockableWinners([]);
    assert.equal(blockable.length, 0);
});

test("filterBlockableWinners com todos indicados retorna array vazio", () => {
    const winners = [
        { uid: "u1", isAdminPicked: true },
        { uid: "u2", isAdminPicked: true },
    ];

    const blockable = filterBlockableWinners(winners);
    assert.equal(blockable.length, 0);
});

test("filterBlockableWinners com todos sorteados retorna todos", () => {
    const winners = [
        { uid: "u1", isAdminPicked: false },
        { uid: "u2", isAdminPicked: false },
    ];

    const blockable = filterBlockableWinners(winners);
    assert.equal(blockable.length, 2);
});
