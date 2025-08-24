import { LogBox } from "react-native";

export const ignoreLogs = () => {
    const ignoreWarns = ["ViewPropTypes will be removed from React Native"];

    const { error } = console;
    console.error = (...arg) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const warning of ignoreWarns) {
            if (arg[0].startsWith(warning)) {
                return;
            }
        }
        error(...arg);
    };

    LogBox.ignoreLogs(ignoreWarns);
};
