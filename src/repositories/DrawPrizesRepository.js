import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    setDoc,
    updateDoc,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { docRef, getCollection } from "./base";

export const saveDrawPrize = async (
    drawPrizeName,
    dataDrawPrize,
    drawerPrizeLiveId,
) => {
    try {
        const drawPrizesRef = getCollection(models.drawPrizesHistory);

        await addDoc(drawPrizesRef, {
            drawPrizeName,
            usersWinner: dataDrawPrize,
            drawerPrizeLiveId: drawerPrizeLiveId ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        return false;
    }
};

export const deleteDrawPrize = async (drawPrizeId) => {
    try {
        const drawPrizeRef = docRef(models.drawPrizesHistory, drawPrizeId);
        await setDoc(
            drawPrizeRef,
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
            { merge: true },
        );
        return true;
    } catch (error) {
        return false;
    }
};

export const deleteDrawPrizes = async (drawPrizeIds = []) => {
    try {
        const updates = drawPrizeIds.map(async (drawPrizeId) => {
            const drawPrizeRef = docRef(models.drawPrizesHistory, drawPrizeId);

            await setDoc(
                drawPrizeRef,
                {
                    isDeleted: true,
                    deletedAt: new Date(),
                    updatedAt: new Date(),
                },
                { merge: true },
            );
        });

        await Promise.all(updates);

        return true;
    } catch (error) {
        return false;
    }
};

export const createDrawPrizeLiveByCode = async (
    drawPrizeId,
    drawPrizeCode,
    drawPrizeName,
    drawPrizeTheme,
) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);

        const { getDoc } = await import("../services/FirebaseAdapter");
        const response = await getDoc(drawPrizeLiveRef);
        const existingData = response.exists() ? response.data() : {};

        await setDoc(
            drawPrizeLiveRef,
            {
                id: drawPrizeId,
                code: drawPrizeCode,
                name: drawPrizeName ?? existingData.name ?? "",
                theme: drawPrizeTheme ?? existingData.theme ?? "",
                names: existingData.names ?? [],
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
        return false;
    }
};

export const updateDrawPrizeCode = async (drawPrizeId, drawPrizeCode) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);

        await setDoc(
            drawPrizeLiveRef,
            {
                code: drawPrizeCode,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateDrawPrizeName = async (drawPrizeId, drawPrizeName) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);

        await setDoc(
            drawPrizeLiveRef,
            {
                name: drawPrizeName,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const CloseDrawPrizeLiveById = async (drawPrizeId) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);

        await setDoc(
            drawPrizeLiveRef,
            {
                status: false,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const setParticipantDrawPrizeLive = async (drawPrizeId, participant) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);
        const { getDoc } = await import("../services/FirebaseAdapter");
        const response = await getDoc(drawPrizeLiveRef);
        const existingData = response.exists() ? response.data() : {};
        const existing = existingData?.participants ?? [];
        const merged = Array.from(new Set([...existing, participant]));
        await setDoc(
            drawPrizeLiveRef,
            { participants: merged, updatedAt: new Date() },
            { merge: true },
        );
        return true;
    } catch (error) {
        return false;
    }
};

export const seedParticipantsDrawPrizeLive = async (drawPrizeId, participantIds) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);
        const { getDoc } = await import("../services/FirebaseAdapter");

        const response = await getDoc(drawPrizeLiveRef);
        const existingData = response.exists() ? response.data() : {};
        const existing = existingData?.participants ?? [];
        const merged = Array.from(new Set([...existing, ...participantIds]));

        await setDoc(
            drawPrizeLiveRef,
            { participants: merged, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateDrawPrizeLiveNames = async (drawPrizeId, prizeName) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);
        const { getDoc } = await import("../services/FirebaseAdapter");

        const snapshot = await getDoc(drawPrizeLiveRef);
        const existingNames = snapshot.exists() ? snapshot.data()?.names ?? [] : [];

        await setDoc(
            drawPrizeLiveRef,
            { names: [...existingNames, prizeName] },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const saveIndicatedParticipants = async (drawPrizeId, participantIds) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);

        await setDoc(
            drawPrizeLiveRef,
            { indicatedParticipants: participantIds, updatedAt: new Date() },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const setWinnerDrawPrizeLive = async (drawPrizeId, winners) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeId);

        await setDoc(
            drawPrizeLiveRef,
            {
                winners,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const deleteDrawPrizeLiveById = async (drawPrizeLiveId) => {
    try {
        const drawPrizeLiveRef = docRef(models.drawPrizesLive, drawPrizeLiveId);

        await deleteDoc(drawPrizeLiveRef);

        return true;
    } catch (error) {
        return false;
    }
};

export const saveDrawPrizeRules = async (dataRules) => {
    try {
        const rulesRef = docRef(models.drawPrizesRules, "lR0dLwDArzxmD4Fp9wMK");

        await setDoc(
            rulesRef,
            {
                rules: dataRules,
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const saveSpecifcDrawPrizeRules = async (dataSpecifcRules) => {
    try {
        const rulesRef = docRef(models.drawPrizesRules, "lR0dLwDArzxmD4Fp9wMK");

        await setDoc(
            rulesRef,
            {
                specifcRules: dataSpecifcRules,
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const saveUsersDrawPrizeRules = async (ruleData) => {
    try {
        const rulesRef = getCollection(models.newDrawPrizeRules);

        await addDoc(rulesRef, {
            id: ruleData.id,
            store: ruleData.store,
            cities: ruleData.cities,
            cpfs: ruleData.cpfs,
        });

        return true;
    } catch (error) {
        return false;
    }
};

export const blockWinners = async (ruleId, updatedCpfs) => {
    try {
        const ruleRef = docRef(models.newDrawPrizeRules, ruleId);

        await updateDoc(ruleRef, { cpfs: updatedCpfs });

        return true;
    } catch (error) {
        return false;
    }
};

export const deleteDrawPrizeRule = async (firestoreId) => {
    try {
        const ruleRef = docRef(models.newDrawPrizeRules, firestoreId);

        await deleteDoc(ruleRef);

        return true;
    } catch (error) {
        return false;
    }
};
