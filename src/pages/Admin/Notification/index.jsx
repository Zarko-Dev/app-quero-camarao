/* eslint-disable indent */
import { useEffect, useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { ActivityIndicator, Checkbox } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { v4 } from "uuid";

import { getAllUserTokenNotification } from "../../../controllers/User/notification";
import { SendNotifications } from "../../../controllers/Notifications/sendNotifications";

import DropdownComponent from "../../../components/DropdownComponent";

import {
    ActionButton,
    Container,
    ContainerCheckbox,
    ContentActions,
    ContentCheckBox,
    InputStyle,
    Observation,
    TextButton,
    Title,
    TitleActions,
    TitleCheckbox,
} from "./styles";

export const Notification = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [checkedProductor, setCheckedProductor] = useState(true);
    const [checkedClient, setCheckedClient] = useState(true);
    const [listUsers, setListUsers] = useState([]);
    const [usersNotification, setUsersNotification] = useState([]);
    const [notificationsTokens, setNotificationsTokens] = useState([]);

    const filterUsers = (users) => {
        if (checkedProductor && checkedClient) {
            return users;
        }

        return users.filter((user) => {
            if (checkedProductor && user.userType === "productor") {
                return true;
            }

            if (checkedClient && user.userType === "client") {
                return true;
            }

            return false;
        });
    };

    useFocusEffect(
        useCallback(() => {
            const getToken = async () => {
                const result = await getAllUserTokenNotification();

                if (!result.error) {
                    setListUsers(result.data);
                    setUsersNotification(
                        filterUsers(result.data).map((item) => ({
                            label: item.user,
                            value: item.notification.token,
                        })),
                    );
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não há usuários com permissão de notificação!",
                    });
                }
            };

            getToken();
        }, []),
    );

    useEffect(() => {
        setUsersNotification([]);
        setUsersNotification(
            filterUsers(listUsers).map((item) => ({
                label: item.user,
                value: item.notification.token,
            })),
        );
    }, [checkedProductor, checkedClient]);

    const handleSendNotification = () => {
        if (title === "" || body === "") {
            Toast.show({
                type: "error",
                text1: "Titulo e Corpo da mensagem, são obrigatórios!",
            });
        } else {
            setIsLoading(true);

            SendNotifications(notificationsTokens, title, body, () => {
                setIsLoading(false);

                Toast.show({
                    type: "success",
                    text1: "Notificações enviadas!",
                });
            });
        }
    };

    const handleSelectUsers = async (users) => {
        setNotificationsTokens(users.map((user) => user.value));
    };

    return (
        <Container>
            <Title>
                Envie notificações direto para os usuários da Quero Camarão
            </Title>

            <InputStyle
                label="Título da Mensagem"
                onChange={setTitle}
                value={title}
                autoCapitalize="sentences"
            />
            <InputStyle
                label="Corpo da Mensagem"
                onChange={setBody}
                value={body}
                autoCapitalize="sentences"
                multiline={4}
            />

            <ContentActions>
                <TitleActions>Selecione a listagem de usuários!</TitleActions>
                <ContainerCheckbox>
                    <ContentCheckBox>
                        <Checkbox.Android
                            status={checkedProductor ? "checked" : "unchecked"}
                            onPress={() =>
                                setCheckedProductor(!checkedProductor)
                            }
                        />
                        <TitleCheckbox>Produtores</TitleCheckbox>
                    </ContentCheckBox>
                    <ContentCheckBox>
                        <Checkbox.Android
                            status={checkedClient ? "checked" : "unchecked"}
                            onPress={() => setCheckedClient(!checkedClient)}
                        />
                        <TitleCheckbox>Clientes</TitleCheckbox>
                    </ContentCheckBox>
                </ContainerCheckbox>
            </ContentActions>

            <DropdownComponent
                title="Selecione os usuários"
                options={usersNotification.map((item) => ({
                    ...item,
                    id: v4(),
                }))}
                action={handleSelectUsers}
                multipleSelect
            />
            <Observation>
                * Só serão listados usuário que permitiram a exibição de
                notificações no aplicativo Quero Camarão
            </Observation>

            <ActionButton
                disabled={notificationsTokens.length === 0}
                onPress={handleSendNotification}
            >
                {!isLoading ? (
                    <TextButton>
                        {notificationsTokens.length === 0
                            ? "Usuários não selecionados"
                            : `Enviar notificação para ${
                                  notificationsTokens.length
                              } ${
                                  notificationsTokens.length > 1
                                      ? "usuários"
                                      : "usuário"
                              }`}
                    </TextButton>
                ) : (
                    <ActivityIndicator animating color="white" />
                )}
            </ActionButton>
            <Observation>
                * Dependendo da quantidade de usuários, o envio de notificações
                pode demorar para concluir, aguarde até o final do processo de
                envio!
            </Observation>
        </Container>
    );
};
