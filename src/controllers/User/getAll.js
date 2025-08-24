/* eslint-disable object-curly-newline */
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

export const getAllUsers = async () => {
    try {
        const UsersRef = collection(firestore, models.users);
        const usersQuery = query(UsersRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(usersQuery);

        const dataUsers = [];

        querySnapshot.forEach((document) => {
            dataUsers.push({
                ...document.data(),
                createdAt: convertSecondsToDate(
                    document.data().createdAt.seconds,
                ),
            });
        });

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
            dataUsers.push({
                ...document.data(),
                createdAt: convertSecondsToDate(
                    document.data().createdAt.seconds,
                ),
            });
        });

        return dataUsers;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
