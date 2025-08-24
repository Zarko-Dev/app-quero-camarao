import { doc, setDoc } from "firebase/firestore";
import { v4 } from "uuid";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const saveNotification = async (tokens, notification) => {
    try {
        const notificationDoc = doc(firestore, models.notifications, v4());

        await setDoc(notificationDoc, {
            tokens: tokens.map((token) => ({ token, read: false })),
            notification,
            createdAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
