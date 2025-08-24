import { doc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const updateNotification = async (notificationId, tokens) => {
    const notificationDoc = doc(
        firestore,
        models.notifications,
        notificationId,
    );

    try {
        await setDoc(notificationDoc, { tokens }, { merge: true });

        return true;
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Não foi possível realizar a atualização!",
            text2: "Tente novamente mais tarde!",
        });

        return false;
    }
};
