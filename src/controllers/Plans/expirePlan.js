import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const expireUserPlan = async (userId) => {
    try {
        const userDoc = doc(firestore, models.users, userId);

        await setDoc(
            userDoc,
            {
                activePlan: { active: false },
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};
