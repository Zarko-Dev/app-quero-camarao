const assert = require("node:assert/strict");
const test = require("node:test");

const {
    shouldSendInitialChatMessage,
} = require("../src/utils/initialChatMessage");

test("allows the automatic greeting only when the new chat document does not exist", () => {
    const base = {
        autoSend: true,
        initialMessage: "Olá, tenho interesse",
        myId: "buyer@example.com",
        buyerId: "buyer@example.com",
        autoSent: false,
    };

    assert.equal(
        shouldSendInitialChatMessage({ ...base, chatExists: false }),
        true,
    );
    assert.equal(
        shouldSendInitialChatMessage({ ...base, chatExists: true }),
        false,
    );
});

test("does not send the automatic greeting without a complete route/session", () => {
    assert.equal(
        shouldSendInitialChatMessage({
            autoSend: true,
            initialMessage: "Olá",
            myId: null,
            buyerId: "buyer@example.com",
            chatExists: false,
            autoSent: false,
        }),
        false,
    );
});

test("sends the greeting when the chat document exists but has no message yet", () => {
    const base = {
        autoSend: true,
        initialMessage: "Olá",
        myId: "buyer@example.com",
        buyerId: "buyer@example.com",
        autoSent: false,
        chatExists: true,
    };

    assert.equal(shouldSendInitialChatMessage({ ...base, chatHasMessages: false }), true);
    assert.equal(shouldSendInitialChatMessage({ ...base, chatHasMessages: true }), false);
    assert.equal(shouldSendInitialChatMessage({ ...base, autoSent: true, chatHasMessages: false }), false);
});
