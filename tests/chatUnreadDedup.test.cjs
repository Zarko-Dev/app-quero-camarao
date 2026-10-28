const test = require("node:test");
const assert = require("node:assert/strict");

const { computeUnreadCount } = require("../src/utils/chatUnread");

const ts = (ms) => ({ toMillis: () => ms });

test("não conta chats fechados", () => {
    const chats = [
        { id: "a", status: "closed", lastMessage: "oi", lastMessageAt: ts(2000), lastSeenAt: {} },
    ];
    assert.equal(computeUnreadCount(chats, "buyer1"), 0);
});

test("conta chat sem lastSeenAt do usuário como não lido", () => {
    const chats = [
        { id: "a", status: "active", lastMessage: "oi", lastMessageAt: ts(2000), lastSeenAt: {} },
    ];
    assert.equal(computeUnreadCount(chats, "buyer1"), 1);
});

test("não conta chat já lido pelo usuário", () => {
    const chats = [
        { id: "a", status: "active", lastMessage: "oi", lastMessageAt: ts(1000), lastSeenAt: { buyer1: ts(2000) } },
    ];
    assert.equal(computeUnreadCount(chats, "buyer1"), 0);
});

test("conta chat com mensagem mais recente que lastSeenAt", () => {
    const chats = [
        { id: "a", status: "active", lastMessage: "oi", lastMessageAt: ts(3000), lastSeenAt: { buyer1: ts(2000) } },
    ];
    assert.equal(computeUnreadCount(chats, "buyer1"), 1);
});

test("deduplica chat que aparece em buyerChats e sellerChats (proteção contra self-chat)", () => {
    const chat = { id: "dup", status: "active", lastMessage: "oi", lastMessageAt: ts(3000), lastSeenAt: {} };
    assert.equal(computeUnreadCount([chat, chat], "buyer1"), 1);
});

test("não conta chat sem lastMessage", () => {
    const chats = [
        { id: "a", status: "active", lastMessage: "", lastMessageAt: ts(2000), lastSeenAt: {} },
    ];
    assert.equal(computeUnreadCount(chats, "buyer1"), 0);
});

test("não conta chat sem lastMessageAt", () => {
    const chats = [
        { id: "a", status: "active", lastMessage: "oi", lastMessageAt: null, lastSeenAt: {} },
    ];
    assert.equal(computeUnreadCount(chats, "buyer1"), 0);
});

test("conta múltiplos chats não lidos corretamente", () => {
    const chats = [
        { id: "a", status: "active", lastMessage: "oi", lastMessageAt: ts(3000), lastSeenAt: { buyer1: ts(2000) } },
        { id: "b", status: "active", lastMessage: "oi", lastMessageAt: ts(3000), lastSeenAt: {} },
        { id: "c", status: "closed", lastMessage: "oi", lastMessageAt: ts(3000), lastSeenAt: {} },
    ];
    assert.equal(computeUnreadCount(chats, "buyer1"), 2);
});
