import * as DrawPrizesRepository from "../../repositories/DrawPrizesRepository";

export const saveDrawPrizeRules = async (dataRules) => {
    return DrawPrizesRepository.saveDrawPrizeRules(dataRules);
};

export const getDrawPrizeRules = async () => {
    try {
        const { collection, getDocs, query } = await import("../../services/FirebaseAdapter");
        const { firestore } = await import("../../services/Firebase");
        const { models } = await import("../../services/Firebase/models");

        const drawPrizeRef = collection(firestore, models.drawPrizesRules);
        const drawPrizeQuery = query(drawPrizeRef);

        const querySnapshot = await getDocs(drawPrizeQuery);

        const datDrawPrizes = [];

        querySnapshot.forEach((document) => {
            datDrawPrizes.push({
                id: document.id,
                ...document.data(),
            });
        });

        return datDrawPrizes;
    } catch (error) {
        return [];
    }
};

export const getNewDrawPrizeRules = async () => {
    try {
        const { collection, getDocs, query } = await import("../../services/FirebaseAdapter");
        const { firestore } = await import("../../services/Firebase");
        const { models } = await import("../../services/Firebase/models");

        const drawPrizeRef = collection(firestore, models.newDrawPrizeRules);
        const drawPrizeQuery = query(drawPrizeRef);

        const querySnapshot = await getDocs(drawPrizeQuery);

        const data = [];

        querySnapshot.forEach((document) => {
            data.push({
                firestoreId: document.id,
                ...document.data(),
            });
        });

        return data;
    } catch (error) {
        return [];
    }
};

export const saveSpecifcDrawPrizeRules = async (dataSpecifcRules) => {
    return DrawPrizesRepository.saveSpecifcDrawPrizeRules(dataSpecifcRules);
};

export const saveUsersDrawPrizeRules = async (ruleData) => {
    return DrawPrizesRepository.saveUsersDrawPrizeRules(ruleData);
};

export const blockWinners = async (ruleId, updatedCpfs) => {
    return DrawPrizesRepository.blockWinners(ruleId, updatedCpfs);
};

export const deleteDrawPrizeRule = async (firestoreId) => {
    return DrawPrizesRepository.deleteDrawPrizeRule(firestoreId);
};