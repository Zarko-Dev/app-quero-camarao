import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

const safe = (id) => String(id).replace(/[@.]/g, "_");

export const submitRating = async ({
    chatId,
    publicationId,
    raterId,
    ratedId,
    stars,
    comment,
}) => {
    try {
        const ratingRef = doc(firestore, models.ratings, `${chatId}_${safe(raterId)}`);
        await setDoc(ratingRef, {
            chatId,
            publicationId,
            raterId,
            ratedId,
            stars,
            comment: comment || "",
            createdAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const getMyRating = async (chatId, raterId) => {
    try {
        const ratingRef = doc(firestore, models.ratings, `${chatId}_${safe(raterId)}`);
        const snap = await getDoc(ratingRef);
        return snap.exists() ? snap.data() : null;
    } catch (error) {
        Sentry.captureException(error);
        return null;
    }
};
