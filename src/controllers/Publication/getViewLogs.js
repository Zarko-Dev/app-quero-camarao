/* eslint-disable object-curly-newline */
import { collection, getDocs, query } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

export const getViewLogs = async () => {
    try {
        const ViewLogsRef = collection(firestore, models.logPublicationsViews);
        const queryConfig = query(ViewLogsRef);

        const querySnapshot = await getDocs(queryConfig);
        const dataViewLogs = [];

        querySnapshot.forEach((document) => {
            const dataLogs = document.data();

            dataViewLogs.push({
                id: dataLogs.id,
                logViews: dataLogs.views.map((item) => ({
                    user: item.userName,
                    userId: item.userId,
                    userPhone: item.userPhone,
                    userImage: item.userImage,
                    userType: item.userType,
                    createdAt: convertSecondsToDate(item.createdAt.seconds),
                })),
                location: dataLogs.location,
                shrimps: dataLogs.shrimps,
                userId: dataLogs.userId,
                createdAt: convertSecondsToDate(dataLogs.createdAt.seconds),
            });
        });

        if (dataViewLogs.length > 0) {
            return {
                error: false,
                data: dataViewLogs.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                ),
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
