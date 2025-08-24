/* eslint-disable operator-linebreak */

import { Appearance, PixelRatio } from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import { Dark } from "./dark";
import { Light } from "./light";

let ThemeColors = Light;

if (Appearance.getColorScheme() === "dark") {
    ThemeColors = Dark;
}

export const theme = {
    roundness: 4,
    ...ThemeColors,
    size: {
        // Use to font size
        fontSize: (value) =>
            `${
                RFValue(value - 1) /
                Number(PixelRatio.getFontScale().toString().substring(0, 4))
            }px`,

        // Use to component size. Ex.: Image - width and height
        componentSize: (value) => `${RFValue(value)}px`,

        // Use to dimentions spacing between components
        dimentionsSize: (value) => `${RFPercentage(value)}px`,
    },
};
