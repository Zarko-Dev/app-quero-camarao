/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
import {
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    startAfter,
    limit,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getAllShrimpPondsRealTime = (actionCallback) => {
    try {
        const ShrimpPondsRef = collection(firestore, models.shrimpPonds);
        const shrimpPondsQuery = query(
            ShrimpPondsRef,
            orderBy("createdAt", "desc"),
            orderBy("views", "asc"),
            where("expirationDate", ">=", new Date()),
            limit(6),
        );

        onSnapshot(shrimpPondsQuery, (querySnapshot) => {
            const dataShrimpPonds = [];

            querySnapshot.forEach((document) => {
                dataShrimpPonds.push(document.data());
            });

            const dataShrimpPondsFilterNotSale = dataShrimpPonds.filter(
                (item) => item.shrimps.some((shrimp) => !shrimp?.sale),
            );

            actionCallback(dataShrimpPondsFilterNotSale);
        });
    } catch (error) {
        Sentry.captureException(error);

        actionCallback([]);
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
            startAfter(lastVisible.createdAt),
            limit(6),
        );

        const querySnapshot = await getDocs(shrimpPondsQuery);

        const dataShrimpPonds = [];

        querySnapshot.forEach((document) => {
            dataShrimpPonds.push(document.data());
        });

        return dataShrimpPonds;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
