import {
    deleteDoc,
    doc,
    getDoc,
    setDoc,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { docRef } from "./base";

export const saveShrimpPonds = async (dataPonds, userId) => {
    try {
        const pondsRef = docRef(models.shrimpPonds, dataPonds.id);
        const existing = await getDoc(pondsRef);
        if (existing.exists()) {
            return true;
        }
        const currentDate = new Date();
        const expirationDate = new Date(currentDate);
        expirationDate.setDate(currentDate.getDate() + 15);

        await setDoc(
            pondsRef,
            {
                ...dataPonds,
                userId,
                views: 0,
                expirationDate,
                createdAt: currentDate,
                updatedAt: currentDate,
            },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateShrimpsPublication = async (
    publicationId,
    shrimps,
    edited,
    publisherId,
) => {
    try {
        const publicationRef = docRef(models.shrimpPonds, publicationId);

        await setDoc(
            publicationRef,
            { shrimps, edited, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updatePondsPublication = async (
    publicationId,
    newShrimps,
    publisherId,
) => {
    try {
        const publicationRef = docRef(models.shrimpPonds, publicationId);

        await setDoc(
            publicationRef,
            { shrimps: newShrimps, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updatePublicationWithShirimpSalle = async (
    publicationId,
    shirimpUpdated,
) => {
    try {
        const publicationRef = docRef(models.shrimpPonds, publicationId);

        await setDoc(
            publicationRef,
            { shrimps: shirimpUpdated, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const deletePublication = async (publicationId) => {
    try {
        const publicationRef = docRef(models.shrimpPonds, publicationId);

        await deleteDoc(publicationRef);

        return true;
    } catch (error) {
        return false;
    }
};

export const setNewVisualizationPublication = async (
    publicationId,
    publicationViewsId,
    views,
    dataViews,
    dataUserView,
    dataPublication,
) => {
    try {
        const shrimpPondsRef = docRef(models.shrimpPonds, publicationId);
        const logRef = docRef(models.logPublicationsViews, publicationViewsId);

        await setDoc(
            shrimpPondsRef,
            {
                views: views + 1,
                publicationViewsId,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        await setDoc(
            logRef,
            {
                id: publicationViewsId,
                publicationId,
                location: dataPublication.location,
                shrimps: dataPublication.shrimps,
                userId: dataPublication.userId,
                views: [
                    ...dataViews,
                    {
                        ...dataUserView,
                        userImage:
                            dataUserView.userImage === undefined
                                ? ""
                                : dataUserView.userImage,
                    },
                ],
                createdAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const requestAnalysis = async (publicationId) => {
    try {
        const pondsRef = docRef(models.shrimpPonds, publicationId);

        await setDoc(
            pondsRef,
            {
                requestExtensionDate: "analysis",
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const changeRequestExtensionDate = async (
    publicationId,
    requestExtensionDate,
    createdAt,
) => {
    try {
        const pondsRef = docRef(models.shrimpPonds, publicationId);

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
            pondsRef,
            {
                ...dataRequestExtensionDate,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};
