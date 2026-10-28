import React, { useState, useEffect } from "react";
import { FlatList, RefreshControl, Text, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import Toast from "react-native-toast-message";

import { getAllOrdersByYear } from "../../../controllers/Payment/order";
import { getCurrentYear } from "../../../utils/convertDate";
import { convertToMoney } from "../../../utils/convertToMoney";
import { BoxShadowIos } from "../../../styles/IosShadow";
import { buildAdminPublicationWhatsAppUrl } from "../../../utils/adminPublicationWhatsApp";

import {
    Container,
    ChartContainer,
    ChartTitle,
    Card,
    UserInfo,
    UserName,
    UserEmail,
    PaymentValue,
    WhatsAppButton,
} from "./styles";

export const Publications = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusBreakdown, setStatusBreakdown] = useState({});
    const [waitingOrders, setWaitingOrders] = useState([]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const year = getCurrentYear();
            const result = await getAllOrdersByYear(year);

            if (!result.error) {
                const orders = result.data || [];
                
                // Compute statusBreakdown
                const breakdown = {};
                orders.forEach((order) => {
                    const status = order?.status || "unknown";
                    breakdown[status] = (breakdown[status] || 0) + 1;
                });
                setStatusBreakdown(breakdown);

                // Filter waiting orders
                const waiting = orders.filter(order => order.status === "waiting");
                setWaitingOrders(waiting);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Erro",
                    text2: "Não foi possível carregar as publicações.",
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Erro inesperado",
                text2: "Tente novamente mais tarde.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleWhatsApp = async (order) => {
        const url = buildAdminPublicationWhatsAppUrl(order);

        if (!url) {
            Toast.show({
                type: "error",
                text1: "Telefone não disponível.",
            });
            return;
        }

        try {
            await Linking.openURL(url);
        } catch {
            Toast.show({
                type: "error",
                text1: "Não foi possível abrir o WhatsApp.",
            });
        }
    };

    const renderChart = () => {
        if (Object.keys(statusBreakdown).length === 0) return null;

        const chartData = Object.entries(statusBreakdown).map(([status, count]) => ({
            value: count,
            label: status,
            frontColor: "#e85d22",
            topLabelComponent: () => (
                <Text style={{ fontSize: 10, color: "#94a3b8", fontWeight: "bold", textAlign: "center", marginBottom: 4 }}>
                    {count}
                </Text>
            ),
        }));

        return (
            <ChartContainer style={BoxShadowIos}>
                <ChartTitle>Status dos Pedidos</ChartTitle>
                <BarChart
                    data={chartData}
                    barWidth={32}
                    barBorderRadius={4}
                    spacing={20}
                    labelWidth={60}
                    hideRules
                    yAxisTextStyle={{ color: "#94a3b8", fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: "#1e2d3d", fontSize: 11 }}
                    yAxisColor="#e2e8f0"
                    xAxisColor="#e2e8f0"
                    noOfSections={3}
                    height={120}
                    isAnimated
                    animationDuration={500}
                    initialSpacing={16}
                    endSpacing={16}
                />
            </ChartContainer>
        );
    };

    return (
        <Container>
            <FlatList
                data={waitingOrders}
                keyExtractor={(item) => item.idOrder || Math.random().toString()}
                ListHeaderComponent={renderChart}
                contentContainerStyle={{ paddingBottom: 24 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={loadData} />
                }
                renderItem={({ item }) => (
                    <Card style={BoxShadowIos}>
                        <UserInfo>
                            <UserName>
                                {item?.user?.name || "Sem Nome"} {item?.user?.surname || ""}
                            </UserName>
                            <UserEmail>{item?.user?.email || "Sem Email"}</UserEmail>
                            <PaymentValue>
                                R$ {convertToMoney(Number(item?.paymentValue || 0))}
                            </PaymentValue>
                        </UserInfo>
                        {buildAdminPublicationWhatsAppUrl(item) && (
                            <WhatsAppButton onPress={() => handleWhatsApp(item)}>
                                <Feather name="message-circle" size={24} color="#fff" />
                            </WhatsAppButton>
                        )}
                    </Card>
                )}
            />
        </Container>
    );
};
