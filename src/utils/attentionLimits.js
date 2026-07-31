const COOLDOWN_MS = 30_000;
const WINDOW_MS = 600_000;
const WINDOW_MAX = 5;

const normalize = (timestamps) =>
    (Array.isArray(timestamps) ? timestamps.filter((t) => typeof t === "number") : []);

const canSendAttention = (timestamps, nowMs) => {
    const list = normalize(timestamps);
    if (list.length === 0) return { allowed: true };

    const last = Math.max(...list);
    if (nowMs - last < COOLDOWN_MS) return { allowed: false, reason: "cooldown" };

    const inWindow = list.filter((t) => nowMs - t < WINDOW_MS).length;
    if (inWindow >= WINDOW_MAX) return { allowed: false, reason: "window" };

    return { allowed: true };
};

const appendAttention = (timestamps, nowMs) =>
    [...normalize(timestamps), nowMs]
        .sort((a, b) => a - b)
        .slice(-WINDOW_MAX);

module.exports = { canSendAttention, appendAttention };
