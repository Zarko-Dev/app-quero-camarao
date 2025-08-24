import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updateWallet = async (walletId, dataWallet) => {
    try {
        const walletDoc = doc(firestore, models.wallets, walletId);

        await setDoc(
            walletDoc,
            {
                ...dataWallet,
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const decreaseWallet = async (walletId, currentValue, decreaseValue) => {
    try {
        const walletDoc = doc(firestore, models.wallets, walletId);

        await setDoc(
            walletDoc,
            {
                currentValue: currentValue - decreaseValue,
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
