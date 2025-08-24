import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { v4 } from "uuid";
import * as Sentry from "@sentry/react-native";

import { firestore, storage } from "../../services/Firebase";
import { models, storageModels } from "../../services/Firebase/models";

export const deleteUserImage = async (image) => {
    const deleteRef = ref(storage, `${storageModels.user}/${image}`);

    try {
        await deleteObject(deleteRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const deleteUser = async (userId) => {
    try {
        const shrimpPondsRef = doc(firestore, models.users, userId);
        await deleteDoc(shrimpPondsRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const saveUserFeedback = async (feedBack, userName) => {
    try {
        const feddbackDoc = doc(firestore, models.feedBack, v4());

        await setDoc(feddbackDoc, {
            userName,
            feedBack,
            createdAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
