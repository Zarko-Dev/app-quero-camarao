import { Linking } from "react-native";
import Toast from "react-native-toast-message";

export const redirectWhatsappLink = (
    number,
    whatsappMessage,
    navigation,
    redirect,
) => {
    setTimeout(async () => {
        try {
            Linking.openURL(
                `whatsapp://send?phone=${number}&text=${whatsappMessage}`,
            );
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Não consguimos abrir seu Whatsapp!",
                text2: "Verifique seu dispositivo.",
            });
        }

        setTimeout(() => {
            if (!redirect) {
                navigation.goBack();
            } else {
                redirect();
            }
        }, 1000);

        return null;
    }, 3000);
};
