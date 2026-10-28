const test = require("node:test");
const assert = require("node:assert/strict");

const { deriveNextChatSessionState } = require("../src/utils/chatSessionState");

test("mantém estado transitório quando continua no mesmo chat", () => {
    const current = {
        autoSent: true,
        messagesReady: true,
        deliveredMarkedIds: ["m1", "m2"],
        lastSeenSignature: "m1|m2",
    };

    assert.deepEqual(
        deriveNextChatSessionState("chat-a", "chat-a", current),
        current,
    );
});

test("zera estado transitório ao trocar para outro chat", () => {
    const current = {
        autoSent: true,
        messagesReady: true,
        deliveredMarkedIds: ["m1", "m2"],
        lastSeenSignature: "m1|m2",
    };

    assert.deepEqual(
        deriveNextChatSessionState("chat-a", "chat-b", current),
        {
            autoSent: false,
            messagesReady: false,
            deliveredMarkedIds: [],
            lastSeenSignature: "",
        },
    );
});
