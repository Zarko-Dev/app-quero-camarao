const assert = require("node:assert/strict");
const test = require("node:test");
const { object, string } = require("yup");

// Espelha as regras novas do schema (neighborhood/street/number com trim + required).
const schema = object({
    neighborhood: string().trim().required(),
    street: string().trim().required(),
    number: string().trim().required(),
});

test("rejeita bairro/rua/numero vazios ou so espacos", () => {
    for (const bad of ["", "   "]) {
        assert.throws(() => schema.validateSync({ neighborhood: bad, street: "R", number: "1" }));
        assert.throws(() => schema.validateSync({ neighborhood: "B", street: bad, number: "1" }));
        assert.throws(() => schema.validateSync({ neighborhood: "B", street: "R", number: bad }));
    }
    assert.doesNotThrow(() => schema.validateSync({ neighborhood: "B", street: "R", number: "S/N" }));
});
