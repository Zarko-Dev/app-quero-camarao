import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updateInvitationMoreAccepted = async (
    invitationId,
    invitationsAccepted,
) => {
    try {
        const invitationDoc = doc(firestore, models.invitations, invitationId);

        await setDoc(
            invitationDoc,
            {
                invitationsAccepted: invitationsAccepted + 1,
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const updateInvitationMoreSended = async (
    invitationId,
    invitationsSended,
) => {
    try {
        const invitationDoc = doc(firestore, models.invitations, invitationId);

        await setDoc(
            invitationDoc,
            {
                invitationsSended: invitationsSended + 1,
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
