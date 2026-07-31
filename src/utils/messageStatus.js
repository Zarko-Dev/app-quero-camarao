const toMillis = (value) => {
    if (!value) return null;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") return value.toDate().getTime();
    return null;
};

const sanitizeUserId = (userId) => String(userId).replace(/[@.]/g, "_");

const getMessageDeliveryStatus = (message, lastSeenAt, otherUserId) => {
    if (message?.pending) return "pending";

    const safeOther = sanitizeUserId(otherUserId);
    const seenMs = toMillis(lastSeenAt?.[safeOther]);
    const msgMs = toMillis(message?.createdAt);

    if (seenMs !== null && msgMs !== null && msgMs <= seenMs) return "read";
    if (message?.deliveredTo?.[safeOther]) return "delivered";
    return "sent";
};

module.exports = { getMessageDeliveryStatus };
