import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const SetDefaultCoupon = async (couponCode, heaveDefaultCoupon) => {
    try {
        if (heaveDefaultCoupon) {
            const couponDoc = doc(firestore, models.cupons, heaveDefaultCoupon);

            await setDoc(
                couponDoc,
                {
                    isDefault: false,
                    updatedAt: new Date(),
                },
                { merge: true },
            );
        }

        const couponDoc = doc(firestore, models.cupons, couponCode);

        await setDoc(
            couponDoc,
            {
                isDefault: true,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const RemoveDefaultCoupon = async (couponCode) => {
    try {
        const couponDoc = doc(firestore, models.cupons, couponCode);

        await setDoc(
            couponDoc,
            {
                isDefault: false,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const getDefaultCouponCode = async () => {
    try {
        const couponRef = collection(firestore, models.cupons);
        const queryConfig = query(couponRef, where("isDefault", "==", true));

        const querySnapshot = await getDocs(queryConfig);
        const dataDefaultCoupon = [];

        querySnapshot.forEach((data) => {
            dataDefaultCoupon.push({ ...data.data(), id: data.id });
        });

        if (dataDefaultCoupon.length > 0) {
            return {
                error: false,
                data: dataDefaultCoupon[0],
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
