import { notificationExecuteActions } from "./actions";

const INITIAL_STATE = {
    notificationExecuted: false,
    notificationsError: false,
    notifications: [],
    notificationCount: 0,
    originalDataNotifications: [],
};

export const NotificationExecuteReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case notificationExecuteActions.NOTIFICATION_EXECUTE_ACTION:
            return {
                ...state,
                notificationExecuted: true,
                notificationsError: action.notificationsError,
                notifications: action.notifications,
                notificationCount: action.notificationCount,
                originalDataNotifications: action.originalDataNotifications,
            };

        case notificationExecuteActions.NOTIFICATION_ERROR_ACTION:
            return {
                ...state,
                notificationsError: action.notificationsError,
            };

        case notificationExecuteActions.NOTIFICATION_UPDATE_ACTION:
            return {
                ...state,
                notifications: action.notifications,
                notificationCount: action.notificationCount,
            };

        default:
            return { ...state };
    }
};
