import { deleteDoc, setDoc } from "../services/FirebaseAdapter";

import { models } from "../services/Firebase/models";
import { buildUserAddressUpdate, normalizeUserEmail } from "../utils/userAddress";
import { docRef } from "./base";

export const updateUser = async (dataUser) => {
    try {
        const userRef = docRef(models.users, dataUser.email);

        await setDoc(
            userRef,
            {
                ...dataUser,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateUserInvitationGuestStatus = async (
    userid,
    fristIndication,
) => {
    try {
        const userRef = docRef(models.users, userid);

        await setDoc(
            userRef,
            {
                guestData: {
                    fristIndication,
                },
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateUserWasInvitedStatus = async (userid, wasInvited) => {
    try {
        const userRef = docRef(models.users, userid);

        await setDoc(
            userRef,
            {
                guestData: {
                    wasInvited,
                },
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateClientUserLocation = async (state, city, userId) => {
    try {
        const userRef = docRef(models.users, userId);

        await setDoc(
            userRef,
            {
                state,
                city,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const saveUserImage = async (email, imageUrl) => {
    try {
        const userRef = docRef(models.users, email);

        await setDoc(
            userRef,
            {
                userImage: imageUrl,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const deleteUser = async (userId) => {
    try {
        const userRef = docRef(models.users, userId);

        await deleteDoc(userRef);

        return true;
    } catch (error) {
        return false;
    }
};

export const saveUserFeedback = async (feedBack, userName) => {
    try {
        const { v4 } = await import("uuid");
        const feedbackRef = docRef(models.feedBack, v4());

        await setDoc(
            feedbackRef,
            {
                userName,
                feedBack,
                createdAt: new Date(),
            },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const UpdateUserAddress = async (userId, dataUpdate) => {
    try {
        const userRef = docRef(models.users, normalizeUserEmail(userId));

        await setDoc(
            userRef,
            { ...buildUserAddressUpdate(dataUpdate), updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        console.error("[UserAddress] update failed:", {
            code: error?.code,
            message: error?.message,
        });
        return false;
    }
};

export const UpdateUserToProductor = async (userId, dataUpdate) => {
    try {
        const userRef = docRef(models.users, userId);

        await setDoc(
            userRef,
            { ...dataUpdate, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateUserNotification = async (user, platform, token) => {
    try {
        const userRef = docRef(models.users, user);

        await setDoc(
            userRef,
            {
                notification: {
                    platform,
                    token,
                },
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const createDataUser = async (dataUser) => {
    try {
        const userRef = docRef(models.users, dataUser.email);

        delete dataUser.password;

        await setDoc(
            userRef,
            {
                ...dataUser,
                userImage: "",
                rules: ["Normal"],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        );

        return true;
    } catch (error) {
        return false;
    }
};
