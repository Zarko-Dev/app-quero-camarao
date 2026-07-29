import { lighten } from "polished";
import { DefaultTheme } from "react-native-paper";

export const Dark = {
    ...DefaultTheme,
    dark: true,
    colors: {
        ...DefaultTheme.colors,
        primary: "#F05829",
        secondary: "#FFE2CC",
        green: "#4BB543",

        white: "#fff",
        black: "#1E1E1E",

        text: "#3C3C3C",
        subtext: lighten(0.7, "#3C3C3C"),
        textWhite: "#fff",

        background: "#f5f5f5",
    },
};
