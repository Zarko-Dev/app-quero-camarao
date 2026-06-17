import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/Firebase";

export const uploadChatImage = async (chatId, localUri) => {
    try {
        const filename = `${Date.now()}.jpg`;
        const storageRef = ref(storage, `chats/${chatId}/images/${filename}`);

        const response = await fetch(localUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
        const url = await getDownloadURL(storageRef);
        return { error: false, url };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true, url: null };
    }
};
