import { StyleSheet, Platform } from "react-native";
import Constants from "expo-constants";

export const Style = StyleSheet.create({
    container: {
        height: Platform.OS === "android" ? Constants.statusBarHeight : 0,
        backgroundColor: "#F05829",
    },
});
