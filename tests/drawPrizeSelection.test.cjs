const assert = require("node:assert/strict");
const test = require("node:test");

const {
    toggleDrawPrizeSelection,
    toggleAllDrawPrizeSelections,
    areAllDrawPrizeSelectionsSelected,
} = require("../src/utils/drawPrizeSelection");

test("toggleDrawPrizeSelection adiciona um id quando ele nao estava selecionado", () => {
    const result = toggleDrawPrizeSelection([], "a");

    assert.deepEqual(result, ["a"]);
});

test("toggleDrawPrizeSelection remove um id quando ele ja estava selecionado", () => {
    const result = toggleDrawPrizeSelection(["a", "b"], "a");

    assert.deepEqual(result, ["b"]);
});

test("toggleAllDrawPrizeSelections seleciona todos quando ainda nao estao todos marcados", () => {
    const result = toggleAllDrawPrizeSelections(["a", "b", "c"], ["a"]);

    assert.deepEqual(result, ["a", "b", "c"]);
});

test("toggleAllDrawPrizeSelections limpa a selecao quando todos estao marcados", () => {
    const result = toggleAllDrawPrizeSelections(["a", "b", "c"], ["a", "b", "c"]);

    assert.deepEqual(result, []);
});

test("areAllDrawPrizeSelectionsSelected retorna true somente quando todos estao selecionados", () => {
    assert.equal(areAllDrawPrizeSelectionsSelected(["a", "b"], ["b", "a"]), true);
    assert.equal(areAllDrawPrizeSelectionsSelected(["a", "b"], ["a"]), false);
});
