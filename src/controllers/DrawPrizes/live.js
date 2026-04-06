import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const createDrawPrizeLiveByCode = async (
    drawPrizeId,
    drawPrizeCode,
    drawPrizeName,
) => {
    try {
        const drawPrizeLiveDoc = doc(
            firestore,
            models.drawPrizesLive,
            drawPrizeId,
        );

        const response = await getDoc(drawPrizeLiveDoc);

        const existingData = response.exists() ? response.data() : {};

        const existingNames = existingData.names ?? [];

        await setDoc(
            drawPrizeLiveDoc,
            {
                id: drawPrizeId,
                code: drawPrizeCode,

                // 🔥 agora vira ARRAY
                names: [],

                status: true,
                participants: existingData.participants ?? [],
                winners: existingData.winners ?? [],

                createdAt: existingData.createdAt ?? new Date(),
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);
        return true;
    }
};

export const CloseDrawPrizeLiveById = async (drawPrizeId) => {
    try {
        const drawPrizeLiveDoc = doc(
            firestore,
            models.drawPrizesLive,
            drawPrizeId,
        );

        await setDoc(
            drawPrizeLiveDoc,
            {
                status: false,
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return true;
    }
};

export const getActiveDrawPrizeLive = async () => {
    try {
        const drawPrizeLiveRef = collection(firestore, models.drawPrizesLive);
        const queryConfig = query(
            drawPrizeLiveRef,
            where("status", "==", true),
        );

        const querySnapshot = await getDocs(queryConfig);

        if (!querySnapshot.empty) {
            const firstDoc = querySnapshot.docs[0];
            return {
                error: false,
                data: firstDoc.data(),
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

export const findDrawPrizeLiveByCode = async (drawPrizeCode, participant) => {
    try {
        const drawPrizeLiveRef = collection(firestore, models.drawPrizesLive);
        const queryConfig = query(
            drawPrizeLiveRef,
            where("code", "==", drawPrizeCode),
            where("status", "==", true),
        );

        const querySnapshot = await getDocs(queryConfig);

        if (!querySnapshot.empty) {
            const filteredDocs = querySnapshot.docs.filter((dataDoc) => {
                const data = dataDoc.data();
                return !data.participants?.includes(participant);
            });

            if (filteredDocs.length > 0) {
                return {
                    error: false,
                    data: filteredDocs[0].data(),
                };
            }
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

export const getDrawPrizeLiveById = async (drawPrizeId) => {
    try {
        const drawPrizeLiveDoc = doc(
            firestore,
            models.drawPrizesLive,
            drawPrizeId,
        );

        const drawPrizeLiveDocSnapshot = await getDoc(drawPrizeLiveDoc);

        if (drawPrizeLiveDocSnapshot.exists()) {
            const data = drawPrizeLiveDocSnapshot.data();
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

export const setParticipantDrawPrizeLive = async (drawPrizeId, participant) => {
    try {
        const response = await getDrawPrizeLiveById(drawPrizeId);

        if (response.error) {
            return {
                error: true,
            };
        }

        const drawPrizeLiveDoc = doc(
            firestore,
            models.drawPrizesLive,
            drawPrizeId,
        );

        await setDoc(
            drawPrizeLiveDoc,
            {
                participants: !response.data?.participants
                    ? [participant]
                    : [...response.data.participants, participant],
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return true;
    }
};

export const getAllDrawPrizesLiveWhereParticipant = async (
    participant,
    returnAllDrawPrizesLive,
) => {
    try {
        const drawPrizeLiveRef = collection(firestore, models.drawPrizesLive);
        let queryConfig;

        if (returnAllDrawPrizesLive) {
            queryConfig = query(drawPrizeLiveRef);
        } else {
            queryConfig = query(
                drawPrizeLiveRef,
                where("participants", "array-contains", participant),
            );
        }

        const querySnapshot = await getDocs(queryConfig);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs
                .map((dataDoc) => dataDoc.data())
                .filter(item => item.status === true)  // ← filtra só ativos

            if (data.length === 0) {
                return { error: true, data: [] };
            }

            return { error: false, data };
        }

        return {
            error: true,
            data: [],
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};

// Criada para atualizar o array names no Firestore quando executar um novo sorteio.
export const updateDrawPrizeLiveNames = async (drawPrizeId, prizeName) => {
    try {
        const drawPrizeLiveDoc = doc(firestore, models.drawPrizesLive, drawPrizeId);
        const snapshot = await getDoc(drawPrizeLiveDoc);
        const existingNames = snapshot.data()?.names ?? [];

        await setDoc(
            drawPrizeLiveDoc,
            { names: [...existingNames, prizeName] },
            { merge: true }
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const setWinnerDrawPrizeLive = async (drawPrizeId, winners) => {
    try {
        const response = await getDrawPrizeLiveById(drawPrizeId);

        if (response.error) {
            return {
                error: true,
            };
        }

        const drawPrizeLiveDoc = doc(
            firestore,
            models.drawPrizesLive,
            drawPrizeId,
        );

        await setDoc(
            drawPrizeLiveDoc,
            {
                winners,
                updatedAt: new Date(),
            },
            {
                merge: true,
            },
        );

        return true;
    } catch (error) {
        console.log(error);

        Sentry.captureException(error);

        return true;
    }
};

export const deleteDrawPrizeLiveById = async (drawPrizeLiveId) => {
    try {
        const drawPrizeLiveDoc = doc(
            firestore,
            models.drawPrizesLive,
            drawPrizeLiveId,
        );

        await deleteDoc(drawPrizeLiveDoc);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};
