import { doc, setDoc } from "firebase/firestore";
import {
    getDownloadURL,
    ref,
    uploadBytes,
    uploadBytesResumable,
} from "firebase/storage";
import { v4 } from "uuid";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";

import { firestore, storage } from "../../services/Firebase";
import { models, storageModels } from "../../services/Firebase/models";
import { uriToBlob } from "../../utils/uriToBlob";

const uploadFileIsVideoIOS = async (storageRef, file) => {
    const response = await fetch(file);
    const blob = await response.blob();

    await uploadBytesResumable(storageRef, blob);
};

export const saveImagePublishAds = async (imageUri, isVideo) => {
    let resultUrlImage;

    if (imageUri) {
        try {
            const blobFile = await uriToBlob(imageUri, isVideo);

            const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            const newFilename = `${new Date().getTime()}-${filename}`;

            const storageRef = ref(
                storage,
                `${storageModels.ads}/${newFilename}`,
            );

            if (isVideo && Platform.OS === "ios") {
                await uploadFileIsVideoIOS(storageRef, imageUri);
            } else {
                await uploadBytes(storageRef, blobFile);
            }

            const urlImage = await getDownloadURL(storageRef);

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
