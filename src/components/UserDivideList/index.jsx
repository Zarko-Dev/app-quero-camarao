import { Feather } from "@expo/vector-icons";
import {
    ButtonGenerateXlsxFile,
    CardCount,
    ContentCardCount,
    ContentTitle,
    Divider,
    TextCount,
    TitleCard,
    TitleItem,
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

    return (
        <>
            <ContentTitle>
                <TitleItem>{listUsers.state}</TitleItem>
                <ButtonGenerateXlsxFile onPress={handleGetFile}>
                    <Feather name="file" size={24} color="white" />
                </ButtonGenerateXlsxFile>
            </ContentTitle>
            <Divider />
            <ContentCardCount>
                {listUsers.data.map((item) => (
                    <CardCount
                        key={item.city}
                        onPress={() => redirectAction(item.dataUser)}
                    >
                        <TitleCard>{item.city}</TitleCard>
                        <TextCount>{item.count}</TextCount>
                    </CardCount>
                ))}
            </ContentCardCount>
        </>
    );
};
