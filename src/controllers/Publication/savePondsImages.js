import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Sentry from "@sentry/react-native";

import { storage } from "../../services/Firebase";
import { storageModels } from "../../services/Firebase/models";
import { uriToBlob } from "../../utils/uriToBlob";

export const savePondsImages = async (imageUri) => {
    if (imageUri) {
        try {
            const blobFile = await uriToBlob(imageUri);

            const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            const newFilename = `${new Date().getTime()}-${filename}`;

            const storageRef = ref(
                storage,
                `${storageModels.shrimp}/${newFilename}`,
            );

            await uploadBytes(storageRef, blobFile);

            const urlImage = await getDownloadURL(storageRef);

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
