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
import {
    deleteUser,
    deleteUserImage,
} from "../../../../../controllers/User/deleteUser";
import { getUserPublications } from "../../../../../controllers/Publication/getUserPublications";
import {
    deletePublication,
    deletePublicationImages,
} from "../../../../../controllers/Publication/delete";
import {
    deleteOrder,
    getAllUserOrders,
} from "../../../../../controllers/Payment/order";
import { VerifyIfUserInvitationExists } from "../../../../../controllers/Invitations/find";
import { deleteInvitation } from "../../../../../controllers/Invitations/delete";
import { VerifyIfUserWalletExists } from "../../../../../controllers/Wallet/find";
import { deleteWallet } from "../../../../../controllers/Wallet/delete";
import { SendNotifications } from "../../../../../controllers/Notifications/sendNotifications";

export const ModalDeleteUser = ({ isVisible = false, onClose, dataUser }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [checkedLogin, setCheckedLogin] = useState(true);
    const [checkedUser, setCheckedUser] = useState(true);
    const [checkedPublication, setCheckedPublication] = useState(false);
    const [checkedHistoryPayment, setCheckedHistoryPayment] = useState(false);
    const [checkedInvitation, setCheckedInvitation] = useState(true);
    const [checkedWallet, setCheckedWallet] = useState(true);
    const [notificationAlert, setNotificationAlert] = useState(false);
    const [messageTitle, setMessageTitle] = useState(
        "Notificação de Exclusão de Usuário!",
    );
    const [messageBody, setMessageBody] = useState("");
    const [requiredActions, setRequiredActions] = useState(false);
    const [requiredNotification, setRequiredNotification] = useState(false);
    const [developEnvironment, setdevelopEnvironment] = useState(false);

    const validationItens = () => {
        setRequiredActions(false);
        setRequiredNotification(false);

        if (
            checkedLogin === false &&
            checkedUser === false &&
            checkedPublication === false &&
            checkedHistoryPayment === false &&
            checkedInvitation === false &&
            checkedWallet === false
        ) {
            setRequiredActions(true);
            return true;
        }

        if (notificationAlert && (messageTitle === "" || messageBody === "")) {
            setRequiredNotification(true);
            return true;
        }

        return false;
    };

    const handleCloseModal = () => {
        onClose();

        setIsLoading(false);
        setCheckedLogin(true);
        setCheckedUser(true);
        setCheckedPublication(false);
        setCheckedHistoryPayment(false);
        setCheckedInvitation(true);
        setCheckedWallet(true);
        setNotificationAlert(false);
        setMessageTitle("Notificação de Exclusão de Usuário!");
        setMessageBody("");
        setRequiredActions(false);
        setRequiredNotification(false);
        setdevelopEnvironment(false);
    };

    const handleDeleteUser = async () => {
        if (process.env.STATUS_PROJECT !== "production") {
            setdevelopEnvironment(true);
        } else if (!validationItens()) {
            setIsLoading(true);

            if (checkedUser) {
                const image = dataUser.userImage
                    .split("user%2F")[1]
                    .split("?alt=")[0];

                await deleteUserImage(image);
                await deleteUser(dataUser.email);
            }

            if (checkedPublication) {
                const userPublications = await getUserPublications(
                    dataUser.email,
                );

                if (
                    !userPublications.error &&
                    userPublications.data.length > 0
                ) {
                    for (
                        let publicationIndex = 0;
                        publicationIndex < userPublications.data.length;
                        publicationIndex++
                    ) {
                        const logImages = [];

                        userPublications.data[publicationIndex].shrimps.map(
                            (shrimp) => {
                                if (shrimp.imageShrimpUri !== "") {
                                    logImages.push(shrimp.imageShrimpUri);
                                }
                                return null;
                            },
                        );

                        if (logImages.length > 0) {
                            const logImagesName = [];

                            logImages.map((image) => {
                                logImagesName.push(
                                    image
                                        .split("Shrimp%2F")[1]
                                        .split("?alt=")[0],
                                );
                                return null;
                            });

                            if (logImagesName.length > 0) {
                                for (
                                    let index = 0;
                                    index < logImagesName.length;
                                    index++
                                ) {
                                    await deletePublicationImages(
                                        logImagesName[index],
                                    );
                                }
                            }
                        }

                        await deletePublication(
                            userPublications.data[publicationIndex].id,
                        );
                    }
                }
            }

            if (checkedHistoryPayment) {
                const dataUserOrders = await getAllUserOrders(dataUser.email);

                if (!dataUserOrders.error && dataUserOrders.data.length > 0) {
                    for (
                        let index = 0;
                        index < dataUserOrders.data.length;
                        index++
                    ) {
                        await deleteOrder(dataUserOrders.data[index].idOrder);
                    }
                }
            }

            if (checkedInvitation) {
                const dataInvitation = await VerifyIfUserInvitationExists(
                    dataUser.email,
                );

                if (!dataInvitation.error && dataInvitation.data) {
                    await deleteInvitation(dataUser.email);
                }
            }

            if (checkedWallet) {
                const dataWallet = await VerifyIfUserWalletExists(
                    dataUser.email,
                );

                if (!dataWallet.error && dataWallet.data) {
                    await deleteWallet(dataUser.email);
                }
            }

            if (notificationAlert) {
                await SendNotifications(
                    [dataUser.notification.token],
                    messageTitle,
                    messageBody,
                );
            }

            setIsLoading(false);

            handleCloseModal();

            Toast.show({
                type: "success",
                text1: "Usuário excluído com sucesso!",
            });
        }
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
                        <ContentActions>
                            <TitleActions>
                                Selecione os dados que serão excluídos!
                            </TitleActions>
                            <ContentCheckBox>
                                <Checkbox.Android
                                    status={
                                        checkedLogin ? "checked" : "unchecked"
                                    }
                                    onPress={() =>
                                        setCheckedLogin(!checkedLogin)
                                    }
                                />
                                <TitleCheckbox>Login (Acesso)</TitleCheckbox>
                            </ContentCheckBox>
                            <ContentCheckBox>
                                <Checkbox.Android
                                    status={
                                        checkedUser ? "checked" : "unchecked"
                                    }
                                    onPress={() => setCheckedUser(!checkedUser)}
                                />
                                <TitleCheckbox>Usuário</TitleCheckbox>
                            </ContentCheckBox>
                            <ContentCheckBox>
                                <Checkbox.Android
                                    status={
                                        checkedPublication
                                            ? "checked"
                                            : "unchecked"
                                    }
                                    onPress={() =>
                                        setCheckedPublication(
                                            !checkedPublication,
                                        )
                                    }
                                />
                                <TitleCheckbox>Publicações</TitleCheckbox>
                            </ContentCheckBox>
                            <ContentCheckBox>
                                <Checkbox.Android
                                    status={
                                        checkedHistoryPayment
                                            ? "checked"
                                            : "unchecked"
                                    }
                                    onPress={() =>
                                        setCheckedHistoryPayment(
                                            !checkedHistoryPayment,
                                        )
                                    }
                                />
                                <TitleCheckbox>
                                    Histórico de Pagamentos
                                </TitleCheckbox>
                            </ContentCheckBox>
                            <ContentCheckBox>
                                <Checkbox.Android
                                    status={
                                        checkedInvitation
                                            ? "checked"
                                            : "unchecked"
                                    }
                                    onPress={() =>
                                        setCheckedInvitation(!checkedInvitation)
                                    }
                                />
                                <TitleCheckbox>Indicações</TitleCheckbox>
                            </ContentCheckBox>
                            <ContentCheckBox>
                                <Checkbox.Android
                                    status={
                                        checkedWallet ? "checked" : "unchecked"
                                    }
                                    onPress={() =>
                                        setCheckedWallet(!checkedWallet)
                                    }
                                />
                                <TitleCheckbox>Carteira</TitleCheckbox>
                            </ContentCheckBox>
                            {requiredActions && (
                                <RequiredText>
                                    Obrigatório! Selecione ao menos um item
                                </RequiredText>
                            )}
                        </ContentActions>
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
