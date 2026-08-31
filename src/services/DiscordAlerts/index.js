const DEDUP_TTL_MS = 60000;
const MAX_FIELD_LENGTH = 1200;

function truncate(value) {
    return String(value).slice(0, MAX_FIELD_LENGTH);
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
        async reportDiscordError({ source = "app.unknown", error, feature = "unknown", action = "unknown", extra = {} } = {}) {
            try {
                const route = getRoute() || {};
                const user = (await getUser()) || {};
                const message = error?.message || String(error || "unknown error");
                const routeName = route.routeName || "unknown";
                const dedupKey = `${source}:${routeName}:${message}`;
                const currentTime = now();

                const lastSent = sent.get(dedupKey);
                if (lastSent !== undefined && lastSent + DEDUP_TTL_MS > currentTime) return false;

                const content = [
                    "ERROR ALERT",
                    `time: ${new Date(currentTime).toISOString()}`,
                    `source: ${source}`,
                    `feature: ${feature}`,
                    `action: ${action}`,
                    `route: ${routeName}`,
                    `userId: ${user.userId || "unknown"}`,
                    `userName: ${user.userName || "unknown"}`,
                    `email: ${user.email || "unknown"}`,
                    `phone: ${user.phone || "unknown"}`,
                    `extra: ${serializeExtra(extra)}`,
                    `message: ${message}`,
                    `stack: ${truncate(error?.stack || "no-stack")}`,
                ].join("\n");

                await send(webhookUrl, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ content }),
                });
                sent.set(dedupKey, currentTime);
                return true;
            } catch {
                return false;
            }
        },
    };
}

module.exports = { createDiscordAlertReporter };
