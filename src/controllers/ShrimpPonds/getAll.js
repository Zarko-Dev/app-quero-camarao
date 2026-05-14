/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
import {
    collection,
    getDocs,
    orderBy,
    query,
    startAfter,
    limit,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getAllShrimpPondsRealTime = async (actionCallback) => {
    try {
        const ShrimpPondsRef = collection(firestore, models.shrimpPonds);
        const shrimpPondsQuery = query(
            ShrimpPondsRef,
            orderBy("createdAt", "desc"),
            orderBy("views", "asc"),
            where("expirationDate", ">=", new Date()),
            limit(10),
        );

        const querySnapshot = await getDocs(shrimpPondsQuery);
        const dataShrimpPonds = [];

        querySnapshot.forEach((document) => {
            dataShrimpPonds.push({
                ...document.data(),
                id: document.id,
            });
        });

        const dataShrimpPondsFilterNotSale = dataShrimpPonds.filter(
            (item) => item.shrimps.some((shrimp) => !shrimp?.sale),
        );

        actionCallback(dataShrimpPondsFilterNotSale);
    } catch (error) {
        Sentry.captureException(error);

        actionCallback([]);
    }
};

export const getLatestShrimpPonds = async (lastVisible = null) => {
    try {
        const ShrimpPondsRef = collection(firestore, models.shrimpPonds);
        let shrimpPondsQuery;

        if (lastVisible && lastVisible.createdAt) {
            shrimpPondsQuery = query(
                ShrimpPondsRef,
                orderBy("createdAt", "desc"),
                startAfter(lastVisible.createdAt),
                limit(15),
            );
        } else {
            shrimpPondsQuery = query(
                ShrimpPondsRef,
                orderBy("createdAt", "desc"),
                limit(15),
            );
        }

        const querySnapshot = await getDocs(shrimpPondsQuery);
        const dataShrimpPonds = [];

        querySnapshot.forEach((document) => {
            dataShrimpPonds.push({
                ...document.data(),
                id: document.id,
            });
        });

        return dataShrimpPonds;
    } catch (error) {
        Sentry.captureException(error);
        return [];
    }
};

export const getMoreShrimpPonds = async (lastVisible) => {
    try {
        const ShrimpPondsRef = collection(firestore, models.shrimpPonds);
        const shrimpPondsQuery = query(
            ShrimpPondsRef,
            orderBy("createdAt", "desc"),
            orderBy("views", "asc"),
            where("expirationDate", ">=", new Date()),
            startAfter(lastVisible.createdAt, lastVisible.views ?? 0),
            limit(10),
        );

        const querySnapshot = await getDocs(shrimpPondsQuery);

        const dataShrimpPonds = [];

        querySnapshot.forEach((document) => {
            dataShrimpPonds.push({
                ...document.data(),
                id: document.id,
            });
        });

        return dataShrimpPonds;
    } catch (error) {
        Sentry.captureException(error);
        console.error("Erro na paginacao de viveiros:", error);

        return [];
    }
};
