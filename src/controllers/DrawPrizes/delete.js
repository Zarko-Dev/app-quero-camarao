import { doc, deleteDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const deleteDrawPrize = async (drawPrizeId) => {
    try {
        const drawPrizesDoc = doc(
            firestore,
            models.drawPrizesHistory,
            drawPrizeId,
        );

        await deleteDoc(drawPrizesDoc);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
