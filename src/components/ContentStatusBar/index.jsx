import { View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

import { Style } from "./styles";

export const ContentStatusBar = () => (
    <>
        <StatusBar
            style="light"
            backgroundColor="#F05829"
            translucent={false}
        />
        {Platform.OS === "android" && <View style={Style.container} />}
    </>
);
