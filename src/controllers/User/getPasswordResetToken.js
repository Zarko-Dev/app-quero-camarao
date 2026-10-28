import { httpsCallable } from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { functions } from "../../services/Firebase";

export const getPasswordResetToken = async (identifier) => {
    try {
        const fn = httpsCallable(functions, "getPasswordResetToken");
        const result = await fn({ identifier });
        return { token: result.data.token, error: false };
    } catch (error) {
        Sentry.captureException(error);
        const message = error?.message || "Erro ao buscar conta.";
        return { error: true, message };
    }
};
