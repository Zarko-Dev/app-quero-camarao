import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { CardOrder } from "./components/CardOrder";
import { CardOrderSkeleton } from "../../components/Skeleton/CardOrderSkeleton";

import { getAllUserOrders } from "../../controllers/Payment/order";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import shrimpIcon from "../../assets/images/shrimpIcon.png";

import {
    Container,
    ContentArea,
    EmptyContainer,
    EmptyText,
    HeaderSubtitle,
    HeaderTitle,
    HeaderTitleContainer,
    HeaderTopRow,
    ProfileIconContainer,
    ScreenHeader,
    ShrimpIconHeader,
} from "./styles";

export const PaymentOrders = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [dataOrders, setDataOrders] = useState([]);
    const dataSkeleton = [1, 2, 3, 4, 5];

    useFocusEffect(
        useCallback(() => {
            const getOrders = async () => {
                try {
                    setIsLoading(true);

                    const dataUser = await GetUserStorage();
                    if (!dataUser?.email) {
                        setDataOrders([]);
                        Toast.show({
                            type: "error",
                            text1: "Usuário não encontrado!",
                            text2: "Faça login novamente.",
                        });
                        return;
                    }

                    const orders = await getAllUserOrders(dataUser.email);
                    const list = Array.isArray(orders?.data) ? orders.data : [];
                    setDataOrders(list);

                    if (list.length === 0) {
                        Toast.show({
                            type: "info",
                            text1: "Não há pagamentos a serem listados!",
                        });
                    }
                } catch (error) {
                    console.error("PaymentOrders error:", error);
                    setDataOrders([]);
                    Toast.show({
                        type: "error",
                        text1: "Erro ao carregar pagamentos!",
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            getOrders();
        }, [reload]),
    );

    return (
        <Container>
            <ScreenHeader>
                <HeaderTopRow>
                    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                        <Feather name="menu" size={28} color="white" />
                    </TouchableOpacity>

                    <HeaderTitleContainer>
                        <HeaderTitle>Meus Pagamentos</HeaderTitle>
                        <HeaderSubtitle>
                            Histórico de transações
                        </HeaderSubtitle>
                    </HeaderTitleContainer>

                    <ProfileIconContainer>
                        <ShrimpIconHeader source={shrimpIcon} resizeMode="contain" />
                    </ProfileIconContainer>
                </HeaderTopRow>
            </ScreenHeader>

            <ContentArea>
                {isLoading ? (
                    dataSkeleton.map((item) => <CardOrderSkeleton key={item} />)
                ) : (
                    <FlatList
                        data={dataOrders}
                        renderItem={({ item }) => (
                            <CardOrder
                                data={item}
                                reload={reload}
                                reloadAction={setReload}
                            />
                        )}
                        keyExtractor={(item) => item.idOrder}
                        contentContainerStyle={{ paddingBottom: 20, gap: 6 }}
                        ListEmptyComponent={
                            <EmptyContainer>
                                <MaterialCommunityIcons
                                    name="cash-remove"
                                    size={56}
                                    color="#cccccc"
                                />
                                <EmptyText>Nenhum pagamento encontrado.</EmptyText>
                            </EmptyContainer>
                        }
                    />
                )}
            </ContentArea>
        </Container>
    );
};
