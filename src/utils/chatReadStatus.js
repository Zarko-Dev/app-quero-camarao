const toMillis = (value) => {
    if (!value) return null;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") return value.toDate().getTime();
    return null;
};

const sanitizeUserId = (userId) => String(userId).replace(/[@.]/g, "_");

const getMessageReadStatus = (message, lastSeenAt, otherUserId) => {
    const seenMs = toMillis(lastSeenAt?.[sanitizeUserId(otherUserId)]);
    const msgMs = toMillis(message?.createdAt);

    if (seenMs === null || msgMs === null) return "sent";

    return msgMs <= seenMs ? "read" : "sent";
};

module.exports = {
    getMessageReadStatus,
};
