import * as Sentry from "@sentry/react-native";
import { store } from "../store";
import { GetUserStorage } from "../services/Storage/UserStorage";
import { navigationRef } from "../routes";
import {
    configureDiscordAlertReporter,
    reportDiscordError,
    createDiscordAlertContext,
} from "../services/DiscordAlerts/context";
import { DISCORD_ERROR_WEBHOOK_URL } from "../services/DiscordAlerts/config";

const installGlobalErrorHandler = () => {
    try {
        const errorUtils = global?.ErrorUtils;
        if (!errorUtils?.setGlobalHandler) return;

        const previousHandler = errorUtils.getGlobalHandler?.();
        errorUtils.setGlobalHandler((error, isFatal) => {
            try {
                Sentry.captureException(error);
                reportDiscordError({
                    source: "app.global",
                    error,
                    feature: "runtime",
                    action: isFatal ? "fatal" : "non-fatal",
                });
            } catch (reportingError) {
                // eslint-disable-next-line no-empty
            }

            try {
                previousHandler?.(error, isFatal);
            } catch (previousHandlerError) {
                // eslint-disable-next-line no-empty
            }
        });
    } catch (errorUtilsError) {
        // eslint-disable-next-line no-empty
    }
};

export const initializeObservability = () => {
    Sentry.init({
        dsn: process.env.SENTRY_DNS,
        debug: !process.env.STATUS_PROJECT === "production",
        tracesSampleRate: process.env.STATUS_PROJECT === "production" ? 0.5 : 1.0,
        _experiments: {
            profilesSampleRate: 1.0,
        },
    });

    const discordAlertContext = createDiscordAlertContext({
        store,
        getUserStorage: GetUserStorage,
        navigationRef,
    });

    configureDiscordAlertReporter({
        webhookUrl: DISCORD_ERROR_WEBHOOK_URL,
        getRoute: discordAlertContext.getRoute,
        getUser: discordAlertContext.getUser,
        getEmergencyUser: discordAlertContext.getEmergencyUser,
    });

    installGlobalErrorHandler();
};
