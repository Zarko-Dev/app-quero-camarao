const test = require("node:test");
const assert = require("node:assert/strict");

const { getMessageReadStatus } = require("../src/utils/chatReadStatus");

const ts = (ms) => ({ toMillis: () => ms });

test("getMessageReadStatus retorna read quando a mensagem foi enviada antes do lastSeenAt do outro usuário", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(1000) }, { buyer1: ts(2000) }, "buyer1"),
        "read",
    );
});

test("getMessageReadStatus retorna read quando os timestamps são iguais", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(2000) }, { buyer1: ts(2000) }, "buyer1"),
        "read",
    );
});

test("getMessageReadStatus retorna sent quando a mensagem foi enviada depois do lastSeenAt do outro usuário", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(3000) }, { buyer1: ts(2000) }, "buyer1"),
        "sent",
    );
});

test("getMessageReadStatus retorna sent quando o outro usuário não tem entrada em lastSeenAt", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(1000) }, {}, "buyer1"),
        "sent",
    );
});

test("getMessageReadStatus retorna sent quando lastSeenAt é undefined", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(1000) }, undefined, "buyer1"),
        "sent",
    );
});

test("getMessageReadStatus retorna sent quando a mensagem não tem createdAt", () => {
    assert.equal(
        getMessageReadStatus({}, { buyer1: ts(2000) }, "buyer1"),
        "sent",
    );
});

test("getMessageReadStatus sanitizes email-shaped user ids before looking up lastSeenAt (matches markChatAsSeen's key format)", () => {
    assert.equal(
        getMessageReadStatus(
            { createdAt: ts(1000) },
            { "seller_example_com": ts(2000) },
            "seller@example.com",
        ),
        "read",
    );
});
