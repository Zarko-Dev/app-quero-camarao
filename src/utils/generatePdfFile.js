import Toast from "react-native-toast-message";

export const generatePdfFile = async (dataUsers, fileName) => {
    Toast.show({
        type: "error",
        text1: "Funcionalidade Indisponível",
        text2: "A geração de PDF precisa de uma atualização nas lojas."
    });
};
