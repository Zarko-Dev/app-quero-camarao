import {
    doc,
    getDoc,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getPublicationViewsMonths = async () => {
    try {
        const ref = doc(firestore, models.stats, "publicationViewsMonths");
        const snap = await getDoc(ref);

        if (!snap.exists()) return [];

        return snap.data()?.months ?? [];
    } catch (error) {
        Sentry.captureException(error);
        return [];
    }
};

const EMPTY_ROLLUP = { daily: {}, hourly: {}, byPublication: {}, totalViews: 0 };

export const getPublicationViewsRollup = async (monthKey) => {
    if (!monthKey) return EMPTY_ROLLUP;

    try {
        const ref = doc(firestore, "publicationViewsRollup", monthKey);
        const snap = await getDoc(ref);

        if (!snap.exists()) return EMPTY_ROLLUP;

        return { ...EMPTY_ROLLUP, ...snap.data() };
    } catch (error) {
        Sentry.captureException(error);
        return EMPTY_ROLLUP;
    }
};
