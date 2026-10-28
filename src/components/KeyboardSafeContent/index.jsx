import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardVisible } from "../../utils/hooks/useKeyboardVisible";

const listeners = new Set();

// Telas com ScrollView próprio (ex.: Cadastro) desligam o avoidance global.
export const setKeyboardAvoidingEnabled = (value) => listeners.forEach((fn) => fn(value));

export const KeyboardSafeContent = ({ children }) => {
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        listeners.add(setEnabled);
        return () => listeners.delete(setEnabled);
    }, []);

    const dataOpen = useKeyboardVisible();
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                paddingBottom: Platform.OS === "android" ? 0 : insets.bottom,
            }}
        >
            <KeyboardAvoidingView
                style={{
                    flex: 1,
                    marginBottom: Platform.OS === "ios" && dataOpen ? 20 : 0,
                }}
                enabled={enabled}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {children}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
