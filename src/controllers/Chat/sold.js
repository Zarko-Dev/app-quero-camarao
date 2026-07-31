import {
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const markPublicationSold = async (publicationId) => {
    try {
        const pubRef = doc(firestore, models.shrimpPonds, publicationId);
        await updateDoc(pubRef, {
            sold: true,
            soldAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const closeChatsForPublication = async (publicationId) => {
    try {
        const ref = collection(firestore, models.chats);
        const snap = await getDocs(query(ref, where("publicationId", "==", publicationId)));

        const { docs } = snap;
        const CHUNK_SIZE = 450;
        const commits = [];
        for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
            const batch = writeBatch(firestore);
            docs.slice(i, i + CHUNK_SIZE).forEach((d) => {
                batch.set(d.ref, {
                    status: "closed",
                    closedAt: serverTimestamp(),
                    closedReason: "sold",
                }, { merge: true });
            });
            commits.push(batch.commit());
        }
        await Promise.all(commits);

        return docs.length;
    } catch (error) {
        Sentry.captureException(error);
        return -1;
    }
};
