import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export const useSystemUI = () => {
    useEffect(() => {
        const configureSystemUI = async () => {
            if (Platform.OS === "android") {
                try {
                    // Ocultar a barra de navegação (modo imersivo)
                    await NavigationBar.setVisibilityAsync("hidden");

                    // Configurar para que apareça apenas com gesture
                    await NavigationBar.setBehaviorAsync("overlay-swipe");
                } catch (error) {
                    console.log("Erro ao configurar NavigationBar:", error);
                }
            }
        };

        configureSystemUI();
    }, []);
};
