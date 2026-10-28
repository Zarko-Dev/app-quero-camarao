import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import * as SystemUI from "expo-system-ui";
import Toast from "react-native-toast-message";

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
        const { status } = await requestTrackingPermissionsAsync();

        if (status !== "granted") {
            Toast.show({
                type: "error",
                text1: "Permissão de rasterio de dados é necessário!",
                text2: "Precisamos de acesso ao seu email e informações de pagamento somente dentro do aplicativo!",
            });
        }

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
