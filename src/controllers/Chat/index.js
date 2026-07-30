import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { getUserNotificationToken } from "../User/notification";
import { sendNotification } from "../../services/ExpoNotification/sendNotification";

export const chatDocId = (publicationId, buyerId) =>
    `${publicationId}_${String(buyerId).replace(/[@.]/g, "_")}`;

const messagesRef = (chatId) =>
    collection(firestore, models.chats, chatId, "messages");

export const countUnreadChats = async (userId) => {
    try {
        const safeId = String(userId).replace(/[@.]/g, "_");
        const ref = collection(firestore, models.chats);
        const [buyerSnap, sellerSnap] = await Promise.all([
            getDocs(query(ref, where("buyerId", "==", userId))),
            getDocs(query(ref, where("sellerId", "==", userId))),
        ]);

        const seen = new Set();
        let count = 0;

        [...buyerSnap.docs, ...sellerSnap.docs].forEach((d) => {
            if (seen.has(d.id)) return;
            seen.add(d.id);
            const chat = d.data();
            if (!chat.lastMessageAt || !chat.lastMessage) return;
            const lastSeen = chat.lastSeenAt?.[safeId];
            if (!lastSeen) {
                count += 1;
                return;
            }
            const seenMs = lastSeen?.toMillis?.() ?? 0;
            const msgMs = chat.lastMessageAt?.toMillis?.() ?? 0;
            if (msgMs > seenMs) count += 1;
        });

        return count;
    } catch (error) {
        Sentry.captureException(error);
        return null;
    }
};

export const markAutoMessageSent = async (chatId) => {
    try {
        const chatRef = doc(firestore, models.chats, chatId);
        await updateDoc(chatRef, { autoMessageSentAt: serverTimestamp() });
    } catch (error) {
        Sentry.captureException(error);
    }
};

