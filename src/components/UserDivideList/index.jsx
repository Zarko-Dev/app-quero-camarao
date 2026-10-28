import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import {
    ButtonGenerateXlsxFile,
} from "./styles";
import { generateXlsxFile } from "../../utils/generateXlsxFile";

export const UserDivideList = ({ listUsers, redirectAction }) => {
    const handleGetFile = () => {
        const users = [];

        listUsers.data.forEach((item) => {
            item.dataUser.forEach((user) => {
                users.push({
                    Nome: user.name,
                    Email: user.email,
                    Telefone: user.phone,
                    Estado: listUsers.state,
                    Cidade: item.city,
                });
            });
        });

        generateXlsxFile(
            users,
            `Quero_Camarão_Listagem_Usuários_${new Date().toLocaleDateString().replace(/\//g, "-")}_${new Date().toLocaleTimeString().replace(/:/g, "-")}`,
        );
    };

    const total = listUsers.data.reduce((sum, item) => sum + item.count, 0);

    return (
        <View style={{
            backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#F1E4DA",
        }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <View style={{
                    backgroundColor: "#FFEDE3", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                }}
                >
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#f55b1f" }}>{listUsers.state}</Text>
                </View>
                <Text style={{ flex: 1, marginLeft: 10, fontSize: 12, color: "#8A8A8A" }}>
                    {total} {total === 1 ? "usuário" : "usuários"} · {listUsers.data.length}{" "}
                    {listUsers.data.length === 1 ? "cidade" : "cidades"}
                </Text>
                <ButtonGenerateXlsxFile onPress={handleGetFile}>
                    <Feather name="download" size={16} color="white" />
                </ButtonGenerateXlsxFile>
            </View>
            {listUsers.data.map((item, index) => (
                <TouchableOpacity
                    key={`${listUsers.state}-${item.city}-${index}`}
                    onPress={() => redirectAction(item.dataUser)}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 11,
                        borderTopWidth: index === 0 ? 0 : 1,
                        borderTopColor: "#F3F3F3",
                    }}
                >
                    <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, color: "#1A1A1A" }}>{item.city}</Text>
                    <View style={{
                        minWidth: 32, alignItems: "center", backgroundColor: "#FFEDE3", borderRadius: 10,
                        paddingHorizontal: 8, paddingVertical: 3,
                    }}
                    >
                        <Text style={{ fontSize: 14, fontWeight: "800", color: "#f55b1f" }}>{item.count}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#C4C4C4" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            ))}
        </View>
    );
};
