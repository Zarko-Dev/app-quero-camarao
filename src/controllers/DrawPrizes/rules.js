/* eslint-disable object-curly-newline */
import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const saveDrawPrizeRules = async (dataRules) => {
    try {
        const drawPrizesDoc = doc(
            firestore,
            models.drawPrizesRules,
            "lR0dLwDArzxmD4Fp9wMK",
        );

        await setDoc(
            drawPrizesDoc,
            {
                rules: dataRules,
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const getDrawPrizeRules = async () => {
    try {
        const drawPrizeRef = collection(firestore, models.drawPrizesRules);
        const drawPrizeQuery = query(drawPrizeRef);

        const querySnapshot = await getDocs(drawPrizeQuery);

        const datDrawPrizes = [];

        querySnapshot.forEach((document) => {
            datDrawPrizes.push({
                id: document.id,
                ...document.data(),
            });
        });

        return datDrawPrizes;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};

export const saveSpecifcDrawPrizeRules = async (dataSpecifcRules) => {
    try {
        const drawPrizesDoc = doc(
            firestore,
            models.drawPrizesRules,
            "lR0dLwDArzxmD4Fp9wMK",
        );

        await setDoc(
            drawPrizesDoc,
            {
                specifcRules: dataSpecifcRules,
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
