import {
    doc,
    getDoc,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getConfigData = async () => {
    try {
        const configRef = doc(firestore, models.config, "APe8eG9cNHqH339JM7Mw");
        const docSnap = await getDoc(configRef);

        if (docSnap.exists()) {
            return {
                error: false,
                data: docSnap.data(),
            };
        }

        return {
            error: true,
            data: null,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};
