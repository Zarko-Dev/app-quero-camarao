import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const saveUserPlan = async (userId, orderId) => {
    try {
        const userDoc = doc(firestore, models.users, userId);
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        await setDoc(
            userDoc,
            {
                activePlan: {
                    active: true,
                    planId: "monthly",
                    startDate,
                    endDate,
                    orderId,
                },
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return { error: false, endDate };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true };
    }
};
