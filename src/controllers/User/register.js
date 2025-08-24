import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import * as Sentry from "@sentry/react-native";

import { firebaseApp, firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { SetUserStorage } from "../../services/Storage/UserStorage";

const VerifyIfEmailExists = async (email) => {
    try {
        const usersRef = doc(firestore, models.users, email);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            return true;
        }

        return false;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

const CreateLoginUser = async (user, password) => {
    const auth = getAuth(firebaseApp);

    try {
        await createUserWithEmailAndPassword(auth, user, password);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

const CreateDataUser = async (dataUser) => {
    try {
        const userDoc = doc(firestore, models.users, dataUser.email);

        delete dataUser.password;

        if (dataUser.userType === "productor") {
            await setDoc(userDoc, {
                ...dataUser,
                address: {
                    state: dataUser.state,
                    city: dataUser.city,
                },
                userImage: "",
                rules: ["Normal"],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else {
            await setDoc(userDoc, {
                ...dataUser,
                userImage: "",
                rules: ["Normal"],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const RegisterUser = async (dataUser) => {
    if (await VerifyIfEmailExists(dataUser.email)) {
        Toast.show({
            type: "error",
            text1: "Email já cadastrado!",
        });

        return false;
    }

    if (await CreateLoginUser(dataUser.email, dataUser.password)) {
        if (await CreateDataUser(dataUser)) {
            await SetUserStorage({
                ...dataUser,
                activeBiometric: false,
                lastAccess: new Date(),
            });

            return true;
        }
    }

    Toast.show({
        type: "error",
        text1: "Algo de errado ocorreu!",
        text2: "Tente novamente mais tarde!",
    });

    return false;
};
