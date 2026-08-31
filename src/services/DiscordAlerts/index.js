const DEDUP_TTL_MS = 60000;
const MAX_FIELD_LENGTH = 1200;
const MAX_CONTENT_LENGTH = 2000;

function truncate(value, maxLength = MAX_FIELD_LENGTH) {
    return String(value).slice(0, maxLength);
}

function serializeExtra(extra) {
    const seen = new WeakSet();

    try {
        const serialized = JSON.stringify(extra, (key, value) => {
            if (value && typeof value === "object") {
                if (seen.has(value)) return "[Circular]";
                seen.add(value);
            }
            return value;
        });

        return truncate(serialized === undefined ? String(extra) : serialized);
    } catch {
        return "[unserializable extra]";
    }
}

function createDiscordAlertReporter(deps = {}) {
    const {
        webhookUrl,
        fetchImpl,
        now = () => Date.now(),
        getRoute = () => ({}),
        getUser = async () => ({}),
    } = deps;
    const send = fetchImpl || global.fetch;
    const sent = new Map();

    return {
        async reportDiscordError({
            source = "app.unknown",
            error,
            feature = "unknown",
            action = "unknown",
            extra = {},
            user,
        } = {}) {
            let dedupKey;
            let currentTime;
            let reservation;

            try {
                const route = getRoute() || {};
                const alertUser = (await getUser(user)) || {};
                const message = error?.message || String(error || "unknown error");
                const routeName = route.routeName || "unknown";
                dedupKey = `${source}:${routeName}:${message}`;
                currentTime = now();

                const lastSent = sent.get(dedupKey);
                if (lastSent !== undefined && lastSent.timestamp + DEDUP_TTL_MS > currentTime) return false;

                const content = truncate([
                    "ERROR ALERT",
                    `time: ${new Date(currentTime).toISOString()}`,
                    `source: ${source}`,
                    `feature: ${feature}`,
                    `action: ${action}`,
                    `route: ${routeName}`,
                    `userId: ${alertUser.userId || "unknown"}`,
                    `userName: ${alertUser.userName || "unknown"}`,
                    `email: ${alertUser.email || "unknown"}`,
                    `phone: ${alertUser.phone || "unknown"}`,
                    `extra: ${serializeExtra(extra)}`,
                    `message: ${message}`,
                    `stack: ${truncate(error?.stack || "no-stack")}`,
                ].join("\n"), MAX_CONTENT_LENGTH);

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

module.exports = { createDiscordAlertReporter };
