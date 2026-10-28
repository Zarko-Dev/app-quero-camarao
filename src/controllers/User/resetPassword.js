import * as Sentry from "@sentry/react-native";
import { ensureFirebaseReady } from "../../services/Firebase";
import { getAuth, sendPasswordResetEmail } from "../../services/FirebaseAdapter";

export const resetUserPassword = async (email) => {
    try {
        const { firebaseApp } = await ensureFirebaseReady();
        const authInstance = getAuth(firebaseApp);
        await sendPasswordResetEmail(authInstance, email);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
