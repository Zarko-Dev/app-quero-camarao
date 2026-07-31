import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { sendNotificationNewPublication } from "../Notifications/sendNotificationNewPublication";

export const saveShrimpPonds = async (dataPonds, userId) => {
    try {
        const shrimpPondsDoc = doc(firestore, models.shrimpPonds, dataPonds.id);

        const currentDate = new Date();
        const expirationDate = new Date(currentDate);

        expirationDate.setDate(currentDate.getDate() + 15);

        await setDoc(shrimpPondsDoc, {
            ...dataPonds,
            userId,
            views: 0,
            expirationDate,
            createdAt: currentDate,
            updatedAt: currentDate,
        });

        await sendNotificationNewPublication({
            publisherId: userId,
            location: dataPonds.location,
            shrimps: dataPonds.shrimps,
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