export const sendChatMessage = async ({
    publicationId,
    sellerId,
    buyerId,
    senderId,
    text = "",
    audioUrl = null,
    audioDuration = null,
    imageUrl = null,
    fileUrl = null,
    fileName = null,
    fileSize = null,
    sellerName = "",
    buyerName = "",
    publicationTitle = "",
}) => {
    try {
        const id = chatDocId(publicationId, buyerId);
        console.log("[Chat] sendChatMessage id=", id, "publicationId=", publicationId, "buyerId=", buyerId, "senderId=", senderId);
        const chatRef = doc(firestore, models.chats, id);
        const snap = await getDoc(chatRef);
        const trimmed = text ? text.trim() : "";
        let lastMessage = trimmed;
        if (audioUrl) lastMessage = "🎵 Áudio";
        else if (imageUrl) lastMessage = "📷 Foto";
        else if (fileUrl) lastMessage = "📎 Documento";

        if (!snap.exists()) {
            await setDoc(chatRef, {
                id,
                publicationId,
                sellerId,
                buyerId,
                sellerName,
                buyerName,
                publicationTitle,
                lastMessage,
                lastMessageAt: serverTimestamp(),
                lastMessageSenderId: senderId,
                lastSeenAt: {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } else {
            await updateDoc(chatRef, {
                lastMessage,
                lastMessageAt: serverTimestamp(),
                lastMessageSenderId: senderId,
                updatedAt: serverTimestamp(),
            });
        }

        const msgData = { senderId, createdAt: serverTimestamp() };
        if (audioUrl) {
            msgData.audioUrl = audioUrl;
            if (audioDuration != null) msgData.audioDuration = audioDuration;
        } else if (imageUrl) {
            msgData.imageUrl = imageUrl;
        } else if (fileUrl) {
            msgData.fileUrl = fileUrl;
            if (fileName) msgData.fileName = fileName;
            if (fileSize != null) msgData.fileSize = fileSize;
        } else {
            msgData.text = trimmed;
        }
        await addDoc(messagesRef(id), msgData);

        const recipientId = senderId === sellerId ? buyerId : sellerId;
        const senderNameForNotification = senderId === sellerId ? sellerName : buyerName;
        const tokenResult = await getUserNotificationToken(recipientId);
        if (!tokenResult.error && tokenResult.data) {
            const unreadBadge = await countUnreadChats(recipientId);
            await sendNotification(
                tokenResult.data,
                senderNameForNotification || "Nova mensagem",
                lastMessage.length > 80 ? lastMessage.slice(0, 77) + "..." : lastMessage,
                {
                    type: "chat",
                    chatId: id,
                    publicationId,
                    sellerId,
                    buyerId,
                    sellerName,
                    buyerName,
                },
                unreadBadge,
            );
        }

        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const subscribeToChat = ({ publicationId, buyerId, onMessages, onChatMeta, onError }) => {
    const id = chatDocId(publicationId, buyerId);
    console.log("[Chat] subscribeToChat id=", id, "publicationId=", publicationId, "buyerId=", buyerId);
    const q = query(messagesRef(id), orderBy("createdAt", "asc"));
    const unsubMessages = onSnapshot(q, (snap) => {
        console.log("[Chat] snapshot docs=", snap.docs.length);
        onMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => {
        console.error("[Chat] subscribeToChat error:", error.code, error.message);
        Sentry.captureException(error);
        onError?.(error);
    });

    const chatRef = doc(firestore, models.chats, id);
    const unsubChat = onSnapshot(chatRef, (snap) => {
        if (snap.exists()) {
            onChatMeta?.(snap.data());
        }
    }, (error) => {
        console.error("[Chat] subscribeToChat chat-doc error:", error.code, error.message);
        Sentry.captureException(error);
        onError?.(error);
    });

    return () => {
        unsubMessages();
        unsubChat();
    };
};

export const markChatAsSeen = async (chatId, userId) => {
    try {
        const safeId = String(userId).replace(/[@.]/g, "_");
        const chatRef = doc(firestore, models.chats, chatId);
        await updateDoc(chatRef, {
            [`lastSeenAt.${safeId}`]: serverTimestamp(),
        });
    } catch (error) {
        Sentry.captureException(error);
    }
};

export const subscribeUnreadChatsCount = (userId, onCount) => {
    const safeId = String(userId).replace(/[@.]/g, "_");
    const ref = collection(firestore, models.chats);
    const qBuyer = query(ref, where("buyerId", "==", userId));
    const qSeller = query(ref, where("sellerId", "==", userId));

    let buyerChats = [];
    let sellerChats = [];

    const compute = () => {
        const all = [...buyerChats, ...sellerChats];
        const count = all.filter((chat) => {
            const lastSeen = chat.lastSeenAt?.[safeId];
            const lastMsg = chat.lastMessageAt;
            if (!lastMsg || !chat.lastMessage) return false;
            if (!lastSeen) return true;
            const seenMs = lastSeen?.toMillis?.() ?? 0;
            const msgMs = lastMsg?.toMillis?.() ?? 0;
            return msgMs > seenMs;
        }).length;
        onCount(count);
    };

    const unsubBuyer = onSnapshot(qBuyer, (snap) => {
        buyerChats = snap.docs.map((d) => d.data());
        compute();
    });
    const unsubSeller = onSnapshot(qSeller, (snap) => {
        sellerChats = snap.docs.map((d) => d.data());
        compute();
    });

    return () => { unsubBuyer(); unsubSeller(); };
};

export const subscribeMyChats = (userId, onChats) => {
    const ref = collection(firestore, models.chats);
    const qBuyer = query(ref, where("buyerId", "==", userId));
    const qSeller = query(ref, where("sellerId", "==", userId));

    let buyerChats = [];
    let sellerChats = [];

    const merge = () => {
        const seen = new Set();
        const all = [...buyerChats, ...sellerChats].filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
        });
        all.sort((a, b) => {
            const ta = a.lastMessageAt?.toMillis?.() ?? 0;
            const tb = b.lastMessageAt?.toMillis?.() ?? 0;
            return tb - ta;
        });
        onChats(all);
    };

    const unsubBuyer = onSnapshot(qBuyer, (snap) => {
        buyerChats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        merge();
    });
    const unsubSeller = onSnapshot(qSeller, (snap) => {
        sellerChats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        merge();
    });

    return () => { unsubBuyer(); unsubSeller(); };
};
