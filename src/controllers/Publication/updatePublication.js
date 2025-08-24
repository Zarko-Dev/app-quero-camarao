import { doc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { sendNotificationEditPublication } from "../Notifications/sendNotificationNewPublication";

export const updateShrimpsPublication = async (
    publicationId,
    shrimps,
    edited,
) => {
    const publicationDoc = doc(firestore, models.shrimpPonds, publicationId);

    try {
        await setDoc(
            publicationDoc,
            { shrimps, edited, updatedAt: new Date() },
            { merge: true },
        );

        await sendNotificationEditPublication();

        return true;
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Não foi possível realizar a atualização!",
            text2: "Tente novamente mais tarde!",
        });

        return false;
    }
};

export const updatePondsPublication = async (publicationId, newShrimps) => {
    const publicationDoc = doc(firestore, models.shrimpPonds, publicationId);

    try {
        await setDoc(
            publicationDoc,
            { shrimps: newShrimps, updatedAt: new Date() },
            { merge: true },
        );

        await sendNotificationEditPublication();

        return true;
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Não foi possível realizar a atualização!",
            text2: "Tente novamente mais tarde!",
        });

        return false;
    }
};

export const updatePublicationWithShirimpSalle = async (
    publicationId,
    shirimpUpdated,
) => {
    const publicationDoc = doc(firestore, models.shrimpPonds, publicationId);

    try {
        await setDoc(
            publicationDoc,
            { shrimps: shirimpUpdated, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Não foi possível realizar a atualização!",
            text2: "Tente novamente mais tarde!",
        });

        return false;
    }
};
