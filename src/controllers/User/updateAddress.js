import { doc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { firestore } from "../../services/Firebase";

export const UpdateUserAddress = async (userId, dataUpdate) => {
    const userDoc = doc(firestore, "users", userId);

    try {
        await setDoc(
            userDoc,
            { address: { ...dataUpdate }, updatedAt: new Date() },
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
