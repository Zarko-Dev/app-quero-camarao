import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FlatList } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { getAllDrawPrizes } from "../../../controllers/DrawPrizes/get";
import { convertDate } from "../../../utils/convertDate";
import { dataRoutes } from "../../../routes/dataRoutes";

import {
    BadgerDawerPrizeType,
    CardSubtitle,
    CardTitle,
    Container,
    ContainerCardDrawPrize,
    HeaderCard,
    TitleBadge,
} from "./styles";

const CardDrawPrise = ({ data }) => {
    const navigation = useNavigation();

    const hadleRedirectDrawPrizeWinners = () => {
        console.log('data:', JSON.stringify(data, null, 2)); // 👈
        console.log('usersWinner:', data.usersWinner); // 👈

        navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
            drawPrizeId: data.id,
            usersWinner: data.usersWinner,
            showOnlyResults: true,
            drawerPrizeLiveId: null, // 👈 força null para não buscar do Firestore
            newWinnersCount: null,
        });
    };

    return (
        <ContainerCardDrawPrize onPress={hadleRedirectDrawPrizeWinners}>
            <HeaderCard>
                <CardTitle>{data.drawPrizeName}</CardTitle>
                <BadgerDawerPrizeType>
                    <TitleBadge>
                        {data?.drawerPrizeLiveId ? "Ao Vivo" : "Geral"}
                    </TitleBadge>
                </BadgerDawerPrizeType>
            </HeaderCard>
            <CardSubtitle>
                Realizado em: {convertDate(data.createdAt)}
            </CardSubtitle>
        </ContainerCardDrawPrize>
    );
};

export const DrawPrizeHistory = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [drawPrizes, setDrawPrizes] = useState([]);

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
                setIsLoading(false);
            };

            setIsLoading(true);

            getData();
        }, []),
    );

    return (
        <Container>
            {!isLoading ? (
                <FlatList
                    data={drawPrizes}
                    renderItem={({ item }) => <CardDrawPrise data={item} />}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <ActivityIndicator
                    animating
                    color="black"
                    size={52}
                    style={{ marginTop: "30%" }}
                />
            )}
        </Container>
    );
};
