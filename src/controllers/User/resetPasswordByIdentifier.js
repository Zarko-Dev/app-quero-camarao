import { httpsCallable } from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { functions } from "../../services/Firebase";

export const resetPasswordByIdentifier = async (identifier, dateBirth, newPassword) => {
    try {
        const fn = httpsCallable(functions, "resetPasswordByIdentifier");
        await fn({ identifier, dateBirth, newPassword });

        return { error: false };
    } catch (error) {
        Sentry.captureException(error);

        const code = error?.code || "";

        if (code.includes("not-found")) {
            return {
                error: true,
                message: "Conta não encontrada. Verifique o CPF ou telefone.",
            };
        }

        if (code.includes("permission-denied")) {
            return {
                error: true,
                message: "Data de nascimento não confere com o cadastro.",
            };
        }

        if (code.includes("failed-precondition")) {
            return {
                error: true,
                message: "Existe mais de um cadastro com esse CPF ou telefone. Fale com o suporte.",
            };
        }

        if (code.includes("invalid-argument")) {
            return {
                error: true,
                message: "Dados inválidos para redefinir a senha.",
            };
        }

        return { error: true, message: error?.message || "Erro ao redefinir senha." };
    }
};
