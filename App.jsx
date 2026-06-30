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
import { Routes } from "./src/routes";
import { AlertNewVersion } from "./src/components/AlertNewVersion";
import { ContentStatusBar } from "./src/components/ContentStatusBar";
import { KeyboardSafeContent } from "./src/components/KeyboardSafeContent";
import { useInternetConnection } from "./src/utils/hooks/useInternetConnection";
import { useSystemUI } from "./src/utils/hooks/useSystemUI";
import { InternetInfo } from "./src/components/InternetInfo";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
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

            await Notifications.setBadgeCountAsync(0);

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
