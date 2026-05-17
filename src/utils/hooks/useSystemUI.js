import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export const useSystemUI = () => {
    useEffect(() => {
        let isMounted = true;

        const configureSystemUI = async () => {
            if (Platform.OS === "android") {
                try {
                    if (!isMounted) return;
                    await NavigationBar.setVisibilityAsync("hidden");

                    if (!isMounted) return;
                    await NavigationBar.setBehaviorAsync("overlay-swipe");
                } catch (error) {
                    const message = String(error?.message || error || "");
                    const isActivityUnavailable =
                        message.includes("current activity is no longer available");

                    if (!isActivityUnavailable) {
                        console.log("Erro ao configurar NavigationBar:", error);
                    }
                }
            }
        };

        configureSystemUI();

        return () => {
            isMounted = false;
        };
    }, []);
};
