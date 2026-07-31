const test = require("node:test");
const assert = require("node:assert/strict");

const {
    groupUsersByStateCity,
} = require("../src/utils/groupUsersByStateCity");

test("groupUsersByStateCity keeps partial address users in fallback bucket", () => {
    const users = [
        { name: "Ana", address: { cep: "60000-000" } },
        { name: "Bia", address: { state: "CE", city: "Fortaleza" } },
        { name: "Caio", state: "RN", city: "Natal" },
    ];

    const grouped = groupUsersByStateCity(users);

    assert.deepEqual(grouped.map((item) => item.state), [
        "CE",
        "RN",
        "Não Identificado",
    ]);

    const fallback = grouped.find((item) => item.state === "Não Identificado");

    assert.ok(fallback);
    assert.deepEqual(fallback.data.map((item) => item.city), [
        "Não Identificado",
    ]);
    assert.equal(fallback.data[0].count, 1);
});

test("groupUsersByStateCity sorts cities inside each state", () => {
    const users = [
        { name: "A", address: { state: "CE", city: "Sobral" } },
        { name: "B", address: { state: "CE", city: "Fortaleza" } },
    ];

    const grouped = groupUsersByStateCity(users);
    const ce = grouped.find((item) => item.state === "CE");

    assert.deepEqual(ce.data.map((item) => item.city), [
        "Fortaleza",
        "Sobral",
    ]);
});
