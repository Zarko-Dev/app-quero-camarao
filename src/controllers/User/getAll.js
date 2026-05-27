/* eslint-disable object-curly-newline */
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

let cachedUsers = [];
let cachedUsersAt = 0;
const USERS_CACHE_TTL_MS = 120000;

export const getAllUsers = async () => {
    try {
        const now = Date.now();
        if (cachedUsers.length > 0 && now - cachedUsersAt < USERS_CACHE_TTL_MS) {
            return cachedUsers;
        }

        const UsersRef = collection(firestore, models.users);
        const usersQuery = query(UsersRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(usersQuery);

        const dataUsers = [];

        querySnapshot.forEach((document) => {
            const data = document.data();
            dataUsers.push({
                ...data,
                createdAt: data.createdAt?.seconds
                    ? convertSecondsToDate(data.createdAt.seconds)
                    : null,
            });
        });

        cachedUsers = dataUsers;
        cachedUsersAt = now;

        return dataUsers;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};

export const getUsersByEmails = async (emails) => {
    try {
        const UsersRef = collection(firestore, models.users);
        const usersQuery = query(
            UsersRef,
            where("email", "in", emails),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(usersQuery);

        const dataUsers = [];

        querySnapshot.forEach((document) => {
            const data = document.data();
            dataUsers.push({
                ...data,
                createdAt: data.createdAt?.seconds
                    ? convertSecondsToDate(data.createdAt.seconds)
                    : null,
            });
        });

        return dataUsers;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
