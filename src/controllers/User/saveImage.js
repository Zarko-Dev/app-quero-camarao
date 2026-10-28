import * as UsersRepository from "../../repositories/UsersRepository";
import { storage } from "../../services/StorageRN";
import { resizeImage } from "../../utils/uriToBlob";

const findIfExistUserImage = async (email) => {
    try {
        const { collection, getDocs, query, where } = await import("../../services/FirebaseAdapter");
        const { firestore } = await import("../../services/Firebase");
        const { models } = await import("../../services/Firebase/models");

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
        return {
            error: true,
            data: null,
        };
    }
};

const deleteUserImage = async (dataImage) => {
    const { storageModels } = await import("../../services/Firebase/models");

    const deleteRef = storage().ref(
        `${storageModels.user}/${
            dataImage.userImage.split("user%2F")[1].split("?")[0]
        }`,
    );

    try {
        await deleteRef.delete();
    } catch (error) {
        return false;
    }
};

export const saveImage = async (email, imageUri) => {
    if (imageUri) {
        try {
            const dataImage = await findIfExistUserImage(email);

            if (!dataImage.error) {
                await deleteUserImage(dataImage.data[0]);
            }

            const resizedUri = await resizeImage(imageUri);

            const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            const newFilename = `${new Date().getTime()}-${filename}`;

            const { storageModels } = await import("../../services/Firebase/models");

            const newStorageRef = storage().ref(
                `${storageModels.user}/${newFilename}`,
            );

            await newStorageRef.putFile(resizedUri || imageUri);

            const urlImage = await newStorageRef.getDownloadURL();

            const resultSave = await UsersRepository.saveUserImage(email, urlImage);

            if (resultSave) {
                return {
                    error: false,
                };
            }

            return {
                error: true,
            };
        } catch (error) {
            return {
                error: true,
            };
        }
    }

    return {
        error: true,
    };
};