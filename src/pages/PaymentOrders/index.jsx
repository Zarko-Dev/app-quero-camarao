import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import Toast from "react-native-toast-message";

import { CardOrder } from "./components/CardOrder";
import { CardOrderSkeleton } from "../../components/Skeleton/CardOrderSkeleton";

import { getAllUserOrders } from "../../controllers/Payment/order";
import { GetUserStorage } from "../../services/Storage/UserStorage";

import { Container } from "./styles";

export const PaymentOrders = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [dataOrders, setDataOrders] = useState([]);
    const dataSkeleton = [1, 2, 3, 4, 5];

    useFocusEffect(
        useCallback(() => {
            const getOrders = async () => {
                setIsLoading(true);

                const dataUser = await GetUserStorage();
                const orders = await getAllUserOrders(dataUser.email);
                setDataOrders(orders.data);

                if (orders.data.length === 0) {
                    Toast.show({
                        type: "info",
                        text1: "Não há pagamentos a serem listados!",
                    });
                }

                setIsLoading(false);
            };

            getOrders();
        }, [reload]),
    );

    return (
        <Container>
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
                />
            )}
        </Container>
    );
};
