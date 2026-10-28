import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/StorageRN";
import { performStorageUpload } from "./uploadStorage";

const sanitizeFileName = (name) =>
    String(name || "arquivo").replace(/[^A-Za-z0-9._-]/g, "_");

export const uploadChatFile = async (chatId, localUri, fileName, mimeType) => {
    try {
        const filename = `${Date.now()}_${sanitizeFileName(fileName)}`;

        return await performStorageUpload({
            storage,
            chatId,
            kind: "files",
            filename,
            localUri,
            contentType: mimeType || "application/octet-stream",
        });
    } catch (error) {
        Sentry.captureException(error);

        return { error: true, url: null };
    }
};
