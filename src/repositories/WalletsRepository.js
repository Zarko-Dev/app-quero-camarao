import {
    deleteDoc,
    doc,
    setDoc,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { docRef } from "./base";

export const createUserWallet = async (userId, dataWallet) => {
    try {
        const walletRef = docRef(models.wallets, userId);

        await setDoc(
            walletRef,
            {
                ...dataWallet,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const deleteWallet = async (walletId) => {
    try {
        const walletRef = docRef(models.wallets, walletId);

        await deleteDoc(walletRef);

        return true;
    } catch (error) {
        return false;
    }
};

export const updateWallet = async (walletId, dataWallet) => {
    try {
        const walletRef = docRef(models.wallets, walletId);

        await setDoc(
            walletRef,
            {
                ...dataWallet,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const decreaseWallet = async (walletId, currentValue, decreaseValue) => {
    try {
        const walletRef = docRef(models.wallets, walletId);

        await setDoc(
            walletRef,
            {
                currentValue: currentValue - decreaseValue,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};
