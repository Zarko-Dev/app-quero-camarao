/* eslint-disable operator-linebreak */
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

export const generateXlsxFile = async (sampleDataToExport, fileName) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleDataToExport);
    const type = "base64";

    XLSX.utils.book_append_sheet(wb, ws, "Users");

    const wbout = XLSX.write(wb, { type, bookType: "xlsx" });

    const filePath = `${FileSystem.cacheDirectory}${fileName}.xlsx`;

    try {
        await FileSystem.writeAsStringAsync(filePath, wbout, {
            encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath);
        } else {
            Toast.show({
                type: "error",
                text1: "Erro",
                text2: "Compartilhamento não disponível",
            });
        }
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Erro ao compartilhar o arquivo",
        });

        console.log("Erro ao compartilhar o arquivo:", error);
    }
};
