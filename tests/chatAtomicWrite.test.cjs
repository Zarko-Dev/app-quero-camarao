const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const { commitChatWrites } = require("../src/utils/chatAtomicWrite");

const createBatchSpy = () => {
    const calls = [];
    return {
        calls,
        update: (...args) => calls.push(["update", ...args]),
        set: (...args) => calls.push(["set", ...args]),
        commit: async () => calls.push(["commit"]),
    };
};

test("creates a new chat first, then the first message and lastMessage in a second atomic batch", async () => {
    const batches = [];
    const writeBatch = () => {
        const b = createBatchSpy();
        batches.push(b);
        return b;
    };

    await commitChatWrites({
        firestore: "firestore",
        chatRef: "chat-ref",
        messageRef: "message-ref",
        chatExists: false,
        chatData: { status: "active", lastMessage: "Olá", lastMessageAt: "ts", updatedAt: "ts" },
        messageData: { text: "Olá" },
        writeBatch,
    });

    assert.deepEqual(batches[0].calls, [
        ["set", "chat-ref", { status: "active", lastMessage: "" }],
        ["commit"],
    ]);
    assert.deepEqual(batches[1].calls, [
        ["update", "chat-ref", { lastMessage: "Olá", lastMessageAt: "ts", updatedAt: "ts" }],
        ["set", "message-ref", { text: "Olá" }],
        ["commit"],
    ]);
    assert.equal(batches.length, 2);
});

test("retries the message batch once and does not recreate the chat", async () => {
    const batches = [];
    let commits = 0;
    const writeBatch = () => {
        const b = createBatchSpy();
        b.commit = async () => {
            commits += 1;
            if (commits === 2) throw new Error("boom");
            b.calls.push(["commit"]);
        };
        batches.push(b);
        return b;
    };

    await commitChatWrites({
        firestore: "firestore",
        chatRef: "chat-ref",
        messageRef: "message-ref",
        chatExists: false,
        chatData: { status: "active", lastMessage: "Olá" },
        messageData: { text: "Olá" },
        writeBatch,
    });

    assert.equal(batches.length, 3);
    assert.equal(batches.filter((b) => b.calls.some((c) => c[0] === "set" && c[1] === "chat-ref")).length, 1);
});

test("propagates the error when the message batch fails twice", async () => {
    let commits = 0;
    const writeBatch = () => ({
        update: () => {},
        set: () => {},
        commit: async () => {
            commits += 1;
            if (commits > 1) throw new Error("denied");
        },
    });

    await assert.rejects(commitChatWrites({
        firestore: "f",
        chatRef: "c",
        messageRef: "m",
        chatExists: false,
        chatData: { lastMessage: "x" },
        messageData: {},
        writeBatch,
    }), /denied/);
});

test("updates an existing chat and creates its message in one atomic commit", async () => {
    const batch = createBatchSpy();

    await commitChatWrites({
        firestore: "firestore",
        chatRef: "chat-ref",
        messageRef: "message-ref",
        chatExists: true,
        chatData: { lastMessage: "Olá" },
        messageData: { text: "Olá" },
        writeBatch: () => batch,
    });

    assert.deepEqual(batch.calls, [
        ["update", "chat-ref", { lastMessage: "Olá" }],
        ["set", "message-ref", { text: "Olá" }],
        ["commit"],
    ]);
});

test("Firestore rules validate the final chat state for atomic first-message writes", () => {
    const rules = fs.readFileSync("firestore.rules", "utf8");

    assert.match(rules, /existsAfter\([^\n]+chats\/\$\(chatId\)/);
    assert.match(rules, /getAfter\([^\n]+chats\/\$\(chatId\)/);
    assert.match(rules, /function isChatParticipantAfter\(\)/);
});
