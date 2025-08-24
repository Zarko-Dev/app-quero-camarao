import { KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardVisible } from "../../utils/hooks/useKeyboardVisible";

export const KeyboardSafeContent = ({ children }) => {
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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {children}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
