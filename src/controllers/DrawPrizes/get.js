/* eslint-disable object-curly-newline */
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

export const getAllDrawPrizes = async () => {
    try {
        const drawPrizeRef = collection(firestore, models.drawPrizesHistory);
        const drawPrizeQuery = query(
            drawPrizeRef,
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(drawPrizeQuery);

        const datDrawPrizes = [];

     querySnapshot.forEach((document) => {
        const data = document.data();
        datDrawPrizes.push({
            id: document.id,
            ...data,
            createdAt: convertSecondsToDate(data.createdAt.seconds),
            usersWinner: (data.usersWinner ?? []).map((user) => ({
                ...user,
                createdAt: user.createdAt?.toDate?.() ?? null,
                updatedAt: user.updatedAt?.toDate?.() ?? null,
            })), // 👈 converte os timestamps dos ganhadores
                });
        });

        return datDrawPrizes;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
