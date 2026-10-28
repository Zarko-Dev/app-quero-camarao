import * as Sentry from "@sentry/react-native";
import { httpsCallable } from "../../services/FirebaseAdapter";

import * as UsersRepository from "../../repositories/UsersRepository";
import { functions } from "../../services/Firebase";
import { storage } from "../../services/StorageRN";

export const deleteUserImage = async (image) => {
    const { storageModels } = await import("../../services/Firebase/models");

    const deleteRef = storage().ref(`${storageModels.user}/${image}`);

    try {
        await deleteRef.delete();

        return true;
    } catch (error) {
        return false;
    }
};

// Apaga a conta de login (Firebase Auth) de outro usuário. Só admin; a function checa.
export const deleteUserLogin = async (email) => {
    try {
        const fn = httpsCallable(functions, "adminDeleteUser");
        await fn({ email });

        return { error: false };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            message: error?.message || "Não foi possível excluir o login.",
        };
    }
};

export const deleteUser = async (userId) => {
    return UsersRepository.deleteUser(userId);
};

export const saveUserFeedback = async (feedBack, userName) => {
    return UsersRepository.saveUserFeedback(feedBack, userName);
};
