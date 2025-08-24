import { doc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const setNewVisualizationPublication = async (
    publicationId,
    publicationViewsId,
    views,
    dataViews,
    dataUserView,
    dataPublication,
) => {
    try {
        const shrimpPondsDoc = doc(
            firestore,
            models.shrimpPonds,
            publicationId,
        );

        const logPublicationsViewsDoc = doc(
            firestore,
            models.logPublicationsViews,
            publicationViewsId,
        );

        await setDoc(
            shrimpPondsDoc,
            {
                views: views + 1,
                publicationViewsId,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        await setDoc(
            logPublicationsViewsDoc,
            {
                id: publicationViewsId,
                publicationId,
                location: dataPublication.location,
                shrimps: dataPublication.shrimps,
                userId: dataPublication.userId,
                views: [
                    ...dataViews,
                    {
                        ...dataUserView,
                        userImage:
                            dataUserView.userImage === undefined
                                ? ""
                                : dataUserView.userImage,
                    },
                ],
                createdAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
