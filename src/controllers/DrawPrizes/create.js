import { doc, setDoc } from "firebase/firestore";
import { v4 } from "uuid";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const saveDrawPrize = async (
    drawPrizeName,
    dataDrawPrize,
    drawerPrizeLiveId,
) => {
    try {
        const drawPrizesDoc = doc(firestore, models.drawPrizesHistory, v4());

        await setDoc(drawPrizesDoc, {
            drawPrizeName,
            usersWinner: dataDrawPrize,
            drawerPrizeLiveId: drawerPrizeLiveId ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
