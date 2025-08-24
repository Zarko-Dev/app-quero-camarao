import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useKeyboard = () => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        function onKeyboardDidShow(e) {
            setKeyboardHeight(e.endCoordinates.height);
        }

        function onKeyboardDidHide() {
            setKeyboardHeight(0);
        }

        const showSubscription = Keyboard.addListener(
            "keyboardDidShow",
            onKeyboardDidShow,
        );
        const hideSubscription = Keyboard.addListener(
            "keyboardDidHide",
            onKeyboardDidHide,
        );
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return keyboardHeight;
};
