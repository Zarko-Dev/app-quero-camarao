import * as Location from "expo-location";
import * as Sentry from "@sentry/react-native";
import { reportDiscordError } from "../../services/DiscordAlerts/context";

// Returns { error: false, lat, lng } or { error: true, reason }
// reason: 'permission-denied' | 'unavailable' | 'error'
export const getChatLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            return { error: true, reason: "permission-denied" };
        }
        const result = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        const { latitude: lat, longitude: lng } = result.coords;
        return { error: false, lat, lng };
    } catch (error) {
        Sentry.captureException(error);
        void reportDiscordError({ source: "chat.get-location", error, feature: "chat", action: "get-location" });
        if (error?.code === "E_LOCATION_UNAVAILABLE") {
            return { error: true, reason: "unavailable" };
        }
        return { error: true, reason: "error" };
    }
};
