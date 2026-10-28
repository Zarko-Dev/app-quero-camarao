/* eslint-disable operator-linebreak */
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import Share from "react-native-share";
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

        try {
            await Share.open({
                url: `file://${filePath}`,
                title: "Exportar XLSX",
                filename: fileName,
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
        } catch (shareError) {
            console.log("Compartilhamento cancelado ou falhou", shareError);
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
