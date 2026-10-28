import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/StorageRN";
import { performStorageUpload } from "./uploadStorage";

export const uploadChatAudio = async (chatId, localUri) => {
    try {
        const filename = `${Date.now()}.m4a`;

        return await performStorageUpload({
            storage,
            chatId,
            kind: "audio",
            filename,
            localUri,
            contentType: "audio/m4a",
        });
    } catch (error) {
        Sentry.captureException(error);

        return { error: true, url: null };
    }
};
