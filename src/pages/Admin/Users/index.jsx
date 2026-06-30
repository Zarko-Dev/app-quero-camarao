import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";

import { getAllUsers } from "../../../controllers/User/getAll";

import {
    ButtonListUsers,
    CardCountUser,
    CardCountUserUserType,
    Container,
    Content,
    ContentCardTypeUserCount,
    ContentLoading,
    TextCount,
    Title,
    TitleButton,
    TitleCard,
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";
import { dataRoutes } from "../../../routes/dataRoutes";
import { UserDivideList } from "../../../components/UserDivideList";

const withTimeout = (promise, ms = 30000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("ADMIN_USERS_TIMEOUT")), ms),
        ),
    ]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const executeWithRetry = async (requestFactory, retries = 1) => {
    try {
        return await requestFactory();
    } catch (error) {
        if (retries <= 0) throw error;
        await wait(1200);
        return executeWithRetry(requestFactory, retries - 1);
    }
};

export const Users = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [listUsers, setListUsers] = useState([]);
    const [dataUsers, setDataUsers] = useState([]);

    const groupUsersWithStateCity = (users) => {
        const resultDataUser = users.reduce((acc, user) => {
            const state = user.address
                ? user.address.state
                : user.state || "Não Identificado";
            const city = user.address
                ? user.address.city
                : user.city || "Não Identificado";

            let stateExists = acc.find((item) => item.state === state);

            if (!stateExists) {
                stateExists = {
                    state,
                    count: 0,
                    data: [],
                };
                acc.push(stateExists);
            }

            stateExists.count += 1;

            let cityExists = stateExists.data.find(
                (item) => item.city === city,
            );

            if (!cityExists) {
                cityExists = {
                    city,
                    count: 0,
                    dataUser: [],
                };
                stateExists.data.push(cityExists);
            }

            cityExists.count += 1;

            cityExists.dataUser.push(user);

            return acc;
        }, []);

        resultDataUser.sort((a, b) => {
            if (a.state === "Não Identificado") return 1;
            if (b.state === "Não Identificado") return -1;
            return a.state.localeCompare(b.state);
        });

        resultDataUser.forEach((state) => {
            state.data.sort((a, b) => a.city.localeCompare(b.city));
        });

        return resultDataUser;
    };

    useEffect(() => {
        setIsLoading(true);

        executeWithRetry(() => withTimeout(getAllUsers(), 30000), 1)
            .then((data) => {
                if (data.length > 0) {
                    setListUsers(data);
                    setDataUsers(groupUsersWithStateCity(data));
                } else {
                    Toast.show({ type: "info", text1: "Nenhum usuário encontrado" });
                }
            })
            .catch((error) => {
                Toast.show({
                    type: "error",
                    text1: "Erro ao carregar usu?rios",
                    text2:
                        error?.message === "ADMIN_USERS_TIMEOUT"
                            ? "Tempo limite da consulta."
                            : "Falha ao buscar dados.",
                });
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleRedirectListUsers = (users) => {
        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: users,
        });
    };

    const handleRedirectProductorClientList = (users) => {
        navigation.navigate(dataRoutes.admin.userProductorClientList, {
            dataUsers: groupUsersWithStateCity(users),
        });
    };

    const getUsersByUserType = (users, userType) =>
        users.filter((user) => user.userType === userType);

    return (
        <Container>
            {isLoading ? (
                <ContentLoading>
                    <ActivityIndicator animating color="black" size={50} />
                </ContentLoading>
            ) : (
                <Content>
                    <CardCountUser style={BoxShadowIos}>
                        <TitleCard>Usuários Totais na Quero Camarão</TitleCard>
                        <TextCount>{listUsers.length} Usuários</TextCount>
                    </CardCountUser>
                    <ContentCardTypeUserCount>
                        <CardCountUserUserType
                            onPress={() =>
                                handleRedirectProductorClientList(
                                    getUsersByUserType(listUsers, "productor"),
                                )
                            }
                        >
                            <TitleCard>Produtores</TitleCard>
                            <TextCount>
                                {
                                    getUsersByUserType(listUsers, "productor")
                                        .length
                                }
                            </TextCount>
                        </CardCountUserUserType>
                        <CardCountUserUserType
                            onPress={() =>
                                handleRedirectProductorClientList(
                                    getUsersByUserType(listUsers, "client"),
                                )
                            }
                        >
                            <TitleCard>Clientes</TitleCard>
                            <TextCount>
                                {getUsersByUserType(listUsers, "client").length}
                            </TextCount>
                        </CardCountUserUserType>
                    </ContentCardTypeUserCount>
                    <ButtonListUsers
                        onPress={() => handleRedirectListUsers(listUsers)}
                    >
                        <TitleButton>Visualizar Todos os Usuários</TitleButton>
                    </ButtonListUsers>
                    <Title>Listagem de Usuários por Região</Title>
                    {dataUsers.map((dataUser, index) => (
                        <UserDivideList
                            key={`${dataUser.state}-${index}`}
                            listUsers={dataUser}
                            redirectAction={handleRedirectListUsers}
                        />
                    ))}
                </Content>
            )}
        </Container>
    );
};
