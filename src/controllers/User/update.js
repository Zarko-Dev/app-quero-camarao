import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updateUser = async (dataUser) => {
    try {
        const userDoc = doc(firestore, models.users, dataUser.email);

        await setDoc(
            userDoc,
            {
                ...dataUser,
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

export const updateUserInvitationGuestStatus = async (
    userid,
    fristIndication,
) => {
    try {
        const userDoc = doc(firestore, models.users, userid);

        await setDoc(
            userDoc,
            {
                guestData: {
                    fristIndication,
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

export const updateUserWasInvitedStatus = async (userid, wasInvited) => {
    try {
        const userDoc = doc(firestore, models.users, userid);

        await setDoc(
            userDoc,
            {
                guestData: {
                    wasInvited,
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

export const updateClientUserLocation = async (state, city, userId) => {
    try {
        const userDoc = doc(firestore, models.users, userId);

        await setDoc(
            userDoc,
            {
                state,
                city,
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
