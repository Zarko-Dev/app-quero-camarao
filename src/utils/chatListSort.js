const isUnread = (chat, safeId) => {
    const lastSeen = chat.lastSeenAt?.[safeId];
    const lastMsg = chat.lastMessageAt;
    if (!lastMsg || !chat.lastMessage) return false;
    if (!lastSeen) return true;
    const seenMs = lastSeen?.toMillis?.() ?? 0;
    const msgMs = lastMsg?.toMillis?.() ?? 0;
    return msgMs > seenMs;
};

const sortChatsUnreadFirst = (chats, safeId) => [...chats].sort((a, b) => {
    const unreadA = isUnread(a, safeId);
    const unreadB = isUnread(b, safeId);
    if (unreadA !== unreadB) return unreadA ? -1 : 1;
    const ta = a.lastMessageAt?.toMillis?.() ?? 0;
    const tb = b.lastMessageAt?.toMillis?.() ?? 0;
    return tb - ta;
});

module.exports = { isUnread, sortChatsUnreadFirst };
