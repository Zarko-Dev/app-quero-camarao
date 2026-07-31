const test = require("node:test");
const assert = require("node:assert/strict");

const { getMessageDeliveryStatus } = require("../src/utils/messageStatus");

const ts = (ms) => ({ toMillis: () => ms });

test("pending quando hasPendingWrites", () => {
    assert.equal(
        getMessageDeliveryStatus({ pending: true, createdAt: null }, {}, "u@x.com"),
        "pending",
    );
});

test("sent sem entrega nem leitura", () => {
    assert.equal(
        getMessageDeliveryStatus({ createdAt: ts(100), deliveredTo: {} }, {}, "u@x.com"),
        "sent",
    );
});

test("delivered com deliveredTo do outro (chave sanitizada)", () => {
    assert.equal(
        getMessageDeliveryStatus(
            { createdAt: ts(100), deliveredTo: { u_x_com: ts(150) } },
            {},
            "u@x.com",
        ),
        "delivered",
    );
});

test("read quando lastSeenAt do outro >= createdAt (ganha de delivered)", () => {
    assert.equal(
        getMessageDeliveryStatus(
            { createdAt: ts(100), deliveredTo: { u_x_com: ts(150) } },
            { u_x_com: ts(200) },
            "u@x.com",
        ),
        "read",
    );
});

test("não lida se visto antes da mensagem", () => {
    assert.equal(
        getMessageDeliveryStatus(
            { createdAt: ts(300), deliveredTo: { u_x_com: ts(350) } },
            { u_x_com: ts(200) },
            "u@x.com",
        ),
        "delivered",
    );
});
