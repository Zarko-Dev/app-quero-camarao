import * as NotificationsRepository from "../../repositories/NotificationsRepository";

export const saveNotification = async (tokens, notification) => {
    return NotificationsRepository.saveNotification(tokens, notification);
};