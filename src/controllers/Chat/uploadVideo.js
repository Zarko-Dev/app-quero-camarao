import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/StorageRN";
import { reportDiscordError } from "../../services/DiscordAlerts/context";
import { performStorageUpload } from "./uploadStorage";

// Limite conservador para chat: 50 MB
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
// Limite de duração via expo-image-picker (segundos)
export const VIDEO_MAX_DURATION_SECS = 120;

export const uploadChatVideo = async (chatId, localUri, mimeType = "video/mp4") => {
    try {
        const ext = mimeType === "video/quicktime" ? "mov" : "mp4";
        const filename = `${Date.now()}.${ext}`;

        return await performStorageUpload({
            storage,
            chatId,
            kind: "videos",
            filename,
            localUri,
            contentType: mimeType,
        });
    } catch (error) {
        Sentry.captureException(error);
        void reportDiscordError({
            source: "chat.upload-video",
            error,
            feature: "chat",
            action: "upload-video",
            extra: { chatId, mimeType },
        });

        return { error: true, url: null };
    }
};
