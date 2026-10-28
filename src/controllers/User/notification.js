import * as UsersRepository from "../../repositories/UsersRepository";

export const updateUserNotification = async (user, platform, token) => {
    return UsersRepository.updateUserNotification(user, platform, token);
};

export const getAllUserTokenNotification = async () => {
    try {
        const { collection, getDocs, query } = await import("../../services/FirebaseAdapter");
        const { firestore } = await import("../../services/Firebase");
        const { models } = await import("../../services/Firebase/models");

        const userRef = collection(firestore, models.users);
        const queryConfig = query(userRef);

        const querySnapshot = await getDocs(queryConfig);
        const dataNotificationToken = [];

        querySnapshot.forEach((document) => {
            const dataUser = document.data();

            if (dataUser?.notification) {
                dataNotificationToken.push({
                    id: document.id,
                    user: document.data().name,
                    notification: document.data().notification,
                    userType: document.data().userType,
                });
            }
        });

        if (dataNotificationToken.length > 0) {
            return {
                error: false,
                data: dataNotificationToken,
            };
        }

        return {
            error: true,
            data: dataNotificationToken,
        };
    } catch (error) {
        return {
            error: true,
            data: [],
        };
    }
};

export const getUserNotificationToken = async (userId) => {
    try {
        const { doc, getDoc } = await import("../../services/FirebaseAdapter");
        const { firestore } = await import("../../services/Firebase");
        const { models } = await import("../../services/Firebase/models");

        const usersRef = doc(firestore, models.users, userId);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            const dataUser = docSnap.data();

            if (dataUser?.notification?.token) {
                return {
                    error: false,
                    data: dataUser.notification.token,
                };
            }

            return {
                error: false,
                data: "",
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