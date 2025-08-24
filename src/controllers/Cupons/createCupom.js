import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const CreateCupom = async (dataCupom) => {
    try {
        const userDoc = doc(firestore, models.cupons, dataCupom.cupomCode);

        await setDoc(userDoc, {
            ...dataCupom,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
