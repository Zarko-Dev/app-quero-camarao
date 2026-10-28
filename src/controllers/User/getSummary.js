import {
    doc,
    getDoc,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getUsersSummary = async () => {
    try {
        const summaryRef = doc(firestore, models.stats, "usersSummary");
        const snap = await getDoc(summaryRef);

        if (!snap.exists()) {
            return { total: 0, byUserType: {}, byState: [] };
        }

        return snap.data();
    } catch (error) {
        Sentry.captureException(error);
        return { total: 0, byUserType: {}, byState: [] };
    }
};
