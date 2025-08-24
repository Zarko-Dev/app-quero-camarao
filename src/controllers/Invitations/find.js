import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const VerifyIfUserInvitationExists = async (userId) => {
    try {
        const invitationRef = doc(firestore, models.invitations, userId);
        const docSnap = await getDoc(invitationRef);

        if (docSnap.exists()) {
            return {
                error: false,
                data: docSnap.data(),
            };
        }

        return {
            error: true,
            data: null,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};

export const getInvitationByCode = async (invitationCode) => {
    try {
        const invitationRef = collection(firestore, models.invitations);
        const queryConfig = query(
            invitationRef,
            where("invitationCode", "==", `${invitationCode}`),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataInvitation = [];

        querySnapshot.forEach((data) => {
            dataInvitation.push({ ...data.data(), id: data.id });
        });

        if (dataInvitation.length > 0) {
            return {
                error: false,
                data: dataInvitation[0],
            };
        }

        return {
            error: true,
            data: null,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};
