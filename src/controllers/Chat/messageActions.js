import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

const safeId = (userId) => String(userId).replace(/[@.]/g, "_");

const messageRef = (chatId, messageId) =>
    doc(firestore, models.chats, chatId, "messages", messageId);

export const deleteMessageForMe = async (chatId, messageId, userId) => {
    try {
        await updateDoc(messageRef(chatId, messageId), {
            [`deletedFor.${safeId(userId)}`]: true,
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const deleteMessageForEveryone = async (chatId, messageId) => {
    try {
        await updateDoc(messageRef(chatId, messageId), {
            deletedForEveryone: true,
            deletedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const reportMessage = async ({
    chatId, messageId, reportedBy, reportedUserId, preview,
}) => {
    try {
        await addDoc(collection(firestore, models.reports), {
            chatId,
            messageId,
            reportedBy,
            reportedUserId,
            preview: preview || "",
            createdAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const markMessagesDelivered = async (chatId, messageIds, userId) => {
    try {
        const field = `deliveredTo.${safeId(userId)}`;
        const commits = [];
        for (let i = 0; i < messageIds.length; i += 450) {
            const batch = writeBatch(firestore);
            messageIds.slice(i, i + 450).forEach((messageId) => {
                batch.update(messageRef(chatId, messageId), {
                    [field]: serverTimestamp(),
                });
            });
            commits.push(batch.commit());
        }
        await Promise.all(commits);
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};
