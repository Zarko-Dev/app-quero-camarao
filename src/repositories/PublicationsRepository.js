import {
    arrayUnion,
    deleteDoc,
    doc,
    getDoc,
    increment,
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
    location,
) => {
    try {
        const publicationRef = docRef(models.shrimpPonds, publicationId);

        await setDoc(
            publicationRef,
            { shrimps, edited, updatedAt: new Date(), ...(location && { location }) },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const setPublicationImageHidden = async (publicationId, hidden) => {
    try {
        await setDoc(
            docRef(models.shrimpPonds, publicationId),
            { imageHidden: Boolean(hidden), updatedAt: new Date() },
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

// Atômico (increment/arrayUnion): sem ler-e-reescrever, uma leitura negada
// ou duas visitas simultâneas não apagam visualizações anteriores.
export const setNewVisualizationPublication = async (
    publicationId,
    publicationViewsId,
    dataUserView,
    dataPublication,
) => {
    try {
        const shrimpPondsRef = docRef(models.shrimpPonds, publicationId);
        const logRef = docRef(models.logPublicationsViews, publicationViewsId);

        await setDoc(
            shrimpPondsRef,
            {
                views: increment(1),
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
                views: arrayUnion(dataUserView),
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
