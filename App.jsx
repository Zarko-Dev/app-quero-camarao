import "react-native-gesture-handler";
import "./src/polyfills/cryptoRandom";

import { useEffect } from "react";
import { pt, registerTranslation } from "react-native-paper-dates";
import { ThemeProvider } from "styled-components/native";
import { PaperProvider } from "react-native-paper";
import { Provider as ProviderRedux } from "react-redux";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import {
    Comfortaa_300Light,
    Comfortaa_400Regular,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
} from "@expo-google-fonts/comfortaa";
import * as Sentry from "@sentry/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ignoreLogs } from "./src/utils/ignoreLogs";
import { initializeObservability } from "./src/observability/init";
import { requestStartupPermissions } from "./src/permissions/startup";
import { installNotificationHandlers } from "./src/notifications/setup";
import { paperTheme } from "./src/styles/paperTheme";

import { theme } from "./src/styles/Theme";
import { store } from "./src/store";
import { Routes } from "./src/routes";
import { AlertNewVersion } from "./src/components/AlertNewVersion";
import { BadgeSync } from "./src/components/BadgeSync";
import { ContentStatusBar } from "./src/components/ContentStatusBar";
import { KeyboardSafeContent } from "./src/components/KeyboardSafeContent";
import { useInternetConnection } from "./src/utils/hooks/useInternetConnection";
import { useSystemUI } from "./src/utils/hooks/useSystemUI";
import { InternetInfo } from "./src/components/InternetInfo";

ignoreLogs();
initializeObservability();

const App = () => {
    registerTranslation("pt", pt);
    const isConnected = useInternetConnection();

    useSystemUI();

    useEffect(() => {
        requestStartupPermissions();
    }, []);

    useEffect(() => installNotificationHandlers(), []);

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
