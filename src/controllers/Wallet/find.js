import { doc, getDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const VerifyIfUserWalletExists = async (userId) => {
    try {
        const walletRef = doc(firestore, models.wallets, userId);
        const docSnap = await getDoc(walletRef);

        if (docSnap.exists()) {
            return {
                error: false,
                data: docSnap.data(),
            };
        }

        return {
            error: true,
            data: null,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};

export const getWalletByUserId = async (userId) => {
    try {
        const walletRef = doc(firestore, models.wallets, userId);
        const docSnap = await getDoc(walletRef);

        if (docSnap.exists()) {
            return {
                error: false,
                data: docSnap.data(),
            };
        }

        return {
            error: true,
            data: null,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};
