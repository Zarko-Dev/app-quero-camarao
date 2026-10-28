import { Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import * as Sentry from "@sentry/react-native";
import { navigationRef } from "../routes";
import { dataRoutes } from "../routes/dataRoutes";
import { getActiveChatId } from "../utils/activeChatTracker";
import { navigateWhenReady } from "./navigateWhenReady";

let handledNotificationId = null;

const goToChat = (data) => {
    const routeMap = {
        chat: {
            name: dataRoutes.publicationChat,
            params: {
                publication: { id: data.publicationId },
                sellerId: data.sellerId,
                buyerId: data.buyerId,
                sellerName: data.sellerName,
                buyerName: data.buyerName,
                chatId: data.chatId,
            },
        },
        publication: {
            name: data.publicationId
                ? dataRoutes.publicationDetail
                : dataRoutes.home,
            params: data.publicationId
                ? { publicationId: data.publicationId }
                : undefined,
        },
        registerMyAds: { name: dataRoutes.registerMyAds, params: undefined },
    };
    return routeMap[data.type];
};

const navigateToChatFromNotificationData = async (data, notificationId) => {
    const isChatType = data?.type === "chat" || data?.type === "attention";
    const isKnownType = isChatType || data?.type === "publication" || data?.type === "registerMyAds";
    if (!data || !isKnownType) return;
    if (isChatType && !data.publicationId) return;
    if (notificationId && notificationId === handledNotificationId) return;
    if (notificationId) handledNotificationId = notificationId;

    const { name, params } = goToChat(data);
    if (!name) return;

    try {
        await navigateWhenReady(navigationRef, name, params, { timeoutMs: 3000 });
    } catch {
        Sentry.captureMessage("Notification navigation timed out waiting for navigationRef", {
            extra: {
                type: data.type,
                chatId: data.chatId,
                publicationId: data.publicationId,
            },
        });
    }
};

export const installNotificationHandlers = () => {
    Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
            const chatId = notification.request?.content?.data?.chatId;
            const isActiveChat = Boolean(chatId) && chatId === getActiveChatId();

            return {
                shouldShowBanner: !isActiveChat,
                shouldShowList: !isActiveChat,
                shouldPlaySound: !isActiveChat,
                shouldSetBadge: !isActiveChat,
            };
        },
    });

    Notifications.getLastNotificationResponseAsync().then(async (response) => {
        await navigateToChatFromNotificationData(
            response?.notification?.request?.content?.data,
            response?.notification?.request?.identifier,
        );
        Notifications.clearLastNotificationResponseAsync();
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        navigateToChatFromNotificationData(
            response?.notification?.request?.content?.data,
            response?.notification?.request?.identifier,
        ).catch(() => {});
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
            if (notification.request?.content?.data?.type === "attention") {
                Vibration.vibrate([0, 250, 100, 250]);
            }
        },
    );

    return () => {
        subscription.remove();
        receivedSubscription.remove();
    };
};
