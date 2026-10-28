import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Alert, FlatList, View } from "react-native";
import { ActivityIndicator, Checkbox } from "react-native-paper";
import Toast from "react-native-toast-message";

import { getAllDrawPrizes } from "../../../controllers/DrawPrizes/get";
import { deleteDrawPrizes } from "../../../controllers/DrawPrizes/delete";
import { convertDate } from "../../../utils/convertDate";
import { dataRoutes } from "../../../routes/dataRoutes";
import {
    areAllDrawPrizeSelectionsSelected,
    toggleAllDrawPrizeSelections,
    toggleDrawPrizeSelection,
} from "../../../utils/drawPrizeSelection";

import {
    ActionBar,
    ActionButton,
    ActionButtonText,
    BackButton,
    BadgerDawerPrizeType,
    CardContent,
    CardIconBox,
    CardSubtitle,
    CardTitle,
    CardSelectionBox,
    ChevronBox,
    Container,
    ContainerCardDrawPrize,
    DateRow,
    DateText,
    Footer,
    HeaderBack,
    HeaderCard,
    HeaderSubtitle,
    HeaderTitle,
    HeaderTitleWrap,
    NewDrawButton,
    NewDrawButtonText,
    TitleBadge,
} from "./styles";

const CardDrawPrise = ({
    data,
    selectionMode,
    selected,
    onToggleSelect,
}) => {
    const navigation = useNavigation();
    const isLive = !!data?.drawerPrizeLiveId;

    const hadleRedirectDrawPrizeWinners = () => {
        if (selectionMode) {
            onToggleSelect(data.id);
            return;
        }

        navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
            drawPrizeId: data.id,
            usersWinner: data.usersWinner,
            showOnlyResults: true,
            drawerPrizeLiveId: null,
            newWinnersCount: null,
        });
    };

    return (
        <ContainerCardDrawPrize
            onPress={hadleRedirectDrawPrizeWinners}
            selected={selected}
        >
            <CardSelectionBox>
                <Checkbox.Android
                    status={selected ? "checked" : "unchecked"}
                    onPress={() => onToggleSelect(data.id)}
                />
            </CardSelectionBox>
            <CardIconBox>
                <Feather name="clipboard" size={25} color="#bf756c" />
            </CardIconBox>
            <CardContent>
                <HeaderCard>
                    <CardTitle numberOfLines={1}>{data.drawPrizeName}</CardTitle>
                    <BadgerDawerPrizeType live={isLive}>
                        <TitleBadge>{isLive ? "Ao Vivo" : "Geral"}</TitleBadge>
                    </BadgerDawerPrizeType>
                </HeaderCard>
                <CardSubtitle>Realizado em:</CardSubtitle>
                <DateRow>
                    <Feather name="calendar" size={12} color="#bf756c" />
                    <DateText>{convertDate(data.createdAt)}</DateText>
                </DateRow>
            </CardContent>
            <ChevronBox>
                <Feather name="chevron-right" size={20} color="#4e6a83" />
            </ChevronBox>
        </ContainerCardDrawPrize>
    );
};

export const DrawPrizeHistory = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [drawPrizes, setDrawPrizes] = useState([]);
    const [selectedDrawPrizeIds, setSelectedDrawPrizeIds] = useState([]);
    const selectableDrawPrizeIds = drawPrizes.map((drawPrize) => drawPrize.id);
    const hasSelection = selectedDrawPrizeIds.length > 0;
    const allSelected = areAllDrawPrizeSelectionsSelected(
        selectableDrawPrizeIds,
        selectedDrawPrizeIds,
    );

    const handleNewDrawPrize = () => {
        navigation.navigate(dataRoutes.admin.drawPrizeSelect);
    };

    const clearSelection = () => {
        setSelectedDrawPrizeIds([]);
    };

    const handleToggleSelect = (drawPrizeId) => {
        setSelectedDrawPrizeIds((current) =>
            toggleDrawPrizeSelection(current, drawPrizeId),
        );
    };

    const handleToggleSelectAll = () => {
        setSelectedDrawPrizeIds((current) =>
            toggleAllDrawPrizeSelections(selectableDrawPrizeIds, current),
        );
    };

    const handleDeleteSelected = () => {
        if (!hasSelection) return;

        Alert.alert(
            "Excluir sorteios",
            `Deseja ocultar ${selectedDrawPrizeIds.length} sorteio${selectedDrawPrizeIds.length !== 1 ? "s" : ""} da lista?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        const result = await deleteDrawPrizes(selectedDrawPrizeIds);

                        if (result) {
                            setDrawPrizes((current) =>
                                current.filter(
                                    (item) => !selectedDrawPrizeIds.includes(item.id),
                                ),
                            );
                            clearSelection();
                            Toast.show({
                                type: "success",
                                text1: "Sorteios ocultados da lista!",
                            });
                        } else {
                            Toast.show({
                                type: "error",
                                text1: "Não foi possível ocultar os sorteios.",
                            });
                        }
                    },
                },
            ],
        );
    };

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                const resultDrawPrizes = await getAllDrawPrizes();

                if (resultDrawPrizes.length === 0) {
                    Toast.show({
                        type: "info",
                        text1: "Não há sorteios a serem listados!",
                    });
                }

                setDrawPrizes(resultDrawPrizes);
                clearSelection();
                setIsLoading(false);
            };

            setIsLoading(true);

            getData();
        }, []),
    );

    return (
        <Container>
            <HeaderBack>
                <BackButton onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={20} color="#5f7b94" />
                </BackButton>
                <HeaderTitleWrap>
                    <HeaderTitle>Historico de Sorteio</HeaderTitle>
                    <HeaderSubtitle>Gerencie seus sorteios</HeaderSubtitle>
                </HeaderTitleWrap>
            </HeaderBack>
            <ActionBar>
                <ActionButton
                    onPress={handleToggleSelectAll}
                    disabled={drawPrizes.length === 0}
                >
                    <Feather name={allSelected ? "square" : "check-square"} size={16} color="#ffffff" />
                    <ActionButtonText>
                        {allSelected ? "Desmarcar todos" : "Selecionar todos"}
                    </ActionButtonText>
                </ActionButton>
                <ActionButton
                    danger
                    onPress={hasSelection ? handleDeleteSelected : undefined}
                    disabled={!hasSelection}
                >
                    <Feather name="trash-2" size={16} color="#ffffff" />
                    <ActionButtonText>
                        Excluir{hasSelection ? ` (${selectedDrawPrizeIds.length})` : ""}
                    </ActionButtonText>
                </ActionButton>
            </ActionBar>
            {!isLoading ? (
                <FlatList
                    data={drawPrizes}
                    extraData={selectedDrawPrizeIds}
                    renderItem={({ item }) => (
                        <CardDrawPrise
                            data={item}
                            selectionMode={hasSelection}
                            selected={selectedDrawPrizeIds.includes(item.id)}
                            onToggleSelect={handleToggleSelect}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={<View style={{ height: 12 }} />}
                />
            ) : (
                <ActivityIndicator
                    animating
                    color="#36536e"
                    size={52}
                    style={{ marginTop: "30%" }}
                />
            )}
            <Footer>
                <NewDrawButton onPress={handleNewDrawPrize}>
                    <Feather name="plus-circle" size={18} color="#ffffff" />
                    <NewDrawButtonText>Novo Sorteio</NewDrawButtonText>
                </NewDrawButton>
            </Footer>
        </Container>
    );
};
