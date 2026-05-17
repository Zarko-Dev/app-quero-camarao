/* eslint-disable object-curly-newline */
import { collection, getDocs, query } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

let cachedViewLogs = [];
let cachedViewLogsAt = 0;
const VIEW_LOGS_CACHE_TTL_MS = 120000;

export const getViewLogs = async () => {
    try {
        const now = Date.now();
        if (cachedViewLogs.length > 0 && now - cachedViewLogsAt < VIEW_LOGS_CACHE_TTL_MS) {
            return {
                error: false,
                data: cachedViewLogs,
            };
        }

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
            const sortedData = dataViewLogs.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
            cachedViewLogs = sortedData;
            cachedViewLogsAt = now;

            return {
                error: false,
                data: sortedData,
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
