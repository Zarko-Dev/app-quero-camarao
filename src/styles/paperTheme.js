import { MD3LightTheme } from "react-native-paper";
import { theme } from "./Theme";

export const paperTheme = {
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