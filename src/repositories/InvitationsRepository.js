import {
    deleteDoc,
    doc,
    setDoc,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { docRef } from "./base";

export const createUserInvitation = async (userId, dataInvitations) => {
    try {
        const invitationRef = docRef(models.invitations, userId);

        await setDoc(
            invitationRef,
            {
                ...dataInvitations,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const deleteInvitation = async (invitationId) => {
    try {
        const invitationRef = docRef(models.invitations, invitationId);

        await deleteDoc(invitationRef);

        return true;
    } catch (error) {
        return false;
    }
};

export const updateInvitationMoreAccepted = async (
    invitationId,
    invitationsAccepted,
) => {
    try {
        const invitationRef = docRef(models.invitations, invitationId);

        await setDoc(
            invitationRef,
            {
                invitationsAccepted: invitationsAccepted + 1,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateInvitationMoreSended = async (
    invitationId,
    invitationsSended,
) => {
    try {
        const invitationRef = docRef(models.invitations, invitationId);

        await setDoc(
            invitationRef,
            {
                invitationsSended: invitationsSended + 1,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};
