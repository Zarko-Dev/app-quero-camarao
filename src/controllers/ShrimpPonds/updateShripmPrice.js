import {
    doc,
    setDoc,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updateShripmPrice = async (dataShrimp) => {
    try {
        const invitationDoc = doc(
            firestore,
            models.shrimpPrice,
            "6G9ADkqKPjPUHPS8V2Zv",
        );

        await setDoc(invitationDoc, dataShrimp, {
            merge: true,
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
