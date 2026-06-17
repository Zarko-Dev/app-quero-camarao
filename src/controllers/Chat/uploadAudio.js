import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/Firebase";

export const uploadChatAudio = async (chatId, localUri) => {
    try {
        const filename = `${Date.now()}.m4a`;
        const storageRef = ref(storage, `chats/${chatId}/audio/${filename}`);

        const response = await fetch(localUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob, { contentType: "audio/m4a" });
        const url = await getDownloadURL(storageRef);
        return { error: false, url };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true, url: null };
    }
};
