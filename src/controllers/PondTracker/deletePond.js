import { deleteDoc, doc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const deletePond = async (pondId) => {
    try {
        const ref = doc(firestore, models.pondTracker, pondId);
        await deleteDoc(ref);
        return { error: false };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true };
    }
};
