/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import Toast from "react-native-toast-message";

import { getAllApprovedOrders } from "../../../controllers/Payment/order";
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
    ContainerDropdowSelects,
    ContainerValueMonth,
    ContentInputSelect,
    ContentMonthInfo,
    ContentTextLeft,
    ContentTextMonthInfo,
    ContenttextRight,
    ContentTextYearlyInfo,
    ContentYearlyInfo,
    Divider,
    ImageYearlyInfo,
    SubtitleMonthInfo,
    SubtitleYearlyInfo,
    TitleLastMoth,
    TitleMonthInfo,
    TitleNextMoth,
    TitleTransaction,
    TitleYearlyInfo,
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";

import ShrimpIcon from "../../../assets/images/shrimpIcon.png";

export const Home = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [monthOptions, setMonthOptions] = useState([]);
    const [currentMonth, setCurrentMonth] = useState("");
    const [yearOptions, setYearOptions] = useState([]);
    const [currentYear, setCurrentYear] = useState("");
    const [dataOriginalOrders, setDataOriginalOrders] = useState();
    const [dataOrders, setDataOrders] = useState();
    const [monthlyEarnings, setMonthlyEarnings] = useState(0);
    const [yearlyEarnings, setYearlyEarnings] = useState(0);
    const [previousMonthValue, setPreviousMonthValue] = useState(0);
    const [nextMonthValue, setNextMonthValue] = useState(0);

    const setAllDataMonth = (dataMonth) => {
        setMonthOptions([...new Set(dataMonth)]);
    };

    const setAllDataYear = (dataYear) => {
        setYearOptions([...new Set(dataYear)]);
    };

    const getMonthlyEarnings = (orders) => {
        let dataPayValues = 0;

        orders.map((order) => {
            dataPayValues += order.paymentValue;

            return null;
        });

        setMonthlyEarnings(dataPayValues);
    };

    const getYearlyEarnings = (originalOrders, selectedYear) => {
        let dataPayValues = 0;

        const yearlyOrders = originalOrders.filter((dataObject) => {
            const dateObject = dataObject.createdAt;
            const dateYear = dateObject.getFullYear();

            return dateYear === selectedYear;
        });

        yearlyOrders.map((order) => {
            dataPayValues += order.paymentValue;

            return null;
        });

        setYearlyEarnings(dataPayValues);
    };

    const getPreviousMonthValue = (originalOrders, order) => {
        let dataPayValues = 0;

        const previousMonth = new Date(
            order.createdAt.getFullYear(),
            order.createdAt.getMonth(),
            1,
        );

        previousMonth.setDate(Math.min(order.createdAt.getDate(), 0));

        const previousMonthName = new Intl.DateTimeFormat("pt-BR", {
            month: "long",
        }).format(previousMonth);

        const previousMonthOrders = originalOrders.filter((dataObject) => {
            const dateObject = dataObject.createdAt;
            const dateMonth = new Intl.DateTimeFormat("pt-BR", {
                month: "long",
            }).format(dateObject);

            return dateMonth === previousMonthName;
        });

        previousMonthOrders.map((orderValues) => {
            dataPayValues += orderValues.paymentValue;

            return null;
        });

        setPreviousMonthValue(dataPayValues);
    };

    const getNextMonthValue = (originalOrders, order) => {
        let dataPayValues = 0;

        const currentDate = order?.createdAt || new Date();

        const nextMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1,
        );

        nextMonth.setDate(
            Math.min(
                currentDate.getDate(),
                new Date(
                    nextMonth.getFullYear(),
                    nextMonth.getMonth() + 1,
                    0,
                ).getDate(),
            ),
        );

        const nextMonthName = new Intl.DateTimeFormat("pt-BR", {
            month: "long",
        }).format(nextMonth);

        const nextMonthOrders = originalOrders.filter((dataObject) => {
            const dateObject = dataObject.createdAt;
            const dateMonth = new Intl.DateTimeFormat("pt-BR", {
                month: "long",
            }).format(dateObject);

            return dateMonth === nextMonthName;
        });

        nextMonthOrders.map((orderValues) => {
            dataPayValues += orderValues.paymentValue;

            return null;
        });

        setNextMonthValue(dataPayValues);
    };

    const filterDataOrders = (orders, selectedMonth, selectedYear) => {
        const newOrders = orders?.filter((dataObject) => {
            const dateObject = dataObject.createdAt;
            const dateMonth = new Intl.DateTimeFormat("pt-BR", {
                month: "long",
            }).format(dateObject);
            const dateYear = dateObject.getFullYear();

            return (
                dateMonth === selectedMonth.toLowerCase() &&
                dateYear === selectedYear
            );
        });

        getMonthlyEarnings(newOrders);
        getYearlyEarnings(orders, selectedYear);
        getPreviousMonthValue(orders, newOrders[0]);
        getNextMonthValue(orders, newOrders[0]);

        return newOrders;
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);

            getAllApprovedOrders()
                .then((data) => {
                    if (data.error || data.data.length === 0) {
                        Toast.show({
                            type: "error",
                            text1: "Não foi possível buscar as ordens de pagamento",
                            text2: "Tente novamente em instante!",
                        });
                    } else {
                        const newDataOrders = data.data;
                        const allDates = newDataOrders.map(
                            (values) => values.createdAt,
                        );
                        const month = getCurrentExtendedMonth();
                        const year = getCurrentYear();

                        setCurrentMonth(month);
                        setCurrentYear(year);
                        setDataOriginalOrders(newDataOrders);
                        setDataOrders(
                            filterDataOrders(newDataOrders, month, year),
                        );
                        setAllDataMonth(
                            allDates.map((date) => {
                                const monthName = new Intl.DateTimeFormat(
                                    "pt-BR",
                                    { month: "long" },
                                ).format(date);
                                return (
                                    monthName.charAt(0).toUpperCase() +
                                    monthName.slice(1)
                                );
                            }),
                        );
                        setAllDataYear(
                            allDates.map((date) => date.getFullYear()),
                        );
                    }
                })
                .catch()
                .finally(() => setIsLoading(false));
        }, []),
    );

    const handleSelectMonth = async (dataMonth) => {
        setIsLoading(true);

        setCurrentMonth(dataMonth);
        setDataOrders(
            filterDataOrders(dataOriginalOrders, dataMonth, currentYear),
        );

        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    const handleSelectYear = async (dataYear) => {
        setIsLoading(true);

        setCurrentYear(dataYear);
        setDataOrders(
            filterDataOrders(dataOriginalOrders, currentMonth, dataYear),
        );

        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    return !isLoading ? (
        <Container>
            <ContainerDropdowSelects>
                <ContentInputSelect>
                    <SelectComponent
                        initialTitle={currentMonth}
                        options={monthOptions}
                        action={handleSelectMonth}
                    />
                </ContentInputSelect>
                <ContentInputSelect>
                    <SelectComponent
                        initialTitle={currentYear}
                        options={yearOptions}
                        action={handleSelectYear}
                    />
                </ContentInputSelect>
            </ContainerDropdowSelects>
            <ContainerCardInfoValue style={BoxShadowIos}>
                <ContentYearlyInfo>
                    <ContentTextYearlyInfo>
                        <TitleYearlyInfo>Total Proventos Anual</TitleYearlyInfo>
                        <SubtitleYearlyInfo>
                            R$ {convertToMoney(yearlyEarnings)}
                        </SubtitleYearlyInfo>
                    </ContentTextYearlyInfo>
                    <ImageYearlyInfo source={ShrimpIcon} />
                </ContentYearlyInfo>
                <ContentMonthInfo>
                    <ContentTextMonthInfo>
                        <TitleMonthInfo>Total Proventos Mensal</TitleMonthInfo>
                        <SubtitleMonthInfo>
                            R$ {convertToMoney(monthlyEarnings)}
                        </SubtitleMonthInfo>
                    </ContentTextMonthInfo>
                </ContentMonthInfo>
            </ContainerCardInfoValue>
            <ContainerValueMonth>
                <ContentTextLeft>
                    <TitleLastMoth>Mês passado</TitleLastMoth>
                    <TitleNextMoth>
                        R$ {convertToMoney(previousMonthValue)}
                    </TitleNextMoth>
                </ContentTextLeft>
                <Divider />
                <ContenttextRight>
                    <TitleLastMoth align>Próximo Mês</TitleLastMoth>
                    <TitleNextMoth align>
                        R$ {convertToMoney(nextMonthValue)}
                    </TitleNextMoth>
                </ContenttextRight>
            </ContainerValueMonth>
            <TitleTransaction>Transações</TitleTransaction>
            <FlatList
                data={dataOrders}
                renderItem={({ item }) => <CardTransaction item={item} />}
                keyExtractor={(item) => item.idOrder}
                style={{ width: "100%" }}
            />
        </Container>
    ) : (
        <Skeleton />
    );
};
