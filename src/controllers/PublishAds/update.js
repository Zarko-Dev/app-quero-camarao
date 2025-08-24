import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updateStatusPublishAds = async (
    adsId,
    status,
    alertText = null,
) => {
    try {
        const publishAdsDoc = doc(firestore, models.publishAds, adsId);

        await setDoc(
            publishAdsDoc,
            {
                status,
                alert: alertText,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
