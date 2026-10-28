import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/StorageRN";
import { performStorageUpload } from "./uploadStorage";

export const uploadChatImage = async (chatId, localUri) => {
    try {
        const filename = `${Date.now()}.jpg`;

        return await performStorageUpload({
            storage,
            chatId,
            kind: "images",
            filename,
            localUri,
            contentType: "image/jpeg",
        });
    } catch (error) {
        Sentry.captureException(error);

        return { error: true, url: null };
    }
};
