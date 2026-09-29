import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const createPond = async (userId, name) => {
    try {
        const ref = collection(firestore, models.pondTracker);
        const docRef = await addDoc(ref, {
            userId,
            name,
            weeks: [],
            createdAt: serverTimestamp(),
        });
        return { error: false, id: docRef.id };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true };
    }
};
