let passed = 0, failed = 0;
function assert(cond, label) {
    if (cond) { console.log(`  ✅ ${label}`); passed++; }
    else { console.error(`  ❌ FAIL: ${label}`); failed++; }
}

const chatDocId = (publicationId, buyerId) =>
    `${publicationId}_${String(buyerId).replace(/[@.]/g, "_")}`;

console.log("\nchatDocId:");
assert(chatDocId("pub1", "user@email.com") === "pub1_user_email_com", "replaces @ and .");
assert(chatDocId("pub1", "simple") === "pub1_simple", "no special chars unchanged");
assert(chatDocId("abc", "a@b.c.d") === "abc_a_b_c_d", "multiple special chars");

// isUnread logic (pure function)
const isUnread = (chat, safeId) => {
    const lastSeen = chat.lastSeenAt?.[safeId];
    const lastMsg = chat.lastMessageAt;
    if (!lastMsg || !chat.lastMessage) return false;
    if (!lastSeen) return true;
    const seenMs = lastSeen?.toMillis?.() ?? lastSeen ?? 0;
    const msgMs = lastMsg?.toMillis?.() ?? lastMsg ?? 0;
    return msgMs > seenMs;
};

console.log("\nisUnread:");
assert(isUnread({ lastMessage: "hi", lastMessageAt: { toMillis: () => 1000 }, lastSeenAt: {} }, "user_x") === true, "no lastSeen → unread");
assert(isUnread({ lastMessage: "hi", lastMessageAt: { toMillis: () => 1000 }, lastSeenAt: { user_x: { toMillis: () => 500 } } }, "user_x") === true, "msg after seen → unread");
assert(isUnread({ lastMessage: "hi", lastMessageAt: { toMillis: () => 500 }, lastSeenAt: { user_x: { toMillis: () => 1000 } } }, "user_x") === false, "seen after msg → read");
assert(isUnread({ lastMessageAt: { toMillis: () => 1000 }, lastSeenAt: {} }, "user_x") === false, "no lastMessage → read");
assert(isUnread({}, "user_x") === false, "empty chat → read");

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
