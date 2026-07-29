import "react-native-gesture-handler";
import "./src/polyfills/cryptoRandom";

import { useEffect } from "react";
import { Platform } from "react-native";
import { pt, registerTranslation } from "react-native-paper-dates";
import { ThemeProvider } from "styled-components/native";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { Provider as ProviderRedux } from "react-redux";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import {
    Comfortaa_300Light,
    Comfortaa_400Regular,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
} from "@expo-google-fonts/comfortaa";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import * as Notifications from "expo-notifications";
import * as Sentry from "@sentry/react-native";
import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ignoreLogs } from "./src/utils/ignoreLogs";

import { theme } from "./src/styles/Theme";
import { store } from "./src/store";
import { Routes, navigationRef } from "./src/routes";
import { dataRoutes } from "./src/routes/dataRoutes";
import { getActiveChatId } from "./src/utils/activeChatTracker";
import { AlertNewVersion } from "./src/components/AlertNewVersion";
import { BadgeSync } from "./src/components/BadgeSync";
import { ContentStatusBar } from "./src/components/ContentStatusBar";
import { KeyboardSafeContent } from "./src/components/KeyboardSafeContent";
import { useInternetConnection } from "./src/utils/hooks/useInternetConnection";
import { useSystemUI } from "./src/utils/hooks/useSystemUI";
import { InternetInfo } from "./src/components/InternetInfo";

Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const chatId = notification.request?.content?.data?.chatId;
        const isActiveChat = Boolean(chatId) && chatId === getActiveChatId();

        return {
            shouldShowBanner: !isActiveChat,
            shouldShowList: !isActiveChat,
            shouldPlaySound: !isActiveChat,
            shouldSetBadge: !isActiveChat,
        };
    },
});

ignoreLogs();

Sentry.init({
    dsn: process.env.SENTRY_DNS,
    debug: !process.env.STATUS_PROJECT === "production",
    tracesSampleRate: process.env.STATUS_PROJECT === "production" ? 0.5 : 1.0,
    _experiments: {
        profilesSampleRate: 1.0,
    },
});

const paperTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: theme?.colors?.primary ?? MD3LightTheme.colors.primary,
        background: theme?.colors?.background ?? MD3LightTheme.colors.background,
        surface: theme?.colors?.white ?? MD3LightTheme.colors.surface,
        onSurface: theme?.colors?.text ?? MD3LightTheme.colors.onSurface,
        error: theme?.colors?.red ?? MD3LightTheme.colors.error,
    },
};

const shouldRequestStartupPermissions = !__DEV__;

const App = () => {
    registerTranslation("pt", pt);
    const isConnected = useInternetConnection();

    useSystemUI();

    useEffect(() => {
        (async () => {
            if (Platform.OS === "android") {
                await SystemUI.setBackgroundColorAsync("#F05829");
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
        })();
    }, []);

    useEffect(() => {
        let handledNotificationId = null;

        const navigateToChatFromNotificationData = (data, notificationId) => {
            if (!data || data.type !== "chat" || !data.publicationId) return;
            if (notificationId && notificationId === handledNotificationId) return;
            if (notificationId) handledNotificationId = notificationId;

            let attempts = 0;
            const tryNavigate = () => {
                if (navigationRef.isReady()) {
                    navigationRef.navigate(dataRoutes.publicationChat, {
                        publication: { id: data.publicationId },
                        sellerId: data.sellerId,
                        buyerId: data.buyerId,
                        sellerName: data.sellerName,
                        buyerName: data.buyerName,
                        chatId: data.chatId,
                    });
                    return;
                }
                attempts += 1;
                if (attempts < 10) {
                    setTimeout(tryNavigate, 300);
                } else {
                    Sentry.captureMessage("Chat notification navigation timed out waiting for navigationRef", {
                        extra: { chatId: data.chatId, publicationId: data.publicationId },
                    });
                }
            };
            tryNavigate();
        };

        Notifications.getLastNotificationResponseAsync().then((response) => {
            navigateToChatFromNotificationData(
                response?.notification?.request?.content?.data,
                response?.notification?.request?.identifier,
            );
            Notifications.clearLastNotificationResponseAsync();
        });

        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            navigateToChatFromNotificationData(
                response?.notification?.request?.content?.data,
                response?.notification?.request?.identifier,
            );
        });

        return () => subscription.remove();
    }, []);

    const [fontLoad] = useFonts({
        Comfortaa_300Light,
        Comfortaa_400Regular,
        Comfortaa_600SemiBold,
        Comfortaa_700Bold,
    });

    if (!fontLoad) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider theme={theme}>
                <PaperProvider theme={paperTheme}>
                    <ProviderRedux store={store}>
                        <ContentStatusBar />
                        <BadgeSync />
                        <KeyboardSafeContent>
                            {isConnected ? <Routes /> : <InternetInfo />}
                        </KeyboardSafeContent>
                        <Toast />
                        <AlertNewVersion />
                    </ProviderRedux>
                </PaperProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default Sentry.wrap(App);
