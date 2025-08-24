import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const saveShrimpPrice10g = async (shrimpPrice10g) => {
    try {
        const invitationDoc = doc(
            firestore,
            models.shrimpPrice,
            "6G9ADkqKPjPUHPS8V2Zv",
        );

        await setDoc(
            invitationDoc,
            {
                shrimpPrice10g,
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
