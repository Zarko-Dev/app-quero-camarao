import { collection, getDocs, query } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const getSignatureList = async () => {
    try {
        const listSignaturesRef = collection(firestore, models.listSignatures);
        const listSignaturesQuery = query(listSignaturesRef);

        const querySnapshot = await getDocs(listSignaturesQuery);

        const dataSignatures = [];

        querySnapshot.forEach((document) => {
            dataSignatures.push({ id: document.id, ...document.data() });
        });

        dataSignatures.sort((a, b) => a.order - b.order);

        return dataSignatures;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};
