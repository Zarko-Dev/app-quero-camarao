import Toast from "react-native-toast-message";
import * as Sentry from "@sentry/react-native";
import {
    getAuth,
    httpsCallable,
    signInWithCustomToken,
    signInWithEmailAndPassword,
    signOut,
} from "../../services/FirebaseAdapter";
import { ensureFirebaseReady } from "../../services/Firebase";
import { SetUserStorage } from "../../services/Storage/UserStorage";
import { reportDiscordError } from "../../services/DiscordAlerts/context";

const callRegisterFunction = async (dataUser) => {
    const { functions, firebaseApp } = await ensureFirebaseReady();
    const auth = getAuth(firebaseApp);
    // Sessão de outra conta (ex.: após Sair) faria o servidor recusar o cadastro.
    // Sessão por custom token pode vir sem e-mail: também é tratada como de outra conta.
    const currentEmail = auth.currentUser?.email?.toLowerCase();
    if (__DEV__) console.log("[Register] session", auth.currentUser?.uid, currentEmail);
    if (auth.currentUser && currentEmail !== dataUser.email) {
        await signOut(auth);
    }
    return httpsCallable(functions, "registerUser")(dataUser);
};

const saveRegisteredUser = async (dataUser) => {
    const storageUser = { ...dataUser };
    delete storageUser.password;
    await SetUserStorage({ ...storageUser, activeBiometric: false, lastAccess: new Date() });
    return true;
};

const isEmailAlreadyRegistered = (error) =>
    error?.code === "functions/already-exists"
    || error?.code === "already-exists";

export const RegisterUser = async (dataUser) => {
    try {
        const result = await callRegisterFunction(dataUser);
        if (result.data?.customToken) {
            const { firebaseApp } = await ensureFirebaseReady();
            await signInWithCustomToken(getAuth(firebaseApp), result.data.customToken);
        }
        if (result.data?.ok && !result.data.customToken && dataUser.password) {
            const { firebaseApp } = await ensureFirebaseReady();
            const auth = getAuth(firebaseApp);
            await signInWithEmailAndPassword(auth, dataUser.email, dataUser.password);
        }
        if (result.data?.ok) return saveRegisteredUser(dataUser);
    } catch (error) {
        if (__DEV__) console.error("[Register] failed:", error?.code, error?.message);
        if (isEmailAlreadyRegistered(error)) {
            try {
                const { firebaseApp } = await ensureFirebaseReady();
                const auth = getAuth(firebaseApp);
                await signInWithEmailAndPassword(auth, dataUser.email, dataUser.password);
                const recoveryResult = await callRegisterFunction({
                    ...dataUser,
                    password: undefined,
                });
                if (recoveryResult.data?.ok) return saveRegisteredUser(dataUser);
            } catch (recoveryError) {
                Sentry.captureException(recoveryError);
                reportDiscordError({
                    source: "user.register.recovery",
                    feature: "registration",
                    action: "orphan-recovery-failed",
                    error: recoveryError,
                    user: dataUser,
                    extra: { callable: "registerUser", sensitiveData: "omitted" },
                }).catch(() => {});
            }
        }

        Sentry.captureException(error);
        reportDiscordError({
            source: "user.register.client",
            feature: "registration",
            action: "callable-failed",
            error,
            user: dataUser,
            extra: { userType: dataUser.userType, callable: "registerUser", sensitiveData: "omitted" },
        }).catch(() => {});
    }

    Toast.show({
        type: "error",
        text1: "Não foi possível concluir o cadastro.",
        text2: "O problema foi registrado e será analisado.",
    });
    return false;
};
