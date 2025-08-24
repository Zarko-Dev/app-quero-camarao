import { deleteDoc, doc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const deleteInvitation = async (invitationId) => {
    try {
        const invitationRef = doc(firestore, models.invitations, invitationId);
        await deleteDoc(invitationRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
