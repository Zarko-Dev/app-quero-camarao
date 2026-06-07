import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

const chatDocId = (publicationId, buyerId) =>
    `${publicationId}_${String(buyerId).replace(/[@.]/g, "_")}`;

export const sendChatMessage = async ({ publicationId, sellerId, buyerId, senderId, text }) => {
    try {
        const id = chatDocId(publicationId, buyerId);
        const ref = doc(firestore, models.chats, id);
        const snap = await getDoc(ref);
        const msg = { senderId, text: text.trim(), createdAt: new Date() };
        if (!snap.exists()) {
            await setDoc(ref, {
                id,
                publicationId,
                sellerId,
                buyerId,
                messages: [msg],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else {
            await updateDoc(ref, { messages: arrayUnion(msg), updatedAt: new Date() });
        }
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const subscribeToChat = ({ publicationId, buyerId, onMessages }) => {
    const id = chatDocId(publicationId, buyerId);
    const ref = doc(firestore, models.chats, id);
    return onSnapshot(ref, (snap) => {
        onMessages(snap.exists() ? snap.data().messages ?? [] : []);
    });
};
