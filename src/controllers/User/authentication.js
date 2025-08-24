import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import Toast from "react-native-toast-message";

import { firebaseApp, firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { SetUserStorage } from "../../services/Storage/UserStorage";

const VerifyAuthentication = async (user, password) => {
    const auth = getAuth(firebaseApp);

    try {
        await signInWithEmailAndPassword(auth, user, password);

        return true;
    } catch (error) {
        return false;
    }
};

export const getDataUser = async (email) => {
    try {
        const usersRef = doc(firestore, models.users, email);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }

        return false;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const UserAuthentication = async (email, password) => {
    if (await VerifyAuthentication(email, password)) {
        const dataUser = await getDataUser(email);

        if (dataUser) {
            await SetUserStorage({
                ...dataUser,
                activeBiometric: false,
                lastAccess: new Date(),
            });

            return true;
        }

        Toast.show({
            type: "error",
            text1: "❌ Dados não encontrados!",
            text2: "Tente novamente mais tarde!",
        });

        return false;
    }

    Toast.show({
        type: "error",
        text1: "❌ Acesso Negado!",
        text2: "E-mail ou senha incorreta!",
    });

    return false;
};

export const getDataUserByIds = async (ids) => {
    const users = await Promise.all(
        ids.map(async (id) => {
            const user = await getDataUser(id);
            return user || null;
        }),
    );

    return users.filter((user) => user !== null);
};
