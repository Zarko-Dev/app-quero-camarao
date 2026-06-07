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
    updateDoc,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const chatDocId = (publicationId, buyerId) =>
    `${publicationId}_${String(buyerId).replace(/[@.]/g, "_")}`;

const messagesRef = (chatId) =>
    collection(firestore, models.chats, chatId, "messages");

export const sendChatMessage = async ({
    publicationId,
    sellerId,
    buyerId,
    senderId,
    text,
    sellerName = "",
    buyerName = "",
    publicationTitle = "",
}) => {
    try {
        const id = chatDocId(publicationId, buyerId);
        const chatRef = doc(firestore, models.chats, id);
        const snap = await getDoc(chatRef);
        const trimmed = text.trim();

        if (!snap.exists()) {
            await setDoc(chatRef, {
                id,
                publicationId,
                sellerId,
                buyerId,
                sellerName,
                buyerName,
                publicationTitle,
                lastMessage: trimmed,
                lastMessageAt: serverTimestamp(),
                lastSeenAt: {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } else {
            await updateDoc(chatRef, {
                lastMessage: trimmed,
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        await addDoc(messagesRef(id), {
            senderId,
            text: trimmed,
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
