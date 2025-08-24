/* eslint-disable object-curly-newline */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updateUserNotification = async (user, platform, token) => {
    try {
        const userDoc = doc(firestore, models.users, user);

        await setDoc(
            userDoc,
            {
                notification: {
                    platform,
                    token,
                },
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const getAllUserTokenNotification = async () => {
    try {
        const userRef = collection(firestore, models.users);
        const queryConfig = query(userRef);

        const querySnapshot = await getDocs(queryConfig);
        const dataNotificationToken = [];

        querySnapshot.forEach((document) => {
            const dataUser = document.data();

            if (dataUser?.notification) {
                dataNotificationToken.push({
                    user: document.data().name,
                    notification: document.data().notification,
                    userType: document.data().userType,
                });
            }
        });

        if (dataNotificationToken.length > 0) {
            return {
                error: false,
                data: dataNotificationToken,
            };
        }

        return {
            error: true,
            data: dataNotificationToken,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};

export const getUserNotificationToken = async (userId) => {
    try {
        const usersRef = doc(firestore, models.users, userId);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            const dataUser = docSnap.data();

            if (dataUser?.notification?.token) {
                return {
                    error: false,
                    data: dataUser.notification.token,
                };
            }

            return {
                error: false,
                data: "",
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
