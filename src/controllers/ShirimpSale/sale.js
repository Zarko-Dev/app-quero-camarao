import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getShirimpSale = async (publicationId) => {
    try {
        const shirimpSaleRef = collection(firestore, models.shirimpSale);
        const queryConfig = query(
            shirimpSaleRef,
            where("publicationId", "==", publicationId),
        );

        const shirimpSaleSnapshot = await getDocs(queryConfig);

        if (shirimpSaleSnapshot.empty) {
            return null;
        }

        return shirimpSaleSnapshot.docs[0].data();
    } catch (error) {
        Sentry.captureException(error);

        return null;
    }
};

export const updateShiripsOnShirimpSale = async (shirimpSaleId, sales) => {
    try {
        const shirimpSaleDoc = doc(
            firestore,
            models.shirimpSale,
            shirimpSaleId,
        );

        await setDoc(
            shirimpSaleDoc,
            {
                sales,
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

export const saveShirimpSale = async (shirimpSale) => {
    try {
        const resultFindShrimpSale = await getShirimpSale(
            shirimpSale.publicationId,
        );

        if (resultFindShrimpSale !== null) {
            const resultUpdateSale = await updateShiripsOnShirimpSale(
                resultFindShrimpSale.id,
                [...resultFindShrimpSale.sales, ...shirimpSale.sales],
            );

            return resultUpdateSale;
        }
        const shirimpSaleDoc = doc(
            firestore,
            models.shirimpSale,
            shirimpSale.id,
        );

        await setDoc(shirimpSaleDoc, {
            ...shirimpSale,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const getShirimpSaleByCreatedAtLastSevenDays = async () => {
    try {
        const shirimpSaleRef = collection(firestore, models.shirimpSale);
        const queryConfig = query(
            shirimpSaleRef,
            where(
                "createdAt",
                ">=",
                new Date(new Date().setDate(new Date().getDate() - 7)),
            ),
        );

        const shirimpSaleSnapshot = await getDocs(queryConfig);

        if (shirimpSaleSnapshot.empty) {
            return [];
        }

        return shirimpSaleSnapshot.docs.map((dataDoc) => dataDoc.data());
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};

export const getShirimpSaleByCreatedAtLastThirtyDays = async () => {
    try {
        const shirimpSaleRef = collection(firestore, models.shirimpSale);
        const queryConfig = query(
            shirimpSaleRef,
            where(
                "createdAt",
                ">=",
                new Date(new Date().setDate(new Date().getDate() - 30)),
            ),
        );

        const shirimpSaleSnapshot = await getDocs(queryConfig);

        if (shirimpSaleSnapshot.empty) {
            return [];
        }

        return shirimpSaleSnapshot.docs.map((dataDoc) => dataDoc.data());
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
