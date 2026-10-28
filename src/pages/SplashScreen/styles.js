import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export const TRACK_W = width * 0.65;
export const BAR_W = TRACK_W * 0.45;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFE2CC",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: "75%",
        height: 160,
        marginBottom: 36,
    },
    progressTrack: {
        width: TRACK_W,
        height: 4,
        backgroundColor: "rgba(0,0,0,0.12)",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressBar: {
        width: BAR_W,
        height: "100%",
        backgroundColor: "#E07B39",
        borderRadius: 2,
    },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        fontSize: 12,
        color: "#7A4A2A",
        textAlign: "center",
        lineHeight: 18,
        letterSpacing: 0.2,
    },
});
