import { DefaultTheme } from "react-native-paper";
import { lighten } from "polished";

export const Light = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        primary: "#F05829",
        secondary: "#FFE2CC",
        tertiary: "#FFCDA8",
        quaternary: "#FFB277",

        white: "#fff",
        black: "#1E1E1E",
        red: "#f47575",
        green: "#4BB543",
        yellow: "#FFE900",
        blue: "#009FE3",

        text: "#3C3C3C",
        subtext: lighten(0.7, "#3C3C3C"),
        textWhite: "#fff",
        inputColor: "#ffe6d3",
        border: lighten(0.7, "#000"),
        divider: lighten(0.3, "#000"),

        background: "#f5f5f5",
    },
};
