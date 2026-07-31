const test = require("node:test");
const assert = require("node:assert/strict");

const { isUnread, sortChatsUnreadFirst } = require("../src/utils/chatListSort");

const ts = (ms) => ({ toMillis: () => ms });

test("isUnread: sem lastSeen é não lida", () => {
    assert.equal(isUnread({ lastMessage: "oi", lastMessageAt: ts(100), lastSeenAt: {} }, "u"), true);
});

test("isUnread: mensagem depois do lastSeen é não lida", () => {
    assert.equal(
        isUnread({ lastMessage: "oi", lastMessageAt: ts(200), lastSeenAt: { u: ts(100) } }, "u"),
        true,
    );
});

test("isUnread: vista depois da mensagem é lida", () => {
    assert.equal(
        isUnread({ lastMessage: "oi", lastMessageAt: ts(100), lastSeenAt: { u: ts(200) } }, "u"),
        false,
    );
});

test("isUnread: sem lastMessage é lida", () => {
    assert.equal(isUnread({ lastMessageAt: ts(100), lastSeenAt: {} }, "u"), false);
});

test("sortChatsUnreadFirst: não lidas primeiro, depois data desc", () => {
    const read1 = { id: "r1", lastMessage: "a", lastMessageAt: ts(500), lastSeenAt: { u: ts(900) } };
    const read2 = { id: "r2", lastMessage: "b", lastMessageAt: ts(300), lastSeenAt: { u: ts(900) } };
    const unread1 = { id: "u1", lastMessage: "c", lastMessageAt: ts(400), lastSeenAt: {} };
    const unread2 = { id: "u2", lastMessage: "d", lastMessageAt: ts(200), lastSeenAt: {} };

    const sorted = sortChatsUnreadFirst([read2, unread2, read1, unread1], "u");
    assert.deepEqual(sorted.map((c) => c.id), ["u1", "u2", "r1", "r2"]);
});

test("sortChatsUnreadFirst: não muta o array original e aceita vazio", () => {
    const arr = [];
    assert.deepEqual(sortChatsUnreadFirst(arr, "u"), []);
    const one = [{ id: "x", lastMessage: "a", lastMessageAt: ts(1), lastSeenAt: {} }];
    const out = sortChatsUnreadFirst(one, "u");
    assert.notEqual(out, one);
});
