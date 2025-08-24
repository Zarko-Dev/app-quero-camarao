import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../../services/Firebase";
import { getDataUser } from "./authentication";

export const UpdateUserToProductor = async (userId, dataUpdate) => {
    const userDoc = doc(firestore, "users", userId);

    try {
        await setDoc(
            userDoc,
            { ...dataUpdate, updatedAt: new Date() },
            { merge: true },
        );

        const dataUser = await getDataUser(userId);

        return {
            error: false,
            message: "",
            dataUser,
        };
    } catch (error) {
        return {
            error: true,
            message:
                "Algo de errado aconteceu durante a atualização, tente novamente mais tarde!",
            dataUser: null,
        };
    }
};
