import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const createUserInvitation = async (userId, dataInvitations) => {
    try {
        const invitationDoc = doc(firestore, models.invitations, userId);

        await setDoc(invitationDoc, {
            ...dataInvitations,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
