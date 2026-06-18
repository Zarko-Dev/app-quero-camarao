import { httpsCallable } from "firebase/functions";
import * as Sentry from "@sentry/react-native";

import { functions } from "../../services/Firebase";

export const resetPasswordByIdentifier = async (identifier, newPassword) => {
    try {
        const fn = httpsCallable(functions, "resetPasswordByIdentifier");
        await fn({ identifier, newPassword });
        return { error: false };
    } catch (error) {
        Sentry.captureException(error);
        const code = error?.code || "";
        if (code.includes("not-found")) {
            return { error: true, message: "Conta não encontrada. Verifique o CPF ou telefone." };
        }
        return { error: true, message: error?.message || "Erro ao redefinir senha." };
    }
};
