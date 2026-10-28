const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

const discordAlerts = createDiscordFunctionAlertReporter();

const buildPreview = (msg) => {
    if (msg.audioUrl) return "🎵 Áudio";
    if (msg.imageUrl) return "📷 Foto";
    if (msg.fileUrl) return "📎 Documento";
    const text = (msg.text || "").trim();
    return text.length > 80 ? `${text.slice(0, 77)}...` : text;
};

// Espelha countUnreadChats do client (src/controllers/Chat/index.js) -
// mesma regra de "não lida", só que rodando com o Admin SDK.
const countUnreadChats = async (db, userId) => {
    const safeId = String(userId).replace(/[@.]/g, "_");
    const ref = db.collection("chats");
    const [buyerSnap, sellerSnap] = await Promise.all([
        ref.where("buyerId", "==", userId).get(),
        ref.where("sellerId", "==", userId).get(),
    ]);

    const seen = new Set();
    let count = 0;

    [...buyerSnap.docs, ...sellerSnap.docs].forEach((docSnap) => {
        if (seen.has(docSnap.id)) return;
        seen.add(docSnap.id);
        const chat = docSnap.data();
        if (chat.status === "closed") return;
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
};

const sendExpoPush = async (token, title, body, data, badge) => {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            to: token,
            title,
            sound: "default",
            body,
            channelId: "notifications-app",
            data,
            ...(badge != null ? { badge } : {}),
        }),
    });
    const result = await response.json();
    const ticket = Array.isArray(result?.data) ? result.data[0] : result?.data;
    if (!response.ok || ticket?.status === "error") {
        console.error("[chatNotifications] Expo push rejected:", JSON.stringify(result));
    } else {
        console.log("[chatNotifications] Expo push sent:", JSON.stringify(result));
    }
    return result;
};

const handleChatMessageCreated = async (event, db = admin.firestore()) => {
    const msg = event.data?.data();
    const { chatId } = event.params;
    if (!msg) {
        console.log("[chatNotifications] no message data, chatId=", chatId);
        return null;
    }

    if (msg.isAutoMessage === true) {
        console.log("[chatNotifications] skipping auto-message notification, chatId=", chatId);
        return null;
    }

    const chatSnap = await db.collection("chats").doc(chatId).get();
    if (!chatSnap.exists) {
        console.log("[chatNotifications] chat doc not found, chatId=", chatId);
        return null;
    }
    const chat = chatSnap.data();

    const recipientId = msg.senderId === chat.sellerId ? chat.buyerId : chat.sellerId;
    if (!recipientId) {
        console.log("[chatNotifications] no recipientId, chatId=", chatId);
        return null;
    }

    const recipientSnap = await db.collection("users").doc(recipientId).get();
    const token = recipientSnap.data()?.notification?.token;
    if (!token) {
        console.log("[chatNotifications] recipient has no push token, recipientId=", recipientId);
        return null;
    }

    const senderName = msg.senderId === chat.sellerId ? chat.sellerName : chat.buyerName;
    const badge = await countUnreadChats(db, recipientId);

    return sendExpoPush(
        token,
        senderName || "Nova mensagem",
        buildPreview(msg),
        {
            type: "chat",
            chatId,
            publicationId: chat.publicationId,
            sellerId: chat.sellerId,
            buyerId: chat.buyerId,
            sellerName: chat.sellerName,
            buyerName: chat.buyerName,
        },
        badge,
    );
};

exports.onChatMessageCreated = onDocumentCreated(
    "chats/{chatId}/messages/{messageId}",
    async (event) => {
        try {
            return await handleChatMessageCreated(event);
        } catch (error) {
            const message = event.data?.data?.() || {};
            const chatId = event.params?.chatId || "unknown";
            const messageId = event.params?.messageId || "unknown";
            void discordAlerts.reportDiscordFunctionError({
                functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
                functionName: "onChatMessageCreated",
                userId: message.senderId || "unknown",
                eventId: event.id || messageId,
                documentPath: event.data?.ref?.path || `chats/${chatId}/messages/${messageId}`,
                error,
                extra: {
                    chatId,
                    messageId,
                    senderId: message.senderId || "unknown",
                },
            });
            throw error;
        }
    },
);

exports.buildPreview = buildPreview;
exports.countUnreadChats = countUnreadChats;
exports.handleChatMessageCreated = handleChatMessageCreated;
