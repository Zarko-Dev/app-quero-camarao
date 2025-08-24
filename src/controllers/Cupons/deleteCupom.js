import { deleteDoc, doc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const deleteCupom = async (cuponCode) => {
    try {
        const cuponsRef = doc(firestore, models.cupons, cuponCode);
        await deleteDoc(cuponsRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
