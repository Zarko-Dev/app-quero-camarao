/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */

import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useCallback, useState, useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

import { getApprovedOrdersByYear } from "../../../controllers/Payment/order";
import { getAdminDashboardMetrics } from "../../../controllers/Admin/metrics";
import { convertToMoney } from "../../../utils/convertToMoney";
import {
    getCurrentExtendedMonth,
    getCurrentYear,
} from "../../../utils/convertDate";

import SelectComponent from "../../../components/SelectComponent";
import CardTransaction from "./components/CardTransaction";
import Skeleton from "./components/Skeleton";

import {
    Container,
    ContainerCardInfoValue,
    ContainerDropdownSelects,
    ContainerValueMonth,
    ContentInputSelect,
    ContentMonthInfo,
    ContentTextLeft,
    ContentTextMonthInfo,
    ContentTextRight,
    ContentTextYearlyInfo,
    ContentYearlyInfo,
    Divider,
    FilterButton,
    FilterText,
    ImageYearlyInfo,
    SubtitleMonthInfo,
    SubtitleYearlyInfo,
    TitleLastMoth,
    TitleMonthInfo,
    TitleNextMoth,
    TitleTransaction,
    TitleYearlyInfo,
    TransactionHeader,
    ScreenHeader,
    ContentList
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";

import ShrimpIcon from "../../../assets/images/shrimpIcon.png";

const withTimeout = (promise, ms = 30000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("ADMIN_HOME_TIMEOUT")), ms),
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

const monthNameToIndex = (month) => {
    const months = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
    ];

    return months.indexOf(String(month || "").toLowerCase());
};

const getMonthLabel = (date) =>
    new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);

const sumPayment = (orders) =>
    (orders || []).reduce(
        (total, order) => total + Number(order?.paymentValue || 0),
        0,
    );

const filterByMonthYear = (orders, monthLabel, year) =>
    (orders || []).filter((order) => {
        const date = order?.createdAt;
        if (!(date instanceof Date)) return false;

        return (
            getMonthLabel(date) === String(monthLabel || "").toLowerCase() &&
            date.getFullYear() === Number(year)
        );
    });

