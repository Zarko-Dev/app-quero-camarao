import AsyncStorage from "@react-native-async-storage/async-storage";
import { reportDiscordError } from "../DiscordAlerts/context";

const KEY = "@USER";

export const SetUserStorage = async (dataUser) => {
    try {
        const jsonValue = JSON.stringify({ dataUser });
        await AsyncStorage.setItem(KEY, jsonValue);

        return true;
    } catch (e) {
        void reportDiscordError({
            source: "storage.user",
            error: e,
            feature: "storage",
            action: "set-user",
            extra: { key: KEY },
        });
        return false;
    }
};

export const GetUserStorage = async () => {
    try {
        const raw = await AsyncStorage.getItem(KEY);
        if (!raw) return false;
        const result = JSON.parse(raw);

        return result?.dataUser ?? false;
    } catch (e) {
        void reportDiscordError({
            source: "storage.user",
            error: e,
            feature: "storage",
            action: "get-user",
            extra: { key: KEY },
        });
        return false;
    }
};

export const ClearUserStorage = async () => {
    try {
        await AsyncStorage.removeItem(KEY);

        return true;
    } catch (error) {
        void reportDiscordError({
            source: "storage.user",
            error,
            feature: "storage",
            action: "clear-user",
            extra: { key: KEY },
        });
        return false;
    }
};
