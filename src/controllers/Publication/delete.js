import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import * as Sentry from "@sentry/react-native";

import { firestore, storage } from "../../services/Firebase";
import { models, storageModels } from "../../services/Firebase/models";

export const deletePublication = async (publicationId) => {
    try {
        const shrimpPondsRef = doc(
            firestore,
            models.shrimpPonds,
            publicationId,
        );
        await deleteDoc(shrimpPondsRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const deletePublicationImages = async (image) => {
    const deleteRef = ref(storage, `${storageModels.shrimp}/${image}`);

    try {
        await deleteObject(deleteRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
