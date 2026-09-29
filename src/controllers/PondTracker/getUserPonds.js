import { collection, getDocs, query, where } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getUserPonds = async (userId) => {
    try {
        const ref = collection(firestore, models.pondTracker);
        const q = query(ref, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const ponds = [];
        snapshot.forEach((document) => {
            ponds.push({ id: document.id, ...document.data() });
        });
        ponds.sort((a, b) => {
            const aSeconds = a.createdAt?.seconds ?? 0;
            const bSeconds = b.createdAt?.seconds ?? 0;
            return aSeconds - bSeconds;
        });
        return { error: false, data: ponds };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true, data: [] };
    }
};
