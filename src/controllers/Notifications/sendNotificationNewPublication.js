import { getAllUserTokenNotification } from "../User/notification";
import { SendNotifications } from "./sendNotifications";

export const sendNotificationNewPublication = async () => {
    const resultDataTokens = await getAllUserTokenNotification();

    if (!resultDataTokens.error) {
        const notificationTokens = resultDataTokens.data.map(
            (item) => item.notification.token,
        );

        SendNotifications(
            notificationTokens,
            "🎉 Quero Camarão Informa",
            "Um novo camarão 🦐 foi publicado, venha conferir!",
        );
    }
};

export const sendNotificationEditPublication = async () => {
    const resultDataTokens = await getAllUserTokenNotification();

    if (!resultDataTokens.error) {
        const notificationTokens = resultDataTokens.data.map(
            (item) => item.notification.token,
        );

        SendNotifications(
            notificationTokens,
            "🎉 Quero Camarão Informa",
            "Uma publicação foi alterada, venha conferir!",
        );
    }
};
