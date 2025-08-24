import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const createUserWallet = async (userId, dataWallet) => {
    try {
        const walletDoc = doc(firestore, models.wallets, userId);

        await setDoc(walletDoc, {
            ...dataWallet,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
