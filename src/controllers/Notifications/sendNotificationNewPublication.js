import { getAllUserTokenNotification } from "../User/notification";
import { SendNotifications } from "./sendNotifications";
import { buildNotificationBody } from "../../utils/buildNotificationBody";

const sentPublicationNotifications = new Set();

const getClientTokensExcluding = async (excludeUserId) => {
    const resultDataTokens = await getAllUserTokenNotification();
    if (resultDataTokens.error) return [];
    return resultDataTokens.data
        .filter(
            (item) => item.userType === "client" && item.id !== excludeUserId,
        )
        .map((item) => item.notification.token);
};

export const sendNotificationNewPublication = async ({
    publisherId,
    publicationId,
    location,
    shrimps,
} = {}) => {
    if (publicationId && sentPublicationNotifications.has(publicationId)) {
        return;
    }
    if (publicationId) {
        sentPublicationNotifications.add(publicationId);
    }

    const notificationTokens = await getClientTokensExcluding(publisherId);
    if (notificationTokens.length === 0) return;

    const body = buildNotificationBody({ shrimps, location });

    SendNotifications(
        notificationTokens,
        "🎉 Novo camarão publicado!",
        body,
        () => {},
        { type: "publication", publicationId },
    );
};

export const sendNotificationEditPublication = async ({
    publisherId,
    publicationId,
} = {}) => {
    const notificationTokens = await getClientTokensExcluding(publisherId);
    if (notificationTokens.length === 0) return;

    const body = buildNotificationBody({ shrimps, location });

    SendNotifications(
        notificationTokens,
        "🎉 Quero Camarão Informa",
        body,
        () => {},
        { type: "publication", publicationId },
    );
};
