import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

const chatDocId = (publicationId, buyerId) =>
    `${publicationId}_${String(buyerId).replace(/[@.]/g, "_")}`;

const messagesRef = (chatId) =>
    collection(firestore, models.chats, chatId, "messages");

export const sendChatMessage = async ({ publicationId, sellerId, buyerId, senderId, text }) => {
    try {
        const id = chatDocId(publicationId, buyerId);
        const chatRef = doc(firestore, models.chats, id);
        const snap = await getDoc(chatRef);

        if (!snap.exists()) {
            await setDoc(chatRef, {
                id,
                publicationId,
                sellerId,
                buyerId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        await addDoc(messagesRef(id), {
            senderId,
            text: text.trim(),
            createdAt: serverTimestamp(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const subscribeToChat = ({ publicationId, buyerId, onMessages }) => {
    const id = chatDocId(publicationId, buyerId);
    const q = query(messagesRef(id), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
        onMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
};
