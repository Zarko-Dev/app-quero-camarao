import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from "firebase/storage";
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import Toast from "react-native-toast-message";
import * as Sentry from "@sentry/react-native";

import { firestore, storage } from "../../services/Firebase";
import { models, storageModels } from "../../services/Firebase/models";
import { uriToBlob } from "../../utils/uriToBlob";

const saveUserImage = async (userId, userImage) => {
    const userDoc = doc(firestore, models.users, userId);

    try {
        await setDoc(
            userDoc,
            { userImage, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Algo de errado aconteceu durante a atualização!",
            text2: "Tente novamente mais tarde!",
        });

        return false;
    }
};

const findIfExistUserImage = async (email) => {
    try {
        const usersRef = collection(firestore, models.users);
        const queryConfig = query(
            usersRef,
            where("email", "==", email),
            where("userImage", "!=", ""),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataUser = [];

        querySnapshot.forEach((document) => {
            dataUser.push(document.data());
        });

        if (dataUser.length > 0) {
            return {
                error: false,
                data: dataUser,
            };
        }

        return {
            error: true,
            data: null,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};

const deleteUserImage = async (dataImage) => {
    const deleteRef = ref(
        storage,
        `${storageModels.user}/${
            dataImage.userImage.split("user%2F")[1].split("?")[0]
        }`,
    );

    try {
        await deleteObject(deleteRef);
    } catch (error) {
        Sentry.captureException(error);
    }
};

export const saveImage = async (email, imageUri) => {
    if (imageUri) {
        try {
            const dataImage = await findIfExistUserImage(email);

            if (!dataImage.error) {
                await deleteUserImage(dataImage.data[0]);
            }

            const blobFile = await uriToBlob(imageUri);

            const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            const newFilename = `${new Date().getTime()}-${filename}`;

            const storageRef = ref(
                storage,
                `${storageModels.user}/${newFilename}`,
            );

            await uploadBytes(storageRef, blobFile);

            const urlImage = await getDownloadURL(storageRef);

            const resultSave = await saveUserImage(email, urlImage);

            if (resultSave) {
                return {
                    error: false,
                };
            }

            return {
                error: true,
            };
        } catch (error) {
            Sentry.captureException(error);

            return {
                error: true,
            };
        }
    }

    return {
        error: true,
    };
};
