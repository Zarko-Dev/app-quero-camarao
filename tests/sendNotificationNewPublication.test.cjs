const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildNotificationBody,
    buildEditNotificationBody,
} = require("../src/utils/buildNotificationBody");

test("buildNotificationBody formats single shrimp with grammage, kilo and location", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: 12, kilo: 500 }],
        location: "Fortaleza/CE",
    });
    assert.equal(body, "500kg de camarão de 12g em Fortaleza/CE acaba de ser publicado");
});

test("buildNotificationBody formats multiple shrimps and sums kg", () => {
    const body = buildNotificationBody({
        shrimps: [
            { grammage: "10", kilo: "300" },
            { grammage: "14", kilo: "200" },
        ],
        location: "Aracati/CE",
    });
    assert.equal(body, "500kg de camarão de 10g e 14g em Aracati/CE acaba de ser publicado");
});

test("buildNotificationBody handles object location", () => {
    const body = buildNotificationBody({
        shrimps: [{ grammage: "10g", kilo: "1000" }],
        location: { city: "Natal", state: "RN" },
    });
    assert.equal(body, "1.000kg de camarão de 10g em Natal/RN acaba de ser publicado");
});

test("buildNotificationBody fallback when shrimps empty", () => {
    const body = buildNotificationBody({
        shrimps: [],
        location: "Fortaleza/CE",
    });
    assert.equal(body, "Um novo camarão 🦐 foi publicado, venha conferir!");
});

test("buildEditNotificationBody formats edited shrimp notification correctly", () => {
    const body = buildEditNotificationBody({
        shrimps: [{ grammage: "14g", kilo: "1800" }],
        location: { city: "Palhano", state: "CE" },
    });
    assert.equal(body, "1.800kg de camarão de 14g em Palhano/CE foi alterado, venha conferir!");
});

test("buildNotificationBody deduplication simulation via Set", () => {
    const sentSet = new Set();
    const pubId = "pub-12345";

    let sendCount = 0;
    const send = (id) => {
        if (id && sentSet.has(id)) return;
        if (id) sentSet.add(id);
        sendCount += 1;
    };

    send(pubId);
    send(pubId);

    assert.equal(sendCount, 1);
});

