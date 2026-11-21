import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as SystemUI from "expo-system-ui";

const shouldRequestStartupPermissions = !__DEV__;

export const requestStartupPermissions = async () => {
    if (Platform.OS === "android") {
        await SystemUI.setBackgroundColorAsync("#F05829");
        await Notifications.setNotificationChannelAsync("notifications-app", {
            name: "Notificações",
            importance: Notifications.AndroidImportance.HIGH,
            sound: "default",
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#F05829",
        });
    }

    if (!shouldRequestStartupPermissions) {
        return;
    }

    if (Platform.OS === "ios") {
        await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
            },
        });
    } else {
        await Notifications.requestPermissionsAsync({
            android: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
            },
        });
    }
};
