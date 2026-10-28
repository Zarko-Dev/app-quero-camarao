import {
    collection,
    getDocs,
    query,
    where,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import * as CuponsRepository from "../../repositories/CuponsRepository";

export const SetDefaultCoupon = async (couponCode, heaveDefaultCoupon) => {
    return CuponsRepository.SetDefaultCoupon(couponCode, heaveDefaultCoupon);
};

export const RemoveDefaultCoupon = async (couponCode) => {
    return CuponsRepository.RemoveDefaultCoupon(couponCode);
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