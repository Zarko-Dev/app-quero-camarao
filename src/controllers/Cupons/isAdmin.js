import { doc, getDoc } from "../../services/FirebaseAdapter";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { isAdminRole } from "./roles";

export const isAdmin = async (email) => {
    if (!email) return false;

    try {
        const userDocRef = doc(firestore, models.users, email);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return false;
        }

        // eslint-disable-next-line no-console
        console.log("[isAdmin] rules=", JSON.stringify(userDoc.data().rules));
        return isAdminRole(userDoc.data().rules);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[isAdmin]", error?.code, error?.message);
        return false;
    }
};
