import * as DrawPrizesRepository from "../../repositories/DrawPrizesRepository";

export const deleteDrawPrize = async (drawPrizeId) => {
    return DrawPrizesRepository.deleteDrawPrize(drawPrizeId);
};

export const deleteDrawPrizes = async (drawPrizeIds = []) => {
    return DrawPrizesRepository.deleteDrawPrizes(drawPrizeIds);
};