import * as Sentry from "@sentry/react-native";
import {
    doc,
    getDoc,
    updateDoc,
} from "../../services/FirebaseAdapter";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { getUserNotificationToken } from "../User/notification";
import { sendNotification } from "../../services/ExpoNotification/sendNotification";
import { canSendAttention, appendAttention } from "../../utils/attentionLimits";
import {
    buildAttentionNotificationData,
    isPushNotificationAccepted,
} from "../../utils/attentionNotification";

const safeId = (userId) => String(userId).replace(/[@.]/g, "_");

export const sendAttention = async ({
    chatId,
    senderId,
    senderName,
    recipientId,
    publicationId,
    sellerId,
    buyerId,
    sellerName,
    buyerName,
}) => {
    try {
        const chatRef = doc(firestore, models.chats, chatId);
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) return { ok: false, reason: "not_found" };
        if (chatSnap.data()?.status === "closed") return { ok: false, reason: "closed" };

        const safeSender = safeId(senderId);
        const now = Date.now();
        const log = chatSnap.data()?.attentionLog?.[safeSender];
        const check = canSendAttention(log, now);
        if (!check.allowed) return { ok: false, reason: check.reason };

        const recipientSnap = await getDoc(doc(firestore, models.users, recipientId));
        if (recipientSnap.exists() && recipientSnap.data()?.attentionEnabled === false) {
            return { ok: false, reason: "disabled" };
        }

        await updateDoc(chatRef, {
            [`attentionLog.${safeSender}`]: appendAttention(log, now),
        });

        const tokenResult = await getUserNotificationToken(recipientId);
        if (tokenResult.error || !tokenResult.data) {
            return { ok: false, reason: "notification_unavailable" };
        }

        const pushResult = await sendNotification(
            tokenResult.data,
            `🔔 ${senderName || "Alguém"} está chamando sua atenção.`,
            "Toque para abrir a conversa.",
            buildAttentionNotificationData({
                chatId,
                publicationId,
                sellerId,
                buyerId,
                sellerName,
                buyerName,
            }),
        );
        if (!isPushNotificationAccepted(pushResult)) {
            return { ok: false, reason: "notification_failed" };
        }

        return { ok: true };
    } catch (error) {
        Sentry.captureException(error);
        return { ok: false, reason: "error" };
    }
};

export const setAttentionEnabled = async (userId, enabled) => {
    try {
        await updateDoc(doc(firestore, models.users, userId), {
            attentionEnabled: enabled,
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};
