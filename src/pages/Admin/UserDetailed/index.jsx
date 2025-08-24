/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";

import { getUserPublications } from "../../../controllers/Publication/getUserPublications";
import { dataRoutes } from "../../../routes/dataRoutes";
import { redirectWhatsappLink } from "../../../utils/redirectFunctions";
import { formatphone } from "../../../utils/formatPhone";

import { Input } from "../../../components/Input";
import { ModalDeleteUser } from "./components/ModalDeleteUser";

import {
    ButtomDelete,
    ButtomPublications,
    ButtomWhatsapp,
    Container,
    Content,
    ContentButtonWhatsApp,
    TitleButton,
    UserImage,
} from "./styles";

export const UserDetailed = ({ route }) => {
    const { dataUser } = route.params;
    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState(false);
    const [showModalDeleteUser, setShowModalDeleteUser] = useState(false);

    const handleParcialHideCpf = (cpf) => {
        const lastThreeNumbres = cpf.substring(cpf.length - 6, cpf.length);

        const formatedCPF = `***.***.${lastThreeNumbres}`;

        return formatedCPF;
    };

    const handleRedirectUserPublications = async () => {
        setIsLoading(true);

        const dataShrimps = await getUserPublications(dataUser.email);

        if (!dataShrimps.error && dataShrimps.data.length > 0) {
            navigation.navigate(dataRoutes.admin.userPublications, {
                dataShrimps: dataShrimps.data,
            });
        } else {
            Toast.show({
                type: "success",
                text1: "Não há publicação a serem listadas!",
            });
        }

        setIsLoading(false);
    };

    const redirectWhatsapp = (contactNumber) => {
        const whatsappMessage =
            "Olá, venho através do aplicativo *Quero Camarão* 🦐";

        navigation.navigate(dataRoutes.redirect, {
            subtext:
                "Estamos lhe redirecionado ao whatsapp do produtor que selecionou",
            actionRediret: redirectWhatsappLink(
                `${contactNumber}`,
                whatsappMessage,
                navigation,
            ),
        });
    };

    return (
        <Container>
            <Content>
                <UserImage
                    source={{
                        uri: dataUser?.userImage
                            ? dataUser.userImage
                            : `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=${
                                  dataUser
                                      ? dataUser.name.split(" ")[0]
                                      : "camarao"
                              }`,
                    }}
                />
                <Input label="Nome Completo" value={dataUser.name} disable />
                <Input label="E-mail" value={dataUser.email} disable />
                <Input label="Contato" value={dataUser.phone} disable />
                <Input
                    label="CPF"
                    value={handleParcialHideCpf(dataUser.cpf)}
                    disable
                />
                <Input
                    label="Data de Aniversário"
                    value={dataUser.dateBirth}
                    disable
                />
                <Input
                    label="Estado"
                    value={
                        dataUser.userType === "productor"
                            ? dataUser?.address?.state || "Não Cadastrado"
                            : dataUser?.state || "Não Cadastrado"
                    }
                    disable
                />
                <Input
                    label="Cidade"
                    value={
                        dataUser.userType === "productor"
                            ? dataUser?.address?.city || "Não Cadastrado"
                            : dataUser?.city || "Não Cadastrado"
                    }
                    disable
                />
                <Input label="Viveiros" value={dataUser.ponds} disable />
                <Input label="Hectares" value={dataUser.acre} disable />
                <Input
                    label="Tipo de Usuário"
                    value={
                        dataUser.userType === "productor"
                            ? "Produtor"
                            : "Cliente"
                    }
                    disable
                />

                <ButtomPublications onPress={handleRedirectUserPublications}>
                    {!isLoading ? (
                        <TitleButton>Publicações</TitleButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtomPublications>
                <ButtomWhatsapp
                    onPress={() =>
                        redirectWhatsapp(`+55${formatphone(dataUser.phone)}`)
                    }
                >
                    <ContentButtonWhatsApp>
                        <TitleButton>Conversar</TitleButton>
                        <FontAwesome name="whatsapp" size={20} color="white" />
                    </ContentButtonWhatsApp>
                </ButtomWhatsapp>
                <ButtomDelete onPress={() => setShowModalDeleteUser(true)}>
                    <TitleButton>Excluir Usuário</TitleButton>
                </ButtomDelete>
            </Content>
            <ModalDeleteUser
                isVisible={showModalDeleteUser}
                onClose={() => setShowModalDeleteUser(false)}
                dataUser={{
                    userId: dataUser.email,
                    userName: dataUser.name,
                    userImage: dataUser.userImage,
                    notification: dataUser?.notification,
                }}
            />
        </Container>
    );
};
