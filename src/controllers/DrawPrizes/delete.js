import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { buildSoftDeleteDrawPrizeUpdate } from "./helpers";

const softDeleteDrawPrizeById = async (drawPrizeId, now = new Date()) => {
    try {
        const drawPrizesDoc = doc(
            firestore,
            models.drawPrizesHistory,
            drawPrizeId,
        );

        await setDoc(
            drawPrizesDoc,
            buildSoftDeleteDrawPrizeUpdate(now),
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const deleteDrawPrize = async (drawPrizeId) => {
    return softDeleteDrawPrizeById(drawPrizeId);
};

export const deleteDrawPrizes = async (drawPrizeIds = []) => {
    const uniqueIds = [...new Set(drawPrizeIds)].filter(Boolean);

    if (uniqueIds.length === 0) return true;

    const results = await Promise.all(
        uniqueIds.map((drawPrizeId) => softDeleteDrawPrizeById(drawPrizeId)),
    );

    return results.every(Boolean);
};
