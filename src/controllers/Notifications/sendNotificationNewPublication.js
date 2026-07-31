import { getAllUserTokenNotification } from "../User/notification";
import { SendNotifications } from "./sendNotifications";
import { buildPublicationSummary } from "../../utils/publicationSummary";

const getClientTokensExcluding = async (excludeUserId) => {
    const resultDataTokens = await getAllUserTokenNotification();
    if (resultDataTokens.error) return [];
    return resultDataTokens.data
        .filter((item) => item.userType === "client" && item.id !== excludeUserId)
        .map((item) => item.notification.token);
};

export const sendNotificationNewPublication = async ({
    publisherId, publicationId, location, shrimps,
} = {}) => {
    const notificationTokens = await getClientTokensExcluding(publisherId);
    if (notificationTokens.length === 0) return;

    const summary = buildPublicationSummary(shrimps);
    const details = [summary, location].filter(Boolean).join(" • ");
    const body = details
        ? `${details}. Toque para conferir.`
        : "Um novo camarão 🦐 foi publicado, venha conferir!";

    SendNotifications(
        notificationTokens,
        "🎉 Novo camarão publicado!",
        body,
        () => {},
        { type: "publication", publicationId },
    );
};

export const sendNotificationEditPublication = async ({ publisherId, publicationId } = {}) => {
    const notificationTokens = await getClientTokensExcluding(publisherId);
    if (notificationTokens.length === 0) return;

    SendNotifications(
        notificationTokens,
        "🎉 Quero Camarão Informa",
        "Uma publicação foi alterada, venha conferir!",
        () => {},
        { type: "publication", publicationId },
    );
};
