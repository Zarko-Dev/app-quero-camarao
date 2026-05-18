/* eslint-disable object-curly-newline */
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getShrimpPriceRealTime = async (actionCallback) => {
    try {
        const ShrimpRef = collection(firestore, models.shrimpPrice);
        const shrimpQuery = query(ShrimpRef);
        const querySnapshot = await getDocs(shrimpQuery);
        const dataShrimp = [];

        querySnapshot.forEach((document) => {
            dataShrimp.push(document.data());
        });

        actionCallback(dataShrimp);
    } catch (error) {
        Sentry.captureException(error);

        actionCallback([]);
    }
};

export const getShrimpPrice = async () => {
    try {
        const usersRef = doc(
            firestore,
            models.shrimpPrice,
            "6G9ADkqKPjPUHPS8V2Zv",
        );
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }

        return false;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
