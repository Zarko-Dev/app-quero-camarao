/* eslint-disable max-len */
import { useState, useCallback, useRef } from "react";
import { Animated } from "react-native";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import {
    deleteDrawPrizeLiveById,
    findDrawPrizeLiveByCode,
    getAllDrawPrizesLiveWhereParticipant,
    setParticipantDrawPrizeLive,
} from "../../controllers/DrawPrizes/live";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { dataRoutes } from "../../routes/dataRoutes";

export const useDrawerPrizeLive = ({ navigation }) => {
    const [dialogInputVisible, setDialogInputVisible] = useState(false);
    const [itemValue, setItemValue] = useState("");
    const [dataUser, setDataUser] = useState();
    const [userRules, setUserRules] = useState([]);
    const [drawerpriseLiveList, setDrawerpriseLiveList] = useState([]);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [deleteDrawPrizeLiveId, setDeleteDrawPrizeLiveId] = useState("");
    const [activeTab, setActiveTab] = useState("ativos"); // "ativos" | "encerrados"

    // Animation states
    const [showSuccess, setShowSuccess] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleGetInitialData = async () => {
        setLoadingInitialData(true);
        setDrawerpriseLiveList([]);
        const user = await GetUserStorage();
        setDataUser(user);
        const rules = Array.isArray(user?.rules) ? user.rules : [];
        const isAdmin = rules.includes("Admin");
        const response = await getAllDrawPrizesLiveWhereParticipant(user?.email, isAdmin);
        setUserRules(rules);

        if (response.error) {
            Toast.show({
                type: "error",
                text1: isAdmin ? "Não há sorteios a serem listados!" : "Você não possui sorteios ao vivo",
                text2: isAdmin ? "Realize a criação de um sorteio ao vivo!" : "Participe de sorteios para visualizá-los aqui",
            });
        } else {
            setDrawerpriseLiveList(response.data);
        }
        setLoadingInitialData(false);
    };

    useFocusEffect(
        useCallback(() => {
            handleGetInitialData();
        }, [])
    );

    const triggerSuccessAnimation = () => {
        scaleAnim.setValue(0);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 150,
            useNativeDriver: true,
        }).start();
    };

    const handleParticipateDrawPriseLive = async () => {
        if (!itemValue) {
            Toast.show({
                type: "error",
                text1: "Código inválido",
                text2: "Informe o código do sorteio",
            });
            return;
        }

        const response = await findDrawPrizeLiveByCode(itemValue, dataUser?.email);

        if (response.error) {
            Toast.show({
                type: "error",
                text1: "Sorteio não encontrado",
                text2: "Verifique se o código digitado está correto!",
            });
        } else {
            const responseParticipant = await setParticipantDrawPrizeLive(response.data.id, dataUser?.email);
            if (!responseParticipant) {
                Toast.show({
                    type: "error",
                    text1: "Erro ao participar do sorteio",
                    text2: "Tente novamente em instantes",
                });
            } else {
                setShowSuccess(true);
                triggerSuccessAnimation();

                setTimeout(async () => {
                    setDialogInputVisible(false);
                    setItemValue("");
                    setShowSuccess(false);
                    Toast.show({
                        type: "success",
                        text1: response.data.name ? `Você está participando do sorteio ${response.data.name}!` : "Participação realizada com sucesso",
                        text2: "Boa sorte!",
                    });
                    await handleGetInitialData();
                }, 1800);
                return; // Return early to avoid resetting state immediately
            }
        }
        setDialogInputVisible(false);
        setItemValue("");
    };

    const handleShowWinners = (drawId) => {
        navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
            drawerPrizeLiveId: drawId,
            showOnlyResults: false,
        });
    };

    const handleDeleteDrawPrizeLive = async () => {
        setLoadingInitialData(true);
        const result = await deleteDrawPrizeLiveById(deleteDrawPrizeLiveId);
        if (result) {
            setTimeout(async () => {
                await handleGetInitialData();
            }, 2000);
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao excluir sorteio",
                text2: "Tente novamente em instantes",
            });
        }
        setShowAlertVisible(false);
    };

    const filteredDraws = drawerpriseLiveList.filter((item) => {
        if (activeTab === "ativos") return item.status === true;
        return item.status === false;
    });

    return {
        dialogInputVisible,
        setDialogInputVisible,
        itemValue,
        setItemValue,
        filteredDraws,
        loadingInitialData,
        showAlertVisible,
        setShowAlertVisible,
        setDeleteDrawPrizeLiveId,
        handleParticipateDrawPriseLive,
        handleDeleteDrawPrizeLive,
        handleShowWinners,
        userRules,
        dataUser,
        activeTab,
        setActiveTab,
        showSuccess,
        scaleAnim
    };
};
