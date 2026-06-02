/* eslint-disable operator-linebreak */
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { v4 } from "uuid";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Button, Dialog, Portal } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Input } from "../../../components/Input";
import { InputNoMask } from "../../../components/InputNoMask";
import {
    ButtonEndDrawerPrizeAction,
    ButtonInitDrawerPrizeAction,
    ButtonStartDrawerPrizeAction,
    ButtonViewParticipants,
    CardSelection,
    Container,
    ContentActionCountButtons,
    ContentActionDrawerPrizeAction,
    ContentDrawerPrizeLive,
    ContentParticipants,
    HeaderDrawerPrizeLive,
    QuantityParticipants,
    ReloadButton,
    TextButtonStartDrawerStartAction,
    Title,
    TitleCode,
    TitleQuantityParticipants,
} from "./styles";
import { DialogComponent } from "../../../components/Dialog";
import {
    CloseDrawPrizeLiveById,
    createDrawPrizeLiveByCode,
    getActiveDrawPrizeLive,
    setWinnerDrawPrizeLive,
    getDrawPrizeLiveById,
    updateDrawPrizeLiveNames,
    getAllActiveDrawPrizesLive,
    updateDrawPrizeCode,
    updateDrawPrizeName,
    updateDrawPrizeTheme,
    seedParticipantsDrawPrizeLive,
} from "../../../controllers/DrawPrizes/live";
import { getAllUsers } from "../../../controllers/User/getAll";
import { saveDrawPrize} from "../../../controllers/DrawPrizes/create";
import { getDataUserByIds } from "../../../controllers/User/authentication";
import { dataRoutes } from "../../../routes/dataRoutes";
import { ActionCountButton } from "../DrawPrize/styles";
import { DrawPrizeNameDialog } from "../DrawPrizeWinnersResult/components/DrawPrizeNameDialog";
import {
    buildEligibleParticipants,
    pickRandomUniqueWinners,
} from "../../../utils/drawEligibility";
import {
    validateDrawCode,
    validateDrawName,
    validateDrawTheme,
    validateDrawCreation,
    buildDrawSummary,
    sortDrawsByCreatedDesc,
    applyDrawCodeEdit,
    applyDrawNameEdit,
    applyDrawThemeEdit,
} from "../../../utils/multipleLiveDraws";

const NAME_ERROR_MESSAGES = {
    code_required: "Informe o código do sorteio",
    code_too_long: "Código do sorteio muito longo (máx 50)",
    name_required: "Informe o nome do sorteio",
    name_too_short: "Nome do sorteio muito curto",
    name_too_long: "Nome do sorteio muito longo (máx 50)",
    theme_required: "Informe o tema do sorteio",
    theme_too_short: "Tema do sorteio muito curto",
    theme_too_long: "Tema do sorteio muito longo (máx 50)",
};

