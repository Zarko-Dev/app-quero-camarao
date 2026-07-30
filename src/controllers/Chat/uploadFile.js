import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/Firebase";

const sanitizeFileName = (name) =>
    String(name || "arquivo").replace(/[^A-Za-z0-9._-]/g, "_");

export const uploadChatFile = async (chatId, localUri, fileName, mimeType) => {
    try {
        const filename = `${Date.now()}_${sanitizeFileName(fileName)}`;
        const storageRef = ref(storage, `chats/${chatId}/files/${filename}`);

        const response = await fetch(localUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob, {
            contentType: mimeType || "application/octet-stream",
        });
        const url = await getDownloadURL(storageRef);
        return { error: false, url };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true, url: null };
    }
};
