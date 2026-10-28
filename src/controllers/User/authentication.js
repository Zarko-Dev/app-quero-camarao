import * as Sentry from "@sentry/react-native";

import Toast from "react-native-toast-message";
import {
    doc,
    getDoc,
    getAuth,
    signInWithEmailAndPassword,
} from "../../services/FirebaseAdapter";

import { ensureFirebaseReady } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { SetUserStorage } from "../../services/Storage/UserStorage";

// Credenciais erradas são esperadas: só mostram o toast amigável, sem LogBox/Sentry.
const CREDENTIAL_ERRORS = [
    "auth/user-not-found",
    "auth/wrong-password",
    "auth/invalid-credential",
    "auth/invalid-email",
];

const VerifyAuthentication = async (user, password) => {
    try {
        const { firebaseApp } = await ensureFirebaseReady();
        const authInstance = getAuth(firebaseApp);
        await signInWithEmailAndPassword(authInstance, user, password);

        return true;
    } catch (error) {
        if (__DEV__) console.log("[Auth] sign-in failed:", error?.code);
        if (!CREDENTIAL_ERRORS.includes(error?.code)) Sentry.captureException(error);
        return false;
    }
};

export const getDataUser = async (email) => {
    try {
        const { firestore } = await ensureFirebaseReady();
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

export const UserAuthentication = async (rawEmail, password) => {
    const email = String(rawEmail ?? "").trim().toLowerCase();
    if (await VerifyAuthentication(email, password)) {
        const dataUser = await getDataUser(email);

        if (dataUser) {
            await SetUserStorage({
                ...dataUser,
                // A identidade da sessão vem do Auth, não do campo "email" do
                // doc: ele pode estar divergente do ID do documento (dado
                // corrompido) e as regras do Firestore comparam o userId
                // gravado com request.auth.token.email - divergência bloqueia
                // ordens, vendas e outras escritas de ownership.
                email,
                activeBiometric: false,
                lastAccess: new Date(),
            });

            return true;
        }

        Toast.show({
            type: "error",
            text1: "Dados não encontrados!",
            text2: "Tente novamente mais tarde!",
        });

        return false;
    }

    Toast.show({
        type: "error",
        text1: "Acesso negado!",
        text2: "E-mail ou senha incorretos.",
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
