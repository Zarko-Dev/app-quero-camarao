import { saveShrimpPonds as saveShrimpPondsRepo } from "../../repositories/PublicationsRepository";
import { sendNotificationNewPublication } from "../Notifications/sendNotificationNewPublication";

export const saveShrimpPonds = async (dataPonds, userId) => {
    const result = await saveShrimpPondsRepo(dataPonds, userId);
    if (result) {
        await sendNotificationNewPublication({
            publisherId: userId,
            publicationId: dataPonds.id,
            location: dataPonds.location,
            shrimps: dataPonds.shrimps,
        });
    }
    return result;
};
