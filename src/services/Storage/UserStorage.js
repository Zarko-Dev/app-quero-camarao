import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@USER";

export const SetUserStorage = async (dataUser) => {
    try {
        const jsonValue = JSON.stringify({ dataUser });
        await AsyncStorage.setItem(KEY, jsonValue);

        return true;
    } catch (e) {
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
        return false;
    }
};

export const ClearUserStorage = async () => {
    try {
        await AsyncStorage.removeItem(KEY);

        return true;
    } catch (error) {
        return false;
    }
};
