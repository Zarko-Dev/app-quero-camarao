import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import * as DrawPrizesRepository from "../../repositories/DrawPrizesRepository";

export const createDrawPrizeLiveByCode = async (
    drawPrizeId,
    drawPrizeCode,
    drawPrizeName,
    drawPrizeTheme,
) => {
    return DrawPrizesRepository.createDrawPrizeLiveByCode(
        drawPrizeId,
        drawPrizeCode,
        drawPrizeName,
        drawPrizeTheme,
    );
};

export const getAllActiveDrawPrizesLive = async () => {
    try {
        const drawPrizeLiveRef = collection(firestore, models.drawPrizesLive);
        const queryConfig = query(
            drawPrizeLiveRef,
            where("status", "==", true),
        );

        const querySnapshot = await getDocs(queryConfig);

        const data = querySnapshot.docs.map((dataDoc) => ({
            id: dataDoc.id,
            ...dataDoc.data(),
        }));

        return {
            error: false,
            data,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};

export const updateDrawPrizeCode = async (drawPrizeId, drawPrizeCode) => {
    return DrawPrizesRepository.updateDrawPrizeCode(drawPrizeId, drawPrizeCode);
};

export const updateDrawPrizeName = async (drawPrizeId, drawPrizeName) => {
    return DrawPrizesRepository.updateDrawPrizeName(drawPrizeId, drawPrizeName);
};

export const CloseDrawPrizeLiveById = async (drawPrizeId) => {
    return DrawPrizesRepository.CloseDrawPrizeLiveById(drawPrizeId);
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
                data: { id: firstDoc.id, ...firstDoc.data() },
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
            const docs = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            const { filterNotYetParticipating } = await import("./helpers");
            const filtered = filterNotYetParticipating(docs, participant);
            if (filtered.length > 0) {
                return { error: false, data: filtered[0] };
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
                data: { id: drawPrizeLiveDocSnapshot.id, ...data },
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
    return DrawPrizesRepository.setParticipantDrawPrizeLive(
        drawPrizeId,
        participant,
    );
};

export const seedParticipantsDrawPrizeLive = async (drawPrizeId, participantIds) => {
    return DrawPrizesRepository.seedParticipantsDrawPrizeLive(
        drawPrizeId,
        participantIds,
    );
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
            const { filterActiveOnly } = await import("./helpers");
            const data = filterActiveOnly(
                querySnapshot.docs.map((dataDoc) => ({ id: dataDoc.id, ...dataDoc.data() })),
            );

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

export const updateDrawPrizeLiveNames = async (drawPrizeId, prizeName) => {
    return DrawPrizesRepository.updateDrawPrizeLiveNames(drawPrizeId, prizeName);
};

export const saveIndicatedParticipants = async (drawPrizeId, participantIds) => {
    return DrawPrizesRepository.saveIndicatedParticipants(
        drawPrizeId,
        participantIds,
    );
};

export const setWinnerDrawPrizeLive = async (drawPrizeId, winners) => {
    return DrawPrizesRepository.setWinnerDrawPrizeLive(drawPrizeId, winners);
};

export const getUsersByCpfList = async (cpfList) => {
    try {
        if (!cpfList || cpfList.length === 0) {
            return { error: false, data: [] };
        }

        const usersRef = collection(firestore, models.users);
        const queryConfig = query(usersRef, where("cpf", "in", cpfList));

        const querySnapshot = await getDocs(queryConfig);

        const data = querySnapshot.docs.map((dataDoc) => dataDoc.data());

        return { error: false, data };
    } catch (error) {
        Sentry.captureException(error);

        return { error: true, data: [] };
    }
};

export const deleteDrawPrizeLiveById = async (drawPrizeLiveId) => {
    return DrawPrizesRepository.deleteDrawPrizeLiveById(drawPrizeLiveId);
};