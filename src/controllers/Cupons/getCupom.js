/* eslint-disable object-curly-newline */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

const moveDefaultToFirst = (arr) => {
    const index = arr.findIndex((item) => item.isDefault === true);

    if (index > 0) {
        const [defaultItem] = arr.splice(index, 1);
        arr.unshift(defaultItem);
    }

    return arr;
};

export const getAllCupons = async () => {
    try {
        const cuponsRef = collection(firestore, models.cupons);
        const cuponsQuery = query(cuponsRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(cuponsQuery);

        const dataCupons = [];

        querySnapshot.forEach((document) => {
            const data = document.data();

            if (data.durationValue?.seconds) {
                dataCupons.push({
                    ...data,
                    durationValue: convertSecondsToDate(
                        data.durationValue.seconds,
                    ),
                });
            } else {
                dataCupons.push(data);
            }
        });

        return moveDefaultToFirst(dataCupons);
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};

export const verifyIfCupomExists = async (cupomCode) => {
    try {
        const cupomRef = doc(firestore, models.cupons, cupomCode);
        const docSnap = await getDoc(cupomRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.durationValue?.seconds) {
                return {
                    error: false,
                    data: {
                        ...data,
                        durationValue: convertSecondsToDate(
                            data.durationValue.seconds,
                        ),
                    },
                };
            }

            return {
                error: false,
                data,
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
