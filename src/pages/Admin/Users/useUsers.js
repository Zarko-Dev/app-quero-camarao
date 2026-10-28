import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { getAllUsers } from "../../../controllers/User/getAll";
import { dataRoutes } from "../../../routes/dataRoutes";

export const withTimeout = (promise, ms = 30000) =>
    Promise.race([
        promise,
        new Promise((_, reject) => { setTimeout(() => reject(new Error("ADMIN_USERS_TIMEOUT")), ms); }),
    ]);

export const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export const executeWithRetry = async (requestFactory, retries = 1, delay = 1200) => {
    try {
        return await requestFactory();
    } catch (error) {
        if (retries <= 0) throw error;
        if (delay > 0) await wait(delay);
        return executeWithRetry(requestFactory, retries - 1, delay);
    }
};

export const normalizeLabel = (value) => {
    const normalized = String(value ?? "").trim();
    return normalized || "Não Identificado";
};

export const compareLabels = (left, right, fallbackLabel = "Não Identificado") => {
    if (left === fallbackLabel && right === fallbackLabel) {
        return 0;
    }
    if (left === fallbackLabel) {
        return 1;
    }
    if (right === fallbackLabel) {
        return -1;
    }
    return left.localeCompare(right);
};

export const groupUsersWithStateCity = (users = []) => {
    const resultDataUser = (Array.isArray(users) ? users : []).reduce((acc, user) => {
        const state = normalizeLabel(user?.address?.state ?? user?.state);
        const city = normalizeLabel(user?.address?.city ?? user?.city);

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

        let cityExists = stateExists.data.find((item) => item.city === city);

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

    resultDataUser.sort((a, b) => compareLabels(a.state, b.state));

    resultDataUser.forEach((state) => {
        state.data.sort((a, b) => compareLabels(a.city, b.city));
    });

    return resultDataUser;
};

export const useUsers = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [listUsers, setListUsers] = useState([]);
    const [dataUsers, setDataUsers] = useState([]);

    useEffect(() => {
        setIsLoading(true);

        executeWithRetry(() => withTimeout(getAllUsers(), 30000), 1)
            .then((data) => {
                if (data && data.length > 0) {
                    setListUsers(data);
                    setDataUsers(groupUsersWithStateCity(data));
                } else {
                    Toast.show({ type: "info", text1: "Nenhum usuário encontrado" });
                }
            })
            .catch((error) => {
                Toast.show({
                    type: "error",
                    text1: "Erro ao carregar usuários",
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

    const getUsersByUserType = (users = [], userType) =>
        (Array.isArray(users) ? users : []).filter((user) => user.userType === userType);

    return {
        isLoading,
        listUsers,
        dataUsers,
        handleRedirectListUsers,
        handleRedirectProductorClientList,
        getUsersByUserType,
        groupUsersWithStateCity,
    };
};
