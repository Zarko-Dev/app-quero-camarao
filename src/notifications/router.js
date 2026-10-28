import { validateNotificationPayload } from "../contracts/notificationPayload.js";
import { dataRoutes } from "../routes/dataRoutes";

export function routeNotification(data, navigationRef) {
    const validation = validateNotificationPayload(data);
    if (!validation.valid) {
        return;
    }

    if (!navigationRef.isReady()) {
        return;
    }

    const { type } = data;

    if (type === "chat" || type === "attention") {
        navigationRef.navigate(dataRoutes.publicationChat, {
            publication: { id: data.publicationId },
            sellerId: data.sellerId,
            buyerId: data.buyerId,
            sellerName: data.sellerName,
            buyerName: data.buyerName,
            chatId: data.chatId,
        });
    } else if (type === "publication") {
        if (data.publicationId) {
            navigationRef.navigate(dataRoutes.publicationDetail, {
                publicationId: data.publicationId,
            });
        } else {
            navigationRef.navigate(dataRoutes.home);
        }
    } else if (type === "registerMyAds") {
        navigationRef.navigate(dataRoutes.registerMyAds);
    }
}

export function createNavigationWaiter(navigationRef) {
    return new Promise((resolve) => {
        if (navigationRef.isReady()) {
            resolve();
            return;
        }

        const unsubscribe = navigationRef.addListener("state", () => {
            if (navigationRef.isReady()) {
                unsubscribe();
                resolve();
            }
        });
    });
}
