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
        const result = JSON.parse(await AsyncStorage.getItem(KEY));

        return result.dataUser;
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
