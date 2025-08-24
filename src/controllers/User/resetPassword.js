import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import * as Sentry from "@sentry/react-native";

import { firebaseApp } from "../../services/Firebase";

export const resetUserPassword = async (email) => {
    const auth = getAuth(firebaseApp);

    try {
        await sendPasswordResetEmail(auth, email);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
