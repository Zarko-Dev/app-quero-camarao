import { doc, updateDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updatePondWeeks = async (pondId, weeks) => {
    try {
        const ref = doc(firestore, models.pondTracker, pondId);
        await updateDoc(ref, { weeks });
        return { error: false };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true };
    }
};