export const Home = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [monthOptions, setMonthOptions] = useState([]);
    const [currentMonth, setCurrentMonth] = useState("");
    const [yearOptions, setYearOptions] = useState([]);
    const [currentYear, setCurrentYear] = useState("");
    const [dataOriginalOrders, setDataOriginalOrders] = useState([]);
    const [dataOrders, setDataOrders] = useState([]);
    const [monthlyEarnings, setMonthlyEarnings] = useState(0);
    const [yearlyEarnings, setYearlyEarnings] = useState(0);
    const [previousMonthValue, setPreviousMonthValue] = useState(0);
    const [nextMonthValue, setNextMonthValue] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [dashboardMonthlyRevenue, setDashboardMonthlyRevenue] = useState(0);
    const [statusBreakdown, setStatusBreakdown] = useState({});

    const setMonthYearOptions = (orders, fallbackMonth, fallbackYear) => {
        const allDates = (orders || []).map((item) => item.createdAt);

        if (allDates.length === 0) {
            setMonthOptions([fallbackMonth]);
            setYearOptions([fallbackYear]);
            return;
        }

        const mappedMonths = allDates.map((date) => {
            const label = getMonthLabel(date);
            return label.charAt(0).toUpperCase() + label.slice(1);
        });
        const mappedYears = allDates.map((date) => date.getFullYear());

        setMonthOptions([...new Set(mappedMonths)]);
        setYearOptions([...new Set(mappedYears)]);
    };

    const applyCalculatedState = (orders, selectedMonth, selectedYear) => {
        const monthOrders = filterByMonthYear(
            orders,
            selectedMonth,
            selectedYear,
        );

        const monthIndex = monthNameToIndex(selectedMonth);
        const prevDate = new Date(Number(selectedYear), monthIndex - 1, 1);
        const nextDate = new Date(Number(selectedYear), monthIndex + 1, 1);

        const previousMonthOrders = filterByMonthYear(
            orders,
            getMonthLabel(prevDate),
            prevDate.getFullYear(),
        );
        const nextMonthOrders = filterByMonthYear(
            orders,
            getMonthLabel(nextDate),
            nextDate.getFullYear(),
        );

        setDataOrders(monthOrders);
        setMonthlyEarnings(sumPayment(monthOrders));
        setYearlyEarnings(sumPayment(orders));
        setPreviousMonthValue(sumPayment(previousMonthOrders));
        setNextMonthValue(sumPayment(nextMonthOrders));
    };

    const applyYearData = (orders, selectedYear) => {
        const month = getCurrentExtendedMonth();

        setCurrentMonth(month);
        setCurrentYear(selectedYear);
        setDataOriginalOrders(orders);
        setMonthYearOptions(orders, month, selectedYear);
        applyCalculatedState(orders, month, selectedYear);
    };

    useEffect(() => {
            let isActive = true;
            setIsLoading(true);

            const loadAdminData = async () => {
                const selectedYear = getCurrentYear();

                try {
                    const [metricsResult, ordersResult] = await Promise.all([
                        executeWithRetry(() =>
                            withTimeout(getAdminDashboardMetrics(), 30000),
                        ),
                        executeWithRetry(() =>
                            withTimeout(
                                getApprovedOrdersByYear(selectedYear),
                                30000,
                            ),
                        ),
                    ]);

                    if (!isActive) return;

                    if (!metricsResult.error) {
                        setTotalRevenue(metricsResult.data?.totalRevenue || 0);
                        setDashboardMonthlyRevenue(
                            metricsResult.data?.monthlyRevenue || 0,
                        );
                        setStatusBreakdown(
                            metricsResult.data?.statusBreakdown || {},
                        );
                    }

                    if (ordersResult.error) {
                        Toast.show({
                            type: "error",
                            text1: "Erro ao carregar Admin",
                            text2:
                                ordersResult?.message ||
                                "Falha na consulta do Firestore",
                        });
                        applyYearData([], selectedYear);
                        return;
                    }

                    applyYearData(ordersResult.data || [], selectedYear);
                } catch (error) {
                    if (!isActive) return;

                    Toast.show({
                        type: "error",
                        text1: "Erro ao carregar Admin",
                        text2:
                            error?.message === "ADMIN_HOME_TIMEOUT"
                                ? "Tempo limite da consulta."
                                : error?.message || "Erro inesperado",
                    });

                    applyYearData([], selectedYear);
                } finally {
                    if (isActive) setIsLoading(false);
                }
            };

            loadAdminData();
            
            return () => {
            isActive = false;
        };
    }, []);

    const handleSelectMonth = async (dataMonth) => {
        setCurrentMonth(dataMonth);
        applyCalculatedState(dataOriginalOrders, dataMonth, currentYear);
    };

    const handleSelectYear = async (dataYear) => {
        setIsLoading(true);

        try {
            const selectedYear = Number(dataYear);
            const [metricsResult, result] = await Promise.all([
                executeWithRetry(() =>
                    withTimeout(getAdminDashboardMetrics(), 30000),
                ),
                executeWithRetry(() =>
                    withTimeout(
                        getApprovedOrdersByYear(selectedYear),
                        30000,
                    ),
                ),
            ]);

            if (!metricsResult.error) {
                setTotalRevenue(metricsResult.data?.totalRevenue || 0);
                setDashboardMonthlyRevenue(
                    metricsResult.data?.monthlyRevenue || 0,
                );
                setStatusBreakdown(metricsResult.data?.statusBreakdown || {});
            }

            if (!result.error) {
                setCurrentYear(selectedYear);
                setDataOriginalOrders(result.data || []);
                setMonthYearOptions(result.data || [], currentMonth, selectedYear);
                applyCalculatedState(result.data || [], currentMonth, selectedYear);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return !isLoading ? (
        <Container>
            <ScreenHeader>
                <ContainerDropdownSelects>
                    <ContentInputSelect>
                        <SelectComponent
                            initialTitle={currentMonth}
                            options={monthOptions}
                            action={handleSelectMonth}
                            icon={<Feather name="calendar" size={18} color="#e85d22" />}
                            style={{ backgroundColor: "#fff", borderRadius: 12 }}
                        />
                    </ContentInputSelect>
                    <ContentInputSelect>
                        <SelectComponent
                            initialTitle={currentYear}
                            options={yearOptions}
                            action={handleSelectYear}
                            icon={<Feather name="calendar" size={18} color="#e85d22" />}
                            style={{ backgroundColor: "#fff", borderRadius: 12 }}
                        />
                    </ContentInputSelect>
                </ContainerDropdownSelects>
            </ScreenHeader>
            <ContentList>
                <ContainerCardInfoValue style={BoxShadowIos}>
                    <LinearGradient
                        colors={["#ff932f", "#f36b12"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 14, padding: 18 }}
                    >
                        <ContentYearlyInfo>
                            <ContentTextYearlyInfo>
                                <TitleYearlyInfo>Receita Total</TitleYearlyInfo>
                                <SubtitleYearlyInfo>
                                    R$ {convertToMoney(totalRevenue || yearlyEarnings)}
                                </SubtitleYearlyInfo>
                            </ContentTextYearlyInfo>
                            <ImageYearlyInfo source={ShrimpIcon} />
                        </ContentYearlyInfo>
                        <ContentMonthInfo>
                            <ContentTextMonthInfo>
                                <TitleMonthInfo>Receita Mensal</TitleMonthInfo>
                                <SubtitleMonthInfo>
                                    R$ {convertToMoney(dashboardMonthlyRevenue || monthlyEarnings)}
                                </SubtitleMonthInfo>
                            </ContentTextMonthInfo>
                        </ContentMonthInfo>
                    </LinearGradient>
                </ContainerCardInfoValue>
                <ContainerValueMonth>
                    <ContentTextLeft>
                        <TitleLastMoth>Mês passado</TitleLastMoth>
                        <TitleNextMoth>
                            R$ {convertToMoney(previousMonthValue)}
                        </TitleNextMoth>
                    </ContentTextLeft>
                    <Divider />
                    <ContentTextRight>
                        <TitleLastMoth align>Próximo mês</TitleLastMoth>
                        <TitleNextMoth align>
                            R$ {convertToMoney(nextMonthValue)}
                        </TitleNextMoth>
                    </ContentTextRight>
                </ContainerValueMonth>
                <TransactionHeader>
                    <TitleTransaction>Transações</TitleTransaction>
                </TransactionHeader>
                <FlatList
                    data={dataOrders}
                    renderItem={({ item }) => <CardTransaction item={item} />}
                    keyExtractor={(item) => item.idOrder}
                    style={{ width: "100%", minHeight: 100 }}
                    contentContainerStyle={{ paddingBottom: 22, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>Nenhuma transação no mês de {currentMonth}.</Text>
                        </View>
                    )}
                    refreshing={isLoading}
                    onRefresh={() => {
                        setIsLoading(true);
                        const selectedYear = getCurrentYear();
                        Promise.all([
                            executeWithRetry(() => withTimeout(getAdminDashboardMetrics(), 30000)),
                            executeWithRetry(() => withTimeout(getApprovedOrdersByYear(selectedYear), 30000)),
                        ])
                            .then(([metricsResult, ordersResult]) => {
                                if (!metricsResult.error) {
                                    setTotalRevenue(metricsResult.data?.totalRevenue || 0);
                                    setDashboardMonthlyRevenue(metricsResult.data?.monthlyRevenue || 0);
                                    setStatusBreakdown(metricsResult.data?.statusBreakdown || {});
                                }
                                applyYearData(ordersResult.data || [], selectedYear);
                            })
                            .finally(() => setIsLoading(false));
                    }}
                />
            </ContentList>
        </Container>
    ) : (
        <Skeleton />
    );
};
