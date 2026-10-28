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

export const getUserPublications = async (userId) => {
    try {
        const shrimpPondsRef = collection(firestore, models.shrimpPonds);
        const queryConfig = query(
            shrimpPondsRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const datashrimpPonds = [];

        querySnapshot.forEach((document) => {
            datashrimpPonds.push({
                ...document.data(),
                createdAt: convertSecondsToDate(
                    document.data().createdAt.seconds,
                ),
            });
        });

        if (datashrimpPonds.length > 0) {
            return {
                error: false,
                data: datashrimpPonds,
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

export const getAnalisysPublications = async () => {
    try {
        const shrimpPondsRef = collection(firestore, models.shrimpPonds);
        const queryConfig = query(
            shrimpPondsRef,
            where("requestExtensionDate", "==", "analysis"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const datashrimpPonds = [];

        querySnapshot.forEach((document) => {
            datashrimpPonds.push({
                ...document.data(),
                createdAt: convertSecondsToDate(
                    document.data().createdAt.seconds,
                ),
            });
        });

        if (datashrimpPonds.length > 0) {
            return {
                error: false,
                data: datashrimpPonds,
            };
        }

        return {
            error: false,
            data: datashrimpPonds,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};
