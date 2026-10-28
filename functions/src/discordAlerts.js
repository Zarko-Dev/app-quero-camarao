const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1544002773325054074/rjMwz_gQDtLG_8a5LhreTXqQFjqtv0BuPJqK9p34SUJ4w-LTx3T79grgSbEnAvTwcbE0";
const DEDUP_TTL_MS = 60000;
const MAX_CONTENT_LENGTH = 2000;

function truncate(value, maxLength) {
    return String(value).slice(0, maxLength);
}

function maskEmail(email) {
    if (!email || typeof email !== "string") return "***";
    const atIdx = email.indexOf("@");
    if (atIdx <= 0) return "***";
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx + 1);
    const dotIdx = domain.indexOf(".");
    if (dotIdx <= 0) return `${local[0]}***@***`;
    return `${local[0]}***@${domain[0]}***${domain.slice(dotIdx)}`;
}

function maskPhone(phone) {
    if (!phone || typeof phone !== "string") return "***";
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 4) return "***";
    return `***${digits.slice(-4)}`;
}

function maskUserId(userId) {
    if (!userId || typeof userId !== "string") return "***";
    if (userId.length <= 4) return "***";
    return `${userId.slice(0, 4)}****`;
}

function serializeExtra(extra) {
    const seen = new WeakSet();

    try {
        const serialized = JSON.stringify(extra, (_key, value) => {
            if (value && typeof value === "object") {
                if (seen.has(value)) return "[Circular]";
                seen.add(value);
            }
            return value;
        });
        return serialized === undefined ? String(extra) : serialized;
    } catch {
        return "[unserializable extra]";
    }
}

function createDiscordFunctionAlertReporter(deps = {}) {
    const {
        webhookUrl = DISCORD_WEBHOOK_URL,
        fetchImpl,
        now = () => Date.now(),
    } = deps;
    const sent = new Map();

    return {
        async reportDiscordFunctionError({
            functionsEnv = "unknown",
            functionName = "unknown",
            userId = "unknown",
            email = "unknown",
            phone = "unknown",
            requestPath = "unknown",
            eventId = "unknown",
            documentPath = "unknown",
            error,
            extra = {},
        } = {}) {
            let dedupKey;
            let reservation;

            try {
                const send = fetchImpl || global.fetch;
                if (typeof send !== "function" || !webhookUrl) return false;

                const currentTime = now();
                const message = error?.message || String(error || "unknown error");
                dedupKey = `${functionName}:${message}:${eventId}`;
                const lastSent = sent.get(dedupKey);
                if (lastSent && lastSent.timestamp + DEDUP_TTL_MS > currentTime) return false;

                const content = [
                    "FUNCTION ERROR",
                    `time: ${new Date(currentTime).toISOString()}`,
                    `env: ${truncate(functionsEnv, 120)}`,
                    `function: ${truncate(functionName, 120)}`,
                    `userId: ${truncate(maskUserId(userId), 120)}`,
                    `email: ${truncate(maskEmail(email), 120)}`,
                    `phone: ${truncate(maskPhone(phone), 120)}`,
                    `requestPath: ${truncate(requestPath, 120)}`,
                    `eventId: ${truncate(eventId, 120)}`,
                    `documentPath: ${truncate(documentPath, 120)}`,
                    `message: ${truncate(message, 350)}`,
                    `stack: ${truncate(error?.stack || "no-stack", 250)}`,
                    `extra: ${truncate(serializeExtra(extra), 120)}`,
                ].join("\n").slice(0, MAX_CONTENT_LENGTH);

                reservation = { timestamp: currentTime };
                sent.set(dedupKey, reservation);
                const response = await send(webhookUrl, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
                });
                if (!response || response.ok !== true) {
                    if (sent.get(dedupKey) === reservation) sent.delete(dedupKey);
                    return false;
                }

                return true;
            } catch {
                if (dedupKey && sent.get(dedupKey) === reservation) sent.delete(dedupKey);
                return false;
            }
        },
    };
}

module.exports = { createDiscordFunctionAlertReporter };
