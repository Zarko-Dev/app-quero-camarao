import * as Sentry from "@sentry/react-native";
import {
    deleteDoc,
    increment,
    setDoc,
} from "../services/FirebaseAdapter";

import { models } from "../services/Firebase/models";
import { docRef } from "./base";

export const CreateCupom = async (dataCupom) => {
    try {
        const cuponRef = docRef(models.cupons, dataCupom.cupomCode);

        await setDoc(
            cuponRef,
            {
                ...dataCupom,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        );

        return true;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[CreateCupom]", error?.code, error?.message);
        Sentry.captureException(error);
        return false;
    }
};

export const deleteCupom = async (cuponCode) => {
    try {
        const cuponRef = docRef(models.cupons, cuponCode);

        await deleteDoc(cuponRef);

        return true;
    } catch (error) {
        return false;
    }
};

export const decreaseAmountCupom = async (cuponCode) => {
    try {
        const cuponRef = docRef(models.cupons, cuponCode);

        await setDoc(
            cuponRef,
            {
                durationValue: increment(-1),
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const incrementAmountCupom = async (cuponCode) => {
    try {
        const cuponRef = docRef(models.cupons, cuponCode);

        await setDoc(
            cuponRef,
            {
                useCount: increment(1),
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const SetDefaultCoupon = async (couponCode, heaveDefaultCoupon) => {
    try {
        if (heaveDefaultCoupon) {
            const couponRef = docRef(models.cupons, heaveDefaultCoupon);

            await setDoc(
                couponRef,
                {
                    isDefault: false,
                    updatedAt: new Date(),
                },
                { merge: true },
            );
        }

        const couponRef = docRef(models.cupons, couponCode);

        await setDoc(
            couponRef,
            {
                isDefault: true,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const RemoveDefaultCoupon = async (couponCode) => {
    try {
        const couponRef = docRef(models.cupons, couponCode);

        await setDoc(
            couponRef,
            {
                isDefault: false,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};
