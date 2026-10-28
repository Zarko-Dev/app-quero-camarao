import * as Sentry from "@sentry/react-native";

import { storage } from "../../services/StorageRN";
import { storageModels } from "../../services/Firebase/models";
import { resizeImage } from "../../utils/uriToBlob";

export const savePondsImages = async (imageUri) => {
    if (imageUri) {
        try {
            const resizedUri = await resizeImage(imageUri);

            const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            const newFilename = `${new Date().getTime()}-${filename}`;

            const storageRef = storage().ref(
                `${storageModels.shrimp}/${newFilename}`,
            );

            await storageRef.putFile(resizedUri || imageUri);

            const urlImage = await storageRef.getDownloadURL();

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
