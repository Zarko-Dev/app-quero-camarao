const assert = require("node:assert/strict");
const test = require("node:test");

const {
    buildSoftDeleteDrawPrizeUpdate,
    filterActiveDrawPrizes,
} = require("../src/controllers/DrawPrizes/helpers");

test("buildSoftDeleteDrawPrizeUpdate marks draw prize as deleted", () => {
    const result = buildSoftDeleteDrawPrizeUpdate(new Date("2026-07-04T12:00:00.000Z"));

    assert.equal(result.isDeleted, true);
    assert.equal(result.deletedAt.toISOString(), "2026-07-04T12:00:00.000Z");
    assert.equal(result.updatedAt.toISOString(), "2026-07-04T12:00:00.000Z");
});

test("filterActiveDrawPrizes removes deleted draw prizes", () => {
    const result = filterActiveDrawPrizes([
        { id: "1", drawPrizeName: "Ativo" },
        { id: "2", drawPrizeName: "Apagado", isDeleted: true },
        { id: "3", drawPrizeName: "Outro ativo" },
    ]);

    assert.deepEqual(result.map((item) => item.id), ["1", "3"]);
});