export const DrawPrizeLive = ({ navigation }) => {
    const [drawerCode, setDrawerCode] = useState();
    const [drawerCodeFixed, setDrawerCodeFixed] = useState();
    const [drawerNameFixed, setDrawerNameFixed] = useState();
    const [drawerName, setDrawerName] = useState();
    const [drawerTheme, setDrawerTheme] = useState();
    const [drawerThemeFixed, setDrawerThemeFixed] = useState();
    const [drawerPrizeLiveId, setDrawerPrizeLiveId] = useState();
    const [showDrawPrizeNameDialog, setShowDrawPrizeNameDialog] = useState(false);
    const [drawPrizeNames, setDrawPrizeNames] = useState([]);
    const [currentDrawPrizeName, setCurrentDrawPrizeName] = useState("");
    const [participants, setParticipants] = useState([]);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [loadingStartDrawPrize, setLoadingStartDrawPrize] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [loadingWinners, setLoadingWinners] = useState(false);
    const [countPrizes, setCountPrizes] = useState(0);
    const [loadingInitDrawPrize, setLoadingInitDrawPrize] = useState(false);
    const [
        loadingReloadDataDrawerPrizeLive,
        setLoadingReloadDataDrawerPrizeLive,
    ] = useState(false);
    const [activeDraws, setActiveDraws] = useState([]);
    const [winners, setWinners] = useState([]);
    const [showEditNameDialog, setShowEditNameDialog] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");
    const [editTargetId, setEditTargetId] = useState(null);
    const [showEditInfoDialog, setShowEditInfoDialog] = useState(false);
    const [editCodeValue, setEditCodeValue] = useState("");
    const [editThemeValue, setEditThemeValue] = useState("");
    const [editThemeTargetId, setEditThemeTargetId] = useState(null);

    const loadActiveDraws = useCallback(async () => {
        const response = await getAllActiveDrawPrizesLive();
        if (response.error) return;
        const summaries = response.data.map(buildDrawSummary);
        setActiveDraws(sortDrawsByCreatedDesc(summaries));
    }, []);

    useFocusEffect(
        useCallback(() => {
            const getDrawerPriseLive = async () => {
                const [response] = await Promise.all([
                    getActiveDrawPrizeLive(),
                    loadActiveDraws(),
                ]);

               if (!response.error) {
                setDrawerCodeFixed(response.data.code);
                setDrawerNameFixed(response.data.name ?? response.data.names?.[0] ?? '');
                setDrawerThemeFixed(response.data.theme ?? '');
                setDrawPrizeNames(response.data.names ?? []);
                setDrawerPrizeLiveId(response.data.id);
                setParticipants(response.data?.participants ?? []);
                setWinners(response.data?.winners ?? []);
                setCountPrizes(response.data?.participants?.length > 0 ? 1 : 0);
                }

                setInitialLoading(false);
            };

            getDrawerPriseLive();
        }, [loadActiveDraws]),
    );

  const handleStartDrawPrizeLive = async () => {
    if (!drawerCode) {
        Toast.show({
            type: "error",
            text1: "Informe o código do sorteio",
        });
        return;
    }

    const validation = validateDrawCreation({
        name: drawerName,
        theme: drawerTheme,
    });
    if (!validation.valid) {
        Toast.show({
            type: "error",
            text1: NAME_ERROR_MESSAGES[validation.error],
        });
        return;
    }

    setLoadingStartDrawPrize(true);

    const id = v4();
    const response = await createDrawPrizeLiveByCode(
        id,
        drawerCode,
        validation.value.name,
        validation.value.theme,
    );

    if (response) {
        setDrawerCodeFixed(drawerCode);
        setDrawerNameFixed(validation.value.name);
        setDrawerThemeFixed(validation.value.theme);
        setDrawPrizeNames([]);
        setDrawerPrizeLiveId(id);
        const newSummary = buildDrawSummary({
            id,
            code: drawerCode,
            name: validation.value.name,
            theme: validation.value.theme,
            status: true,
            participants: [],
            winners: [],
            createdAt: { seconds: Math.floor(Date.now() / 1000) },
        });
        setActiveDraws((prev) =>
            sortDrawsByCreatedDesc([newSummary, ...prev]),
        );
        setLoadingStartDrawPrize(false);
    } else {
        setLoadingStartDrawPrize(false);
        Toast.show({
            type: "error",
            text1: "Erro ao criar o sorteio, tente novamente em instantes!",
        });
    }
};

const [loadingSeedParticipants, setLoadingSeedParticipants] = useState(false);

const handleSeedParticipants = async () => {
    if (!drawerPrizeLiveId) {
        Toast.show({ type: "error", text1: "Nenhum sorteio focado" });
        return;
    }
    setLoadingSeedParticipants(true);
    try {
        const users = await getAllUsers();
        const ids = (users || [])
            .map((u) => u.uid)
            .filter(Boolean)
            .slice(0, 10);
        if (ids.length === 0) {
            Toast.show({ type: "error", text1: "Nenhum usuário disponível" });
            return;
        }
        const ok = await seedParticipantsDrawPrizeLive(drawerPrizeLiveId, ids);
        if (ok) {
            const refreshed = await getDrawPrizeLiveById(drawerPrizeLiveId);
            if (!refreshed.error) {
                setParticipants(refreshed.data.participants ?? []);
                setCountPrizes(refreshed.data.participants?.length > 0 ? 1 : 0);
            }
            Toast.show({ type: "success", text1: `${ids.length} participantes adicionados` });
        } else {
            Toast.show({ type: "error", text1: "Erro ao inserir participantes" });
        }
    } finally {
        setLoadingSeedParticipants(false);
    }
};

const handleCreateNewDraw = () => {
    setDrawerCode("");
    setDrawerCodeFixed(undefined);
    setDrawerName("");
    setDrawerNameFixed(undefined);
    setDrawerTheme("");
    setDrawerThemeFixed(undefined);
    setDrawerPrizeLiveId(undefined);
    setDrawPrizeNames([]);
    setParticipants([]);
    setWinners([]);
    setCountPrizes(0);
};

const handleFocusDraw = async (draw) => {
    const response = await getDrawPrizeLiveById(draw.id);
    if (response.error) {
        Toast.show({ type: "error", text1: "Erro ao carregar sorteio" });
        return;
    }
    const data = response.data;
    setDrawerCodeFixed(data.code);
    setDrawerNameFixed(data.name ?? data.names?.[0] ?? "");
    setDrawerThemeFixed(data.theme ?? "");
    setDrawPrizeNames(data.names ?? []);
    setDrawerPrizeLiveId(data.id);
    setParticipants(data.participants ?? []);
    setWinners(data.winners ?? []);
    setCountPrizes(data.participants?.length > 0 ? 1 : 0);
};

const openEditInfoDialog = () => {
    setEditNameValue(drawerNameFixed ?? "");
    setEditThemeValue(drawerThemeFixed ?? "");
    setEditCodeValue(drawerCodeFixed ?? "");
    setShowEditInfoDialog(true);
};

const handleConfirmEditInfo = async () => {
    const nameValidation = validateDrawName(editNameValue);
    const themeValidation = validateDrawTheme(editThemeValue);
    const codeValidation = validateDrawCode(editCodeValue);

    if (!nameValidation.valid) {
        Toast.show({ type: "error", text1: NAME_ERROR_MESSAGES[nameValidation.error] });
        return;
    }
    if (!themeValidation.valid) {
        Toast.show({ type: "error", text1: NAME_ERROR_MESSAGES[themeValidation.error] });
        return;
    }
    if (!codeValidation.valid) {
        Toast.show({ type: "error", text1: NAME_ERROR_MESSAGES[codeValidation.error] });
        return;
    }

    const updates = [];
    if (nameValidation.value !== drawerNameFixed)
        updates.push(updateDrawPrizeName(drawerPrizeLiveId, nameValidation.value));
    if (themeValidation.value !== drawerThemeFixed)
        updates.push(updateDrawPrizeTheme(drawerPrizeLiveId, themeValidation.value));
    if (codeValidation.value !== drawerCodeFixed)
        updates.push(updateDrawPrizeCode(drawerPrizeLiveId, codeValidation.value));

    if (updates.length > 0) {
        const results = await Promise.all(updates);
        if (results.some((r) => r === false)) {
            Toast.show({ type: "error", text1: "Erro ao salvar, tente novamente!" });
            return;
        }
    }

    setDrawerNameFixed(nameValidation.value);
    setDrawerThemeFixed(themeValidation.value);
    setDrawerCodeFixed(codeValidation.value);
    let updated = activeDraws;
    updated = applyDrawNameEdit(updated, drawerPrizeLiveId, nameValidation.value);
    updated = applyDrawThemeEdit(updated, drawerPrizeLiveId, themeValidation.value);
    updated = applyDrawCodeEdit(updated, drawerPrizeLiveId, codeValidation.value);
    setActiveDraws(updated);
    setShowEditInfoDialog(false);
    Toast.show({ type: "success", text1: "Sorteio atualizado!" });
};

const handleConfirmEditCode = async () => {
    const validation = validateDrawCode(editCodeValue);
    if (!validation.valid) {
        Toast.show({
            type: "error",
            text1: NAME_ERROR_MESSAGES[validation.error],
        });
        return;
    }

    const response = await updateDrawPrizeCode(drawerPrizeLiveId, validation.value);
    if (response) {
        setShowEditCodeDialog(false);
        setEditCodeValue("");
        setDrawerCodeFixed(validation.value);
        setActiveDraws((prev) => applyDrawCodeEdit(prev, drawerPrizeLiveId, validation.value));
        Toast.show({
            type: "success",
            text1: "Código do sorteio atualizado!",
        });
    } else {
        Toast.show({
            type: "error",
            text1: "Erro ao atualizar código, tente novamente!",
        });
    }
};

const openEditNameDialog = (draw) => {
    setEditTargetId(draw.id);
    setEditNameValue(draw.name ?? "");
    setShowEditNameDialog(true);
};

const handleConfirmEditTheme = async () => {
    const validation = validateDrawTheme(editThemeValue);
    if (!validation.valid) {
        Toast.show({
            type: "error",
            text1: NAME_ERROR_MESSAGES[validation.error],
        });
        return;
    }

    const response = await updateDrawPrizeTheme(editThemeTargetId, validation.value);
    if (response) {
        setShowEditThemeDialog(false);
        const targetId = editThemeTargetId;
        setEditThemeTargetId(null);
        setEditThemeValue("");
        if (targetId === drawerPrizeLiveId) {
            setDrawerThemeFixed(validation.value);
        }
        setActiveDraws((prev) => applyDrawThemeEdit(prev, targetId, validation.value));
        Toast.show({
            type: "success",
            text1: "Tema do sorteio atualizado!",
        });
    } else {
        Toast.show({
            type: "error",
            text1: "Erro ao atualizar tema, tente novamente!",
        });
    }
};

const handleConfirmEditName = async () => {
    const validation = validateDrawName(editNameValue);
    if (!validation.valid) {
        Toast.show({
            type: "error",
            text1: NAME_ERROR_MESSAGES[validation.error],
        });
        return;
    }

    const response = await updateDrawPrizeName(editTargetId, validation.value);
    if (response) {
        setShowEditNameDialog(false);
        const targetId = editTargetId;
        setEditTargetId(null);
        setEditNameValue("");
        if (targetId === drawerPrizeLiveId) {
            setDrawerNameFixed(validation.value);
        }
        setActiveDraws((prev) => applyDrawNameEdit(prev, targetId, validation.value));
        Toast.show({
            type: "success",
            text1: "Nome do sorteio atualizado!",
        });
    } else {
        Toast.show({
            type: "error",
            text1: "Erro ao atualizar nome, tente novamente!",
        });
    }
};

    const handleEndDrawPrizeLive = async (hideToastMessage) => {
        const response = await CloseDrawPrizeLiveById(drawerPrizeLiveId);

        if (response) {
            setDrawerCode("");
            setDrawerCodeFixed();
            setShowAlertVisible(false);

            if (!hideToastMessage) {
                Toast.show({
                    type: "success",
                    text1: "Sorteio encerrado com sucesso!",
                });
            }
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao encerrar o sorteio, tente novamente em instantes!",
            });
        }
    };

    const handleShowParticipants = async () => {
        setLoadingParticipants(true);

        const response = await getDataUserByIds(participants);
        const fixResponse = response.map((item) => ({
            ...item,
            createdAt: item.createdAt.toDate(),
            updatedAt: item.updatedAt.toDate(),
        }));

        setLoadingParticipants(false);

        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: fixResponse,
        });
    };

   // traz os ganhadores dos sorteios  ao clicar em visualizar ganhadores
 const handleShowWinners = async () => {
    setLoadingWinners(true);

    const response = await getDrawPrizeLiveById(drawerPrizeLiveId);

    if (!response.error) {
        const winners = response.data.winners ?? [];

        const fixResponse = winners.map((item) => ({
            ...item,
            createdAt: item.createdAt?.toDate?.() ?? null,
            updatedAt: item.updatedAt?.toDate?.() ?? null,
        }));

         setLoadingWinners(false); // ?? para o loading antes de navegar

        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: fixResponse,
        });
    }  else {
        setLoadingWinners(false); // ?? para o loading em caso de erro
    }
};

    const addCountPrizes = () => {
        if (countPrizes < participants.length) {
            setCountPrizes((count) => count + 1);
        }
    };

    const removeCountPrizes = () => {
        if (countPrizes > 0) {
            setCountPrizes((count) => count - 1);
        }
    };

    //Muda o handleInitDrawPrizeLive para abrir o dialog quando já houver sorteios anteriores:
