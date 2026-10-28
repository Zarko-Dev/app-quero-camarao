const DEDUP_TTL_MS = 60000;
const MAX_FIELD_LENGTH = 1000;
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

function buildContent({ source, feature, action, routeName, alertUser, message, extra, stack }) {
    const userLines = [
        `source: ${source}`,
        `feature: ${feature}`,
        `action: ${action}`,
        `route: ${routeName}`,
        `userId: ${alertUser.userId || "unknown"}`,
        `userName: ${alertUser.userName || alertUser.name || "unknown"}`,
        `email: ${alertUser.email || "unknown"}`,
        `phone: ${alertUser.phone || "unknown"}`,
        `message: ${message}`,
        `stack: ${truncate(stack, 250) || "no-stack"}`,
    ];

    let extraLine = "";
    if (extra) {
        const serialized = serializeExtra(extra);
        const entries = Object.entries(extra)
            .filter(([key]) => key !== "circular" && key !== "unserializable");
        if (entries.length > 0) {
            extraLine = `extra: ${entries.map(([key, value]) => `${key}: ${serializeField(value)}`).join(" ")}`;
        }
    }

    const lines = [...userLines, extraLine].filter((line) => line.length > 0);
    return lines.join("\n");
}

function serializeField(value) {
    const str = String(value);
    return str.length > 100 ? str.slice(0, 100) + "..." : str;
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

                reservation = { timestamp: currentTime };
                sent.set(dedupKey, reservation);

                const content = buildContent({
                    source,
                    feature,
                    action,
                    routeName,
                    alertUser,
                    message,
                    extra,
                    stack: truncate(error?.stack || "no-stack"),
                });

                // Use Discord Embed format
                const embed = {
                    title: "ERROR ALERT",
                    color: 16711680, // Red color
                    timestamp: new Date(currentTime).toISOString(),
                    fields: [
                        { name: "Source", value: truncate(source), inline: true },
                        { name: "Feature", value: truncate(feature), inline: true },
                        { name: "Action", value: truncate(action), inline: true },
                        { name: "Route", value: truncate(routeName), inline: true },
                        { name: "User Name", value: truncate(alertUser.userName || alertUser.name || "unknown"), inline: true },
                        { name: "Email", value: truncate(alertUser.email || "unknown"), inline: true },
                        { name: "User ID", value: truncate(alertUser.userId || "unknown"), inline: true },
                        { name: "Phone", value: truncate(alertUser.phone || "unknown"), inline: true },
                        { name: "Extra", value: serializeExtra(extra), inline: false },
                        { name: "Error Message", value: truncate(message), inline: false },
                        { name: "Stack Trace", value: `\`\`\`\n${truncate(error?.stack || "no-stack")}\n\`\`\``, inline: false },
                    ],
                };

                const response = await send(webhookUrl, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ 
                        embeds: [embed],
                        content,
                        allowed_mentions: { parse: [] } 
                    }),
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
