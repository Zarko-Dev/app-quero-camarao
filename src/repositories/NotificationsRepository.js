import { v4 } from "uuid";
import {
    doc,
    setDoc,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { docRef } from "./base";

export const saveNotification = async (tokens, notification) => {
    try {
        const notificationRef = docRef(models.notifications, v4());

        await setDoc(
            notificationRef,
            {
                tokens: tokens.map((token) => ({ token, read: false })),
                notification,
                createdAt: new Date(),
            },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateNotification = async (notificationId, tokens) => {
    try {
        const notificationRef = docRef(models.notifications, notificationId);

        await setDoc(
            notificationRef,
            { tokens },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};
