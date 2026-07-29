import { useEffect } from "react";
import * as Notifications from "expo-notifications";

import { useUnreadChatsCount } from "../../hooks/useUnreadChatsCount";

export const BadgeSync = () => {
    const unreadCount = useUnreadChatsCount();

    useEffect(() => {
        Notifications.setBadgeCountAsync(unreadCount).catch(() => {});
    }, [unreadCount]);

    return null;
};
