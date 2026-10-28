import * as NotificationsRepository from "../../repositories/NotificationsRepository";

export const updateNotification = async (notificationId, tokens) => {
    return NotificationsRepository.updateNotification(notificationId, tokens);
};