import {
    deleteDoc,
    doc,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { storage } from "../../services/StorageRN";
import { models, storageModels } from "../../services/Firebase/models";

export const deleteAdsImage = async (image) => {
    const deleteRef = storage().ref(`${storageModels.ads}/${image}`);

    try {
        await deleteRef.delete();

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