const handleInitDrawPrizeLive = async () => {
    if (countPrizes > 0) {
        setShowDrawPrizeNameDialog(true); // ?? sempre abre o dialog
    } else {
        Toast.show({
            type: "error",
            text1: "Informe a quantidade de vencedores a serem sorteados!",
        });
    }
};





   const executeDrawPrizeLive = async (prizeName) => {
    setShowDrawPrizeNameDialog(false);
    setLoadingInitDrawPrize(true);

    const responseActiveDrawPrizeLive = await getActiveDrawPrizeLive();
    const previousWinners = responseActiveDrawPrizeLive.data.winners ?? []
    const usersWinner = []

    const response = await getDataUserByIds(
        responseActiveDrawPrizeLive.data.participants,
    )
    const fixResponse = response.map((item) => ({
        ...item,
        createdAt: item.createdAt.toDate(),
        updatedAt: item.updatedAt.toDate(),
    }))

    const dataUsersPrize = buildEligibleParticipants({
        participants: fixResponse,
        previousWinners,
        logger: (message) => console.log(message),
    })

    const indicatedIds = responseActiveDrawPrizeLive.data.indicatedParticipants ?? [];
    const indicatedWinners = indicatedIds
        .map((uid) => dataUsersPrize.find((p) => p.uid === uid || p.email === uid || p.cpf === uid))
        .filter(Boolean)
        .map((p) => ({ ...p, indicated: true }));
    const indicatedUidSet = new Set(indicatedWinners.map((p) => p.uid || p.email || p.cpf));
    const poolForRandom = dataUsersPrize.filter((p) => !indicatedUidSet.has(p.uid || p.email || p.cpf));
    const randomCount = Math.max(0, countPrizes - indicatedWinners.length);

    const selectedWinners = pickRandomUniqueWinners(poolForRandom, randomCount)

    usersWinner.push(...indicatedWinners);
    usersWinner.push(...selectedWinners)

    if (usersWinner.length === 0) {
        Toast.show({
            type: "error",
            text1: "Todos os participantes já foram sorteados!",
        })
        setLoadingInitDrawPrize(false)
        return
    }

     const usersWinnerWithPrizeName = usersWinner.map((item) => ({
        ...item,
        drawName: prizeName,
    }));

    const allWinners = [...previousWinners, ...usersWinnerWithPrizeName]

    await setWinnerDrawPrizeLive(drawerPrizeLiveId, allWinners)

    // âœ… salva no histórico automaticamente
    await saveDrawPrize(prizeName,usersWinnerWithPrizeName, drawerPrizeLiveId)

    // ?? salva o novo nome no array names do Firestore
    await updateDrawPrizeLiveNames(drawerPrizeLiveId, prizeName)

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setDrawPrizeNames((prev) => [...prev, prizeName])
    setCurrentDrawPrizeName("")

    setLoadingInitDrawPrize(false)

    navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
        drawerPrizeLiveId,
        newWinnersCount: usersWinner.length,
        drawPrizeName: prizeName,
    })
}

    const handleReloadDataDrawerPrizeLive = async () => {
        setLoadingReloadDataDrawerPrizeLive(true);

        const [response] = await Promise.all([
            getActiveDrawPrizeLive(),
            loadActiveDraws(),
        ]);

        if (!response.error) {
            setDrawerCodeFixed(response.data.code);
            setDrawerPrizeLiveId(response.data.id);
            setParticipants(response.data?.participants ?? []);
            setWinners(response.data?.winners ?? []);
            setCountPrizes(response.data?.participants?.length > 0 ? 1 : 0);

            Toast.show({
                type: "success",
                text1: "Sorteio atualizado!",
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao atualizar os dados do sorteio, tente novamente em instantes!",
            });
        }

        setLoadingReloadDataDrawerPrizeLive(false);
    };

    return (
        <>
            <Container>
                 <ScrollView
                    style={{ flex: 1, width: "100%" }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: 80,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                {initialLoading ? (
                    <ActivityIndicator
                        animating
                        color="black"
                        size={50}
                        style={{ marginTop: 10 }}
                    />
                ) : (
                    <ContentDrawerPrizeLive>
                        <HeaderDrawerPrizeLive center={!drawerCodeFixed}>
                            {drawerCodeFixed && <View style={{ width: 35 }} />}
                            <Title>
                                {drawerCodeFixed
                                    ? "Sorteio Ativo"
                                    : "Informe o código do sorteio"}
                            </Title>
                            {drawerCodeFixed && (
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    <ReloadButton onPress={handleCreateNewDraw}>
                                        <Feather name="plus" size={22} color="white" />
                                    </ReloadButton>
                                    <ReloadButton onPress={handleReloadDataDrawerPrizeLive}>
                                        {loadingReloadDataDrawerPrizeLive ? (
                                            <ActivityIndicator animating color="white" />
                                        ) : (
                                            <Feather name="refresh-cw" size={22} color="white" />
                                        )}
                                    </ReloadButton>
                                </View>
                            )}
                        </HeaderDrawerPrizeLive>
                      {!drawerCodeFixed ? (
                                <>
                                    <Input
                                        label="Código do sorteio"
                                        onChange={setDrawerCode}
                                        value={drawerCode}
                                        autoCapitalize="sentences"
                                    />
                                    <Input
                                        label="Nome do sorteio"
                                        onChange={setDrawerName}
                                        value={drawerName}
                                        autoCapitalize="sentences"
                                    />
                                    <Input
                                        label="Tema do sorteio"
                                        onChange={setDrawerTheme}
                                        value={drawerTheme}
                                        autoCapitalize="sentences"
                                    />
                                </>
                            ) : (
                                <>
                                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                          <TitleCode>
                                              {drawerNameFixed ? `${drawerNameFixed}` : ""}
                                              {drawerThemeFixed ? `  •  ${drawerThemeFixed}` : ""}
                                              {`  •  ${drawerCodeFixed}`}
                                          </TitleCode>
                                          <ReloadButton onPress={openEditInfoDialog}>
                                              <Feather name="edit-2" size={16} color="white" />
                                          </ReloadButton>
                                      </View>
                                      {winners.length > 0 ? (
                                          <View style={{ width: "100%", marginTop: 4 }}>
                                              <TitleCode>Ganhadores:</TitleCode>
                                              {winners.map((winner, index) => (
                                                  <TitleCode key={index} style={{ marginTop: 2 }}>
                                                      • {winner.name ?? winner.email ?? "—"}
                                                  </TitleCode>
                                              ))}
                                          </View>
                                      ) : null}
                                </>
                            )}
                        {!drawerCodeFixed && (
                            <ButtonStartDrawerPrizeAction
                                onPress={handleStartDrawPrizeLive}
                            >
                                {loadingStartDrawPrize ? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Iniciar Sorteio
                                    </TextButtonStartDrawerStartAction>
                                )}
                            </ButtonStartDrawerPrizeAction>
                        )}
                    </ContentDrawerPrizeLive>
                )}

                {!initialLoading && activeDraws.filter((d) => d.id !== drawerPrizeLiveId).length > 0 && (
                    <ContentParticipants>
                        <TitleQuantityParticipants>
                            {drawerCodeFixed ? "Outros sorteios ativos" : "Sorteios ativos"} ({activeDraws.filter((d) => d.id !== drawerPrizeLiveId).length})
                        </TitleQuantityParticipants>
                        {activeDraws.filter((d) => d.id !== drawerPrizeLiveId).map((draw) => (
                            <View
                                key={draw.id}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    paddingVertical: 6,
                                    width: "100%",
                                }}
                            >
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => handleFocusDraw(draw)}
                                    activeOpacity={0.7}
                                >
                                    <TitleCode>
                                        {draw.name || "(sem nome)"} - {draw.code}
                                    </TitleCode>
                                    <TitleQuantityParticipants>
                                        Participantes: {draw.participantsCount} / Ganhadores: {draw.winnersCount}
                                    </TitleQuantityParticipants>
                                </TouchableOpacity>
                                <ReloadButton onPress={() => openEditNameDialog(draw)}>
                                    <Feather name="edit-2" size={18} color="white" />
                                </ReloadButton>
                            </View>
                        ))}
                    </ContentParticipants>
                )}

                {drawerCodeFixed && (
                    <>
                        <ContentParticipants>
                            <TitleQuantityParticipants>
                                Quantidade de participantes
                            </TitleQuantityParticipants>
                            <QuantityParticipants>
                                {participants.length}
                            </QuantityParticipants>
                            <ButtonViewParticipants
                                disabled={!participants.length}
                                onPress={handleShowParticipants}
                            >
                                {loadingParticipants ? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Visualizar Participantes
                                    </TextButtonStartDrawerStartAction>
                                )}
                            </ButtonViewParticipants>
                        </ContentParticipants>

                            <ContentParticipants>
                           
                            <ButtonViewParticipants
                                disabled={!participants.length}
                                onPress={handleShowWinners}
                            >
                                {loadingWinners? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Visualizar Ganhadores
                                    </TextButtonStartDrawerStartAction>
                                )}
                            </ButtonViewParticipants>
                        </ContentParticipants>

                        <CardSelection>
                            <TitleQuantityParticipants>
                                Quantos serão sorteados?
                            </TitleQuantityParticipants>
                            <QuantityParticipants>
                                {countPrizes}
                            </QuantityParticipants>
                            <ContentActionCountButtons>
                                <ActionCountButton
                                    disabled={countPrizes === 0}
                                    onPress={removeCountPrizes}
                                >
                                    <Feather
                                        name="minus"
                                        size={24}
                                        color="black"
                                    />
                                </ActionCountButton>
                                <ActionCountButton
                                    green
                                    disabled={
                                        countPrizes === participants.length
                                    }
                                    onPress={addCountPrizes}
                                >
                                    <Feather
                                        name="plus"
                                        size={24}
                                        color="black"
                                    />
                                </ActionCountButton>
                            </ContentActionCountButtons>
                        </CardSelection>

                        <ContentActionDrawerPrizeAction>
                            <ButtonInitDrawerPrizeAction
                                disabled={!participants.length}
                                onPress={handleInitDrawPrizeLive}
                            >
                                {loadingInitDrawPrize ? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Realizar Sorteio
                                    </TextButtonStartDrawerStartAction>
                                )}
                            </ButtonInitDrawerPrizeAction>
                            <ButtonEndDrawerPrizeAction
                                onPress={() => setShowAlertVisible(true)}
                            >
                                <TextButtonStartDrawerStartAction>
                                    Encerrar Sorteio
                                </TextButtonStartDrawerStartAction>
                            </ButtonEndDrawerPrizeAction>
                        </ContentActionDrawerPrizeAction>
                    </>
                )}
                </ScrollView>
            </Container>
            <DialogComponent
                visible={showAlertVisible}
                title="Encerrar Sorteio?"
                text="Ao encerrar o sorteio, será necessário gerar um novo sorteio!"
                textActionButton="Encerrar Sorteio"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={handleEndDrawPrizeLive}
                dismissable={false}
            />
              <DrawPrizeNameDialog
                visible={showDrawPrizeNameDialog}
                title="Nome do Sorteio"
                text="Informe o nome deste sorteio!"
                textActionButton="Sortear"
                hideDialog={() => setShowDrawPrizeNameDialog(false)}
                actionButton={() => executeDrawPrizeLive(currentDrawPrizeName)}
                dismissable={false}
                inputValue={currentDrawPrizeName}
                actionInputValue={setCurrentDrawPrizeName}
            />
            <Portal>
                <Dialog visible={showEditInfoDialog} onDismiss={() => setShowEditInfoDialog(false)} dismissable={false}>
                    <Dialog.Title>Editar Sorteio</Dialog.Title>
                    <Dialog.Content>
                        <InputNoMask
                            label="Nome"
                            onChange={setEditNameValue}
                            value={editNameValue}
                            autoCapitalize="sentences"
                        />
                        <InputNoMask
                            label="Tema"
                            onChange={setEditThemeValue}
                            value={editThemeValue}
                            autoCapitalize="sentences"
                        />
                        <InputNoMask
                            label="Código"
                            onChange={setEditCodeValue}
                            value={editCodeValue}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleConfirmEditInfo}>Salvar</Button>
                        <Button onPress={() => setShowEditInfoDialog(false)}>Cancelar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <DrawPrizeNameDialog
                visible={showEditNameDialog}
                title="Editar Nome do Sorteio"
                text="Informe o novo nome para este sorteio!"
                textActionButton="Salvar"
                hideDialog={() => setShowEditNameDialog(false)}
                actionButton={handleConfirmEditName}
                dismissable={false}
                inputValue={editNameValue}
                actionInputValue={setEditNameValue}
            />

        </>

    );
};
