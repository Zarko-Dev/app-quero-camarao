const { createDiscordAlertReporter } = require(".");
const { DISCORD_ERROR_WEBHOOK_URL } = require("./config");

let configuredReporter = createDiscordAlertReporter({
    webhookUrl: DISCORD_ERROR_WEBHOOK_URL,
});

function valueOrUnknown(value) {
    return value === undefined || value === null || value === "" ? "unknown" : value;
}

function normalizeUser(user = {}) {
    return {
        userId: valueOrUnknown(user.userId || user.id || user.uid || user._id),
        userName: valueOrUnknown(user.userName || user.name || user.fullName || user.username),
        email: valueOrUnknown(user.email),
        phone: valueOrUnknown(user.phone || user.phoneNumber || user.telephone),
    };
}

function createDiscordAlertContext({ store, getUserStorage, navigationRef } = {}) {
    return {
        async getUser(explicitUser = null) {
            if (explicitUser) return normalizeUser(explicitUser);

            let loginUser;
            try {
                const state = store?.getState?.();
                loginUser = state?.login?.dataUser || state?.login?.user || state?.login?.profile;
            } catch (error) {
                loginUser = null;
            }
            if (loginUser) return normalizeUser(loginUser);

            try {
                const storedUser = await getUserStorage?.();
                return normalizeUser(storedUser || {});
            } catch (error) {
                return normalizeUser({});
            }
        },

        getRoute() {
            try {
                return { routeName: navigationRef?.getCurrentRoute?.()?.name || "unknown" };
            } catch (error) {
                return { routeName: "unknown" };
            }
        },
    };
}

function configureDiscordAlertReporter(deps = {}) {
    configuredReporter = createDiscordAlertReporter(deps);
    return configuredReporter;
}

function reportDiscordError(payload) {
    return configuredReporter?.reportDiscordError(payload) || Promise.resolve(false);
}

module.exports = {
    configureDiscordAlertReporter,
    createDiscordAlertContext,
    normalizeUser,
    reportDiscordError,
};
