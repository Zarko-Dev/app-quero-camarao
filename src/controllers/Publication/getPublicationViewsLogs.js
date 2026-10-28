import {
    doc,
    getDoc,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getPublicationViewLogs = async (viewsId) => {
    if (viewsId) {
        try {
            const viewLogsRef = doc(
                firestore,
                models.logPublicationsViews,
                viewsId,
            );
            const docSnap = await getDoc(viewLogsRef);

            if (docSnap.exists()) {
                return docSnap.data();
            }

            return { views: [] };
        } catch (error) {
            Sentry.captureException(error);

            return { views: [] };
        }
    }

    return { views: [] };
};

export const getPublicationViewLogsById = async (viewsId) => {
    try {
        const viewLogsRef = doc(
            firestore,
            models.logPublicationsViews,
            viewsId,
        );
        const docSnap = await getDoc(viewLogsRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }

        return [];
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
