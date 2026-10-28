const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildNotificationBody,
    buildEditNotificationBody,
} = require("../src/utils/buildNotificationBody");

test("single shrimp — correct format with location", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: "8", kilo: "120" }],
        location: "Fortaleza/CE",
    });
    assert.equal(
        body,
        "120kg de camarão de 8g em Fortaleza/CE acaba de ser publicado",
    );
});

test("two shrimps with different grammages — sums kg and lists grammages", () => {
    const body = buildNotificationBody({
        shrimps: [
            { grammage: "8", kilo: "120" },
            { grammage: "12", kilo: "80" },
        ],
        location: "São Paulo/SP",
    });
    assert.equal(
        body,
        "200kg de camarão de 8g e 12g em São Paulo/SP acaba de ser publicado",
    );
});

test("same grammage in multiple shrimps — deduplicates grammage label and sums kg", () => {
    const body = buildNotificationBody({
        shrimps: [
            { grammage: "10", kilo: "100" },
            { grammage: "10", kilo: "50" },
        ],
        location: "Recife/PE",
    });
    assert.equal(
        body,
        "150kg de camarão de 10g em Recife/PE acaba de ser publicado",
    );
});

test("omits location clause when location is empty string", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: "10", kilo: "50" }],
        location: "",
    });
    assert.equal(body, "50kg de camarão de 10g acaba de ser publicado");
});

test("omits location clause when location is undefined", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: "10", kilo: "50" }],
    });
    assert.equal(body, "50kg de camarão de 10g acaba de ser publicado");
});

test("falls back to generic when shrimps array is empty", () => {
    const body = buildNotificationBody({
        shrimps: [],
        location: "Fortaleza/CE",
    });
    assert.equal(body, "Um novo camarão 🦐 foi publicado, venha conferir!");
});

test("falls back to generic when shrimps is undefined", () => {
    const body = buildNotificationBody({});
    assert.equal(body, "Um novo camarão 🦐 foi publicado, venha conferir!");
});

test("falls back to generic when called with no args", () => {
    const body = buildNotificationBody();
    assert.equal(body, "Um novo camarão 🦐 foi publicado, venha conferir!");
});

test("shrimps with kilo as comma-decimal string — parses correctly", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: "8", kilo: "1,5" }],
        location: "Fortaleza/CE",
    });
    assert.equal(
        body,
        "1.5kg de camarão de 8g em Fortaleza/CE acaba de ser publicado",
    );
});

test("large total kg — applies pt-BR thousands separator", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: "8", kilo: "2000" }],
        location: "Fortaleza/CE",
    });
    assert.equal(
        body,
        "2.000kg de camarão de 8g em Fortaleza/CE acaba de ser publicado",
    );
});

test("shrimp objects with extra fields (e.g. imageShrimpUri) — extra fields ignored", () => {
    const body = buildNotificationBody({
        shrimps: [
            { grammage: "10", kilo: "500", imageShrimpUri: "https://storage.example.com/img.jpg" },
        ],
        location: "Recife/PE",
    });
    assert.equal(
        body,
        "500kg de camarão de 10g em Recife/PE acaba de ser publicado",
    );
});

test("multiple ponds with imageShrimpUri — sums all kg across ponds", () => {
    const body = buildNotificationBody({
        shrimps: [
            { grammage: "8", kilo: "300", imageShrimpUri: "" },
            { grammage: "12", kilo: "200", imageShrimpUri: "https://storage.example.com/img2.jpg" },
        ],
        location: "Natal/RN",
    });
    assert.equal(
        body,
        "500kg de camarão de 8g e 12g em Natal/RN acaba de ser publicado",
    );
});

test("shrimps with null grammage or kilo are excluded — falls back when all are invalid", () => {
    const body = buildNotificationBody({
        shrimps: [
            { grammage: null, kilo: "100" },
            { grammage: "8", kilo: null },
        ],
        location: "Salvador/BA",
    });
    assert.equal(body, "Um novo camarão 🦐 foi publicado, venha conferir!");
});

test("exact format Pedro requested: {kg}kg de camarão de {g}g em {cidade} acaba de ser publicado", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: "15", kilo: "750" }],
        location: "Fortaleza/CE",
    });
    assert.equal(
        body,
        "750kg de camarão de 15g em Fortaleza/CE acaba de ser publicado",
    );
});

test("buildEditNotificationBody — formats edited single shrimp with location", () => {
    const body = buildEditNotificationBody({
        shrimps: [{ grammage: "15", kilo: "750" }],
        location: "Fortaleza/CE",
    });
    assert.equal(
        body,
        "750kg de camarão de 15g em Fortaleza/CE foi alterado, venha conferir!",
    );
});

test("buildEditNotificationBody — fallback when shrimps empty", () => {
    const body = buildEditNotificationBody({});
    assert.equal(body, "Uma publicação foi alterada, venha conferir!");
});

