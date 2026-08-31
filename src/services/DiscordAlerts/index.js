function createDiscordAlertReporter({
    webhookUrl,
    fetchImpl,
    now = () => Date.now(),
    getRoute = () => ({}),
    getUser = async () => ({}),
}) {
    return {
        async reportDiscordError({ source, error, feature, action }) {
            const route = getRoute() || {};
            const user = (await getUser()) || {};
            const message = error instanceof Error ? error.message : String(error);
            const content = [
                "App Discord error alert",
                `Time: ${new Date(now()).toISOString()}`,
                `Source: ${source}`,
                `Feature: ${feature}`,
                `Action: ${action}`,
                `Route: ${route.routeName || "unknown"}`,
                `User: ${user.userName || "unknown"} (${user.userId || "unknown"})`,
                `Email: ${user.email || "unknown"}`,
                `Phone: ${user.phone || "unknown"}`,
                `Error: ${message}`,
            ].join("\n");

            return fetchImpl(webhookUrl, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ content }),
            });
        },
    };
}

module.exports = { createDiscordAlertReporter };
