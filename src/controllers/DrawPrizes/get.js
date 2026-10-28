/* eslint-disable object-curly-newline */
import {
    collection,
    getDocs,
    orderBy,
    query,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";
import { filterActiveDrawPrizes } from "./helpers";

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
            const createdAtDate =
                data.createdAt?.seconds != null
                    ? convertSecondsToDate(data.createdAt.seconds)
                    : data.createdAt?.toDate
                        ? data.createdAt.toDate()
                        : data.createdAt instanceof Date
                            ? data.createdAt
                            : data.createdAt
                                ? new Date(data.createdAt)
                                : new Date();

            datDrawPrizes.push({
                id: document.id,
                ...data,
                createdAt: createdAtDate,
                usersWinner: (data.usersWinner ?? []).map((user) => ({
                    ...user,
                    createdAt: user.createdAt?.toDate?.() ?? null,
                    updatedAt: user.updatedAt?.toDate?.() ?? null,
                })),
            });
        });

        return filterActiveDrawPrizes(datDrawPrizes);
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
