/* eslint-disable no-await-in-loop */
/* eslint-disable operator-linebreak */
import { useState } from "react";
import { Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Checkbox } from "react-native-paper";
import Toast from "react-native-toast-message";

import {
    ButtonDeleteUser,
    ButtonHeader,
    CancelText,
    Container,
    ContentActions,
    ContentForm,
    ContentCheckBox,
    Divider,
    HeaderContent,
    HeaderTitle,
    TextButton,
    TitleActions,
    TitleCheckbox,
    UserName,
    RequiredText,
    ObservationText,
} from "./styles";
import { BoxShadowIos } from "../../../../../styles/IosShadow";
import { Input } from "../../../../../components/Input";
import { deleteUserLogin } from "../../../../../controllers/User/deleteUser";
import { SendNotifications } from "../../../../../controllers/Notifications/sendNotifications";

export const ModalDeleteUser = ({ isVisible = false, onClose, dataUser }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [notificationAlert, setNotificationAlert] = useState(false);
    const [messageTitle, setMessageTitle] = useState(
        "Notificação de Exclusão de Usuário!",
    );
    const [messageBody, setMessageBody] = useState("");
    const [requiredNotification, setRequiredNotification] = useState(false);
    const [developEnvironment, setdevelopEnvironment] = useState(false);

    const validationItens = () => {
        setRequiredNotification(false);

        if (notificationAlert && (messageTitle === "" || messageBody === "")) {
            setRequiredNotification(true);
            return true;
        }

        return false;
    };

    const handleCloseModal = () => {
        onClose();

        setIsLoading(false);
        setNotificationAlert(false);
        setMessageTitle("Notificação de Exclusão de Usuário!");
        setMessageBody("");
        setRequiredNotification(false);
        setdevelopEnvironment(false);
    };

    const handleDeleteUser = async () => {
        if (process.env.STATUS_PROJECT !== "production") {
            setdevelopEnvironment(true);
            return;
        }

        if (validationItens()) return;

        setIsLoading(true);

        if (notificationAlert) {
            await SendNotifications(
                [dataUser.notification.token],
                messageTitle,
                messageBody,
            );
        }

        // Servidor apaga tudo da conta (publicações, anúncios, pedidos, chats, carteira,
        // indicações, avaliações, imagens e o login).
        const result = await deleteUserLogin(dataUser.userId);

        setIsLoading(false);

        if (result.error) {
            Toast.show({
                type: "error",
                text1: "Não foi possível excluir o usuário",
                text2: result.message,
            });
            return;
        }

        handleCloseModal();

        Toast.show({
            type: "success",
            text1: "Usuário excluído com sucesso!",
        });
    };

    return (
        <Container>
            <Modal
                animationType="slide"
                visible={isVisible}
                onRequestClose={handleCloseModal}
            >
                <ScrollView>
                    <HeaderContent>
                        <ButtonHeader onPress={handleCloseModal}>
                            <Feather
                                name="arrow-left"
                                size={24}
                                color="black"
                            />
                        </ButtonHeader>
                        <HeaderTitle>Exclusão de Usuário!</HeaderTitle>
                        <ButtonHeader onPress={handleCloseModal}>
                            <CancelText>Cancelar</CancelText>
                        </ButtonHeader>
                    </HeaderContent>
                    <Divider />
                    <ContentForm>
                        <UserName>{dataUser.userName}</UserName>
                        <TitleActions>
                            Serão apagados: login, perfil, publicações, anúncios, pedidos, chats,
                            avaliações, carteira, indicações e imagens.
                        </TitleActions>
                        {dataUser.notification && (
                            <ContentActions>
                                <ContentCheckBox>
                                    <Checkbox.Android
                                        status={
                                            notificationAlert
                                                ? "checked"
                                                : "unchecked"
                                        }
                                        onPress={() =>
                                            setNotificationAlert(
                                                !notificationAlert,
                                            )
                                        }
                                    />
                                    <TitleCheckbox>
                                        Enviar notificação para o usuário que
                                        está sendo excluído?
                                    </TitleCheckbox>
                                </ContentCheckBox>
                            </ContentActions>
                        )}
                        {notificationAlert && (
                            <>
                                <Input
                                    label="Titulo da Mensagem"
                                    onChange={setMessageTitle}
                                    value={messageTitle}
                                    autoCapitalize="sentences"
                                />
                                <Input
                                    label="Corpo da Mensagem"
                                    onChange={setMessageBody}
                                    value={messageBody}
                                    multiline={4}
                                    autoCapitalize="sentences"
                                />
                                {requiredNotification && (
                                    <RequiredText>
                                        Título e corpo da mensagem, são
                                        obrigatórios!
                                    </RequiredText>
                                )}
                            </>
                        )}
                        {developEnvironment && (
                            <RequiredText>
                                Ambiente de TESTES, ação negada!
                            </RequiredText>
                        )}
                        <ButtonDeleteUser
                            onPress={handleDeleteUser}
                            style={BoxShadowIos}
                        >
                            {!isLoading ? (
                                <TextButton>Excluir Este Usuário!</TextButton>
                            ) : (
                                <ActivityIndicator animating color="white" />
                            )}
                        </ButtonDeleteUser>
                        <ObservationText>
                            OBS.: Esta ação não poderá ser revertida!
                        </ObservationText>
                    </ContentForm>
                </ScrollView>
            </Modal>
        </Container>
    );
};
