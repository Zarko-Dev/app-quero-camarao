/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const requestAnalysis = async (publicationId) => {
    try {
        const shrimpPondsDoc = doc(
            firestore,
            models.shrimpPonds,
            publicationId,
        );

        await setDoc(
            shrimpPondsDoc,
            {
                requestExtensionDate: "analysis",
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const changeRequestExtensionDate = async (
    publicationId,
    requestExtensionDate,
    createdAt,
) => {
    try {
        const shrimpPondsDoc = doc(
            firestore,
            models.shrimpPonds,
            publicationId,
        );

        let dataRequestExtensionDate;

        if (requestExtensionDate === "approved") {
            const expirationDate = new Date(createdAt);

            expirationDate.setDate(createdAt.getDate() + 22);

            dataRequestExtensionDate = {
                requestExtensionDate,
                expirationDate,
            };
        } else {
            dataRequestExtensionDate = { requestExtensionDate };
        }

        await setDoc(
            shrimpPondsDoc,
            {
                ...dataRequestExtensionDate,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
