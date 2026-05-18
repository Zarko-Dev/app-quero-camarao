import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { FlatList, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { getAllDrawPrizes } from "../../../controllers/DrawPrizes/get";
import { convertDate } from "../../../utils/convertDate";
import { dataRoutes } from "../../../routes/dataRoutes";

import {
    BackButton,
    BadgerDawerPrizeType,
    CardContent,
    CardIconBox,
    CardSubtitle,
    CardTitle,
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

const CardDrawPrise = ({ data }) => {
    const navigation = useNavigation();
    const isLive = !!data?.drawerPrizeLiveId;

    const hadleRedirectDrawPrizeWinners = () => {
        navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
            drawPrizeId: data.id,
            usersWinner: data.usersWinner,
            showOnlyResults: true,
            drawerPrizeLiveId: null,
            newWinnersCount: null,
        });
    };

    return (
        <ContainerCardDrawPrize onPress={hadleRedirectDrawPrizeWinners}>
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

    const handleNewDrawPrize = () => {
        navigation.navigate(dataRoutes.admin.drawPrizeSelect);
    };

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                const resultDrawPrizes = await getAllDrawPrizes();

                if (resultDrawPrizes.length === 0) {
                    Toast.show({
                        type: "info",
                        text1: "Nao ha sorteios a serem listados!",
                    });
                }

                setDrawPrizes(resultDrawPrizes);
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
            {!isLoading ? (
                <FlatList
                    data={drawPrizes}
                    renderItem={({ item }) => <CardDrawPrise data={item} />}
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
