import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const decreaseAmountCupom = async (cuponCode, durationValue) => {
    try {
        const cupomDoc = doc(firestore, models.cupons, cuponCode);

        await setDoc(
            cupomDoc,
            {
                durationValue: `${Number(durationValue) - 1}`,
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
