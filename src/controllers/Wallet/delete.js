import { deleteDoc, doc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const deleteWallet = async (walletId) => {
    try {
        const walletRef = doc(firestore, models.wallets, walletId);
        await deleteDoc(walletRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
