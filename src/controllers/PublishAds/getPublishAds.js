/* eslint-disable object-curly-newline */

import {
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

export const getUserPublishAds = async (userId) => {
    try {
        const publishAdsRef = collection(firestore, models.publishAds);
        const queryConfig = query(
            publishAdsRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataPublishAds = [];

        querySnapshot.forEach((document) => {
            dataPublishAds.push({
                ...document.data(),
                createdAt: convertSecondsToDate(
                    document.data().createdAt.seconds,
                ),
            });
        });

        if (dataPublishAds.length > 0) {
            return {
                error: false,
                data: dataPublishAds,
            };
        }

        return {
            error: true,
            data: dataPublishAds,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};

export const getAllPublishAdsInAnalysis = async () => {
    try {
        const publishAdsRef = collection(firestore, models.publishAds);
        const queryConfig = query(
            publishAdsRef,
            where("status", "==", "wating"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataPublishAds = [];

        querySnapshot.forEach((document) => {
            dataPublishAds.push(document.data());
        });

        if (dataPublishAds.length > 0) {
            return {
                error: false,
                data: dataPublishAds,
            };
        }

        return {
            error: true,
            data: dataPublishAds,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};

export const getAllPublishAdsApproved = async () => {
    try {
        const publishAdsRef = collection(firestore, models.publishAds);
        const queryConfig = query(
            publishAdsRef,
            where("status", "==", "approved"),
            orderBy("updatedAt", "asc"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataPublishAds = [];

        querySnapshot.forEach((document) => {
            dataPublishAds.push(document.data());
        });

        if (dataPublishAds.length > 0) {
            return {
                error: false,
                data: dataPublishAds,
            };
        }

        return {
            error: true,
            data: dataPublishAds,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};
