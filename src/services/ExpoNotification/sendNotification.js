import * as Sentry from "@sentry/react-native";

export const sendNotification = async (token, title, body, data = {}) => {
    try {
        const resultNotification = await (
            await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: token,
                    title,
                    sound: "default",
                    body,
                    channelId: "notifications-app",
                    data,
                }),
            })
        ).json();

        console.log(resultNotification);

        return resultNotification;
    } catch (error) {
        Sentry.captureException(error);

        return null;
    }
};
