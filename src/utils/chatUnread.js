const computeUnreadCount = (chats, safeId) => {
    const seen = new Set();
    let count = 0;
    for (const chat of chats) {
        if (chat.id !== undefined) {
            if (seen.has(chat.id)) continue;
            seen.add(chat.id);
        }
        if (chat.status === "closed") continue;
        const lastSeen = chat.lastSeenAt?.[safeId];
        const lastMsg = chat.lastMessageAt;
        if (!lastMsg || !chat.lastMessage) continue;
        if (!lastSeen) { count++; continue; }
        const seenMs = typeof lastSeen.toMillis === "function" ? lastSeen.toMillis() : 0;
        const msgMs = typeof lastMsg.toMillis === "function" ? lastMsg.toMillis() : 0;
        if (msgMs > seenMs) count++;
    }
    return count;
};

module.exports = { computeUnreadCount };
