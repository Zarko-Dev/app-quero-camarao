import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import * as Sentry from "@sentry/react-native";

import { firestore, storage } from "../../services/Firebase";
import { models, storageModels } from "../../services/Firebase/models";

export const deleteAdsImage = async (image) => {
    const deleteRef = ref(storage, `${storageModels.ads}/${image}`);

    try {
        await deleteObject(deleteRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const deleteAds = async (adsId) => {
    try {
        const adsRef = doc(firestore, models.publishAds, adsId);
        await deleteDoc(adsRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
