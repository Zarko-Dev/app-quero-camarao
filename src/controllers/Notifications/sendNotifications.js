import { sendNotification } from "../../services/ExpoNotification/sendNotification";
import { getAllUserTokenNotification } from "../User/notification";
import { saveNotification } from "./saveNotification";

const ExecuteSendNotification = async (dataToken, title, body) => {
    await sendNotification(dataToken, title, body);

    saveNotification(dataToken, { title, body });
};

export const SendNotifications = (
    notificationsTokens,
    title,
    body,
    actionSucess = () => {},
) => {
    let start = 0;
    let end = 100 - 1;

    const processNextStep = () => {
        if (start < notificationsTokens.length) {
            const slicedArray = notificationsTokens.slice(
                start,
                Math.min(end, notificationsTokens.length - 1) + 1,
            );

            ExecuteSendNotification(slicedArray, title, body);

            start = end + 1;
            end = start + 100 - 1;

            setTimeout(processNextStep, 3000);
        } else {
            actionSucess();
        }
    };

    processNextStep();
};

export const sendNotificationAllUsers = async (title = "", body = "") => {
    const resultDataTokens = await getAllUserTokenNotification();

    if (!resultDataTokens.error) {
        const notificationTokens = resultDataTokens.data.map(
            (item) => item.notification.token,
        );

        SendNotifications(notificationTokens, title, body);
    }
};
