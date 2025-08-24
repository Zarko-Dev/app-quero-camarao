/* eslint-disable object-curly-newline */
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

export const getAllNotifications = async (token) => {
    try {
        const notificationsRef = collection(firestore, models.notifications);
        const notificationsQuery = query(
            notificationsRef,
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(notificationsQuery);

        const dataNotifications = [];
        const originalData = [];

        querySnapshot.forEach((document) => {
            if (document.data().tokens.some((item) => item.token === token)) {
                const resultData = {
                    id: document.id,
                    ...document.data(),
                    createdAt: convertSecondsToDate(
                        document.data().createdAt.seconds,
                    ),
                };

                originalData.push(resultData);

                const dataToken = resultData.tokens.filter(
                    (item) => item.token === token,
                )[0];

                dataNotifications.push({
                    id: resultData.id,
                    notification: resultData.notification,
                    token: dataToken.token,
                    read: dataToken.read,
                    createdAt: resultData.createdAt,
                });
            }
        });

        return { data: { dataNotifications, originalData }, error: false };
    } catch (error) {
        Sentry.captureException(error);

        return { data: [], error: true };
    }
};
