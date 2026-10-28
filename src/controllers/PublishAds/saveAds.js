import {
    doc,
    setDoc,
} from "../../services/FirebaseAdapter";
import { storage } from "../../services/StorageRN";
import { v4 } from "uuid";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models, storageModels } from "../../services/Firebase/models";
import { resizeImage } from "../../utils/uriToBlob";

export const saveImagePublishAds = async (imageUri, isVideo) => {
    let resultUrlImage;

    if (imageUri) {
        try {
            const resizedUri = isVideo ? imageUri : await resizeImage(imageUri);

            const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            const newFilename = `${new Date().getTime()}-${filename}`;

            const storageRef = storage().ref(
                `${storageModels.ads}/${newFilename}`,
            );

            await storageRef.putFile(resizedUri || imageUri);

            const urlImage = await storageRef.getDownloadURL();

            resultUrlImage = urlImage;

            if (urlImage) {
                return {
                    error: false,
                    urlImage,
                };
            }

            return {
                error: true,
                urlImage: null,
            };
        } catch (error) {
            Sentry.captureException(error);

            if (isVideo && Platform.OS === "ios" && resultUrlImage) {
                return {
                    error: false,
                    urlImage: resultUrlImage,
                };
            }

            return {
                error: true,
                urlImage: null,
            };
        }
    }

    return {
        error: true,
        urlImage: null,
    };
};

export const savePublishAds = async (dataAds) => {
    const id = v4();

    try {
        const publishAdsDoc = doc(firestore, models.publishAds, id);

        await setDoc(publishAdsDoc, {
            id,
            ...dataAds,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
