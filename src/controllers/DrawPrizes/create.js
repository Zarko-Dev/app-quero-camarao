import * as DrawPrizesRepository from "../../repositories/DrawPrizesRepository";

export const saveDrawPrize = async (
    drawPrizeName,
    dataDrawPrize,
    drawerPrizeLiveId,
) => {
    return DrawPrizesRepository.saveDrawPrize(
        drawPrizeName,
        dataDrawPrize,
        drawerPrizeLiveId,
    );
};