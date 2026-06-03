/* eslint-disable operator-linebreak */
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { LineChart } from "react-native-gifted-charts";
import Toast from "react-native-toast-message";

import { dataRoutes } from "../../../routes/dataRoutes";
import {
    getCurrentExtendedMonth,
    getCurrentYear,
} from "../../../utils/convertDate";
import { getViewLogs } from "../../../controllers/Publication/getViewLogs";

import { CardChart } from "./components/CardChart";
import SelectComponent from "../../../components/SelectComponent";

import {
    CharButton,
    Container,
    ContainerDropdownSelects,
    ContentInputSelect,
    TitleButton,
} from "./styles";
import { theme } from "../../../styles/Theme";
import { BoxShadowIos } from "../../../styles/IosShadow";
import { AdminChartCardSkeleton } from "../../../components/Skeleton/AdminChartCardSkeleton";

const withTimeout = (promise, ms = 30000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("ADMIN_CHARTS_TIMEOUT")), ms),
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

export const Charts = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataViewLogs, setDataViewLogs] = useState([]);
    const [selectRageDate, setSelectRageDate] = useState("01-15");
    const [monthOptions, setMonthOptions] = useState([]);
    const [currentExtendedMonth, setCurrentExtendedMonth] = useState(
        getCurrentExtendedMonth(),
    );
    const [yearOptions, setYearOptions] = useState([]);
    const [currentYear, setCurrentYear] = useState(getCurrentYear());
    const [dataChart, setDataChart] = useState([]);

    const getCurrentDateRange = () => {
        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        return currentDay <= 15 ? "01-15" : "16-31";
    };

    const formatMonth = (month) => {
        const monthsMap = {
            Janeiro: 1, Fevereiro: 2, Março: 3, Abril: 4,
            Maio: 5, Junho: 6, Julho: 7, Agosto: 8,
            Setembro: 9, Outubro: 10, Novembro: 11, Dezembro: 12,
        };
        return monthsMap[month];
    };

    const processData = (data, selectedYear, selectedMonth, dateRange) => {
        const result = {};
        const selectedMonthNumber = formatMonth(selectedMonth);
        const normalizedYear = Number(selectedYear);

        data.forEach((entry) => {
            entry.logViews.forEach((log) => {
                const logDate = new Date(log.createdAt);
                const logYear = logDate.getFullYear();
                const logMonth = logDate.getMonth() + 1;

                if (logYear !== normalizedYear || logMonth !== selectedMonthNumber) {
                    return;
                }

                const day = String(logDate.getDate()).padStart(2, "0");
                result[day] = (result[day] || 0) + 1;
            });
        });

        const formattedResult = [];
        let [startDay, endDay] = dateRange.split("-").map(Number);
        if (startDay < 1) startDay = 1;
        if (endDay > 31) endDay = 31;

        for (let day = startDay; day <= endDay; day++) {
            const dayString = String(day).padStart(2, "0");
            const count = result[dayString] || 0;
            formattedResult.push({
                value: count,
                label: dayString,
                dataPointText: count > 0 ? String(count) : "",
            });
        }

        setDataChart(formattedResult);
    };

    const extractUniqueMonthsAndYears = (data) => {
        const uniqueMonths = new Set();
        const uniqueYears = new Set();

        data.forEach((entry) => {
            entry.logViews.forEach((log) => {
                const date = new Date(log.createdAt);
                uniqueMonths.add(String(date.getMonth() + 1).padStart(2, "0"));
                uniqueYears.add(String(date.getFullYear()));
            });
        });

        const sortedMonths = Array.from(uniqueMonths).sort((a, b) => a - b);
        const sortedYears = Array.from(uniqueYears).sort((a, b) => a - b);

        const formattedMonths = sortedMonths.map((month) => {
            const extendedMonth = new Intl.DateTimeFormat("pt-BR", {
                month: "long",
            }).format(new Date(`2000-${month}-02`));
            return extendedMonth.charAt(0).toUpperCase() + extendedMonth.slice(1);
        });

        return { month: formattedMonths, year: sortedYears };
    };

    const prepareData = async () => {
        const result = await executeWithRetry(
            () => withTimeout(getViewLogs(), 30000),
            1,
        );
        const currentRageDate = getCurrentDateRange();
        const fallbackMonth = getCurrentExtendedMonth();
        const fallbackYear = getCurrentYear();

        if (!result.error && Array.isArray(result.data)) {
            const dataMonthYear = extractUniqueMonthsAndYears(result.data);
            const months = dataMonthYear.month?.length ? dataMonthYear.month : [fallbackMonth];
            const years = dataMonthYear.year?.length ? dataMonthYear.year : [fallbackYear];

            setMonthOptions(months);
            setYearOptions(years);
            setSelectRageDate(currentRageDate);
            setDataViewLogs(result.data);
            processData(result.data, currentYear, currentExtendedMonth, currentRageDate);
            return;
        }

        setMonthOptions([fallbackMonth]);
        setYearOptions([fallbackYear]);
        setSelectRageDate(currentRageDate);
        setDataViewLogs([]);
        processData([], fallbackYear, fallbackMonth, currentRageDate);
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            prepareData()
                .catch((error) => {
                    Toast.show({
                        type: "error",
                        text1: "Erro ao carregar gráficos",
                        text2:
                            error?.message === "ADMIN_CHARTS_TIMEOUT"
                                ? "Tempo limite da consulta."
                                : "Falha ao buscar dados.",
                    });
                })
                .finally(() => setIsLoading(false));
        }, []),
    );

    const handleSelectMonth = (dataMonth) => {
        setCurrentExtendedMonth(dataMonth);
        processData(dataViewLogs, currentYear, dataMonth, selectRageDate);
    };

    const handleSelectYear = (dataYear) => {
        setCurrentYear(dataYear);
        processData(dataViewLogs, dataYear, currentExtendedMonth, selectRageDate);
    };

    const handleSelectRangeDate = (dataRangeDate) => {
        setSelectRageDate(dataRangeDate);
        processData(dataViewLogs, currentYear, currentExtendedMonth, dataRangeDate);
    };

    const handleRedirectPublicationViewLogsList = () => {
        navigation.navigate(dataRoutes.admin.publicationViewLogsList, {
            dataViewLogsList: dataViewLogs,
        });
    };

    return (
        <Container>
            {!isLoading ? (
                <CardChart title="Visualizações Diárias das Publicações">
                    <ContainerDropdownSelects>
                        <ContentInputSelect width="38%">
                            <SelectComponent
                                initialTitle={currentExtendedMonth}
                                options={monthOptions}
                                action={handleSelectMonth}
                            />
                        </ContentInputSelect>
                        <ContentInputSelect width="30%">
                            <SelectComponent
                                initialTitle={currentYear}
                                options={yearOptions}
                                action={handleSelectYear}
                            />
                        </ContentInputSelect>
                        <ContentInputSelect width="30%">
                            <SelectComponent
                                initialTitle={selectRageDate}
                                options={["01-15", "16-31"]}
                                action={handleSelectRangeDate}
                            />
                        </ContentInputSelect>
                    </ContainerDropdownSelects>
                    <LineChart
                        data={dataChart}
                        color={theme.colors.primary}
                        thickness={3}
                        curved
                        isAnimated
                        animationDuration={600}
                        hideDataPoints={false}
                        dataPointsColor={theme.colors.primary}
                        dataPointsRadius={4}
                        xAxisLabelTextStyle={{ color: "#8fa3b2", fontSize: 10 }}
                        yAxisTextStyle={{ color: "#8fa3b2", fontSize: 10 }}
                        yAxisColor="#e0e0e0"
                        xAxisColor="#e0e0e0"
                        rulesColor="#f0f0f0"
                        rulesType="solid"
                        initialSpacing={8}
                        endSpacing={8}
                        spacing={18}
                        height={180}
                        noOfSections={4}
                        textShiftY={-6}
                        textShiftX={-4}
                        textFontSize={10}
                        showTextOnFocus
                    />
                    <CharButton
                        style={BoxShadowIos}
                        onPress={handleRedirectPublicationViewLogsList}
                    >
                        <TitleButton>Visualizações por Publicação</TitleButton>
                    </CharButton>
                </CardChart>
            ) : (
                <AdminChartCardSkeleton />
            )}
        </Container>
    );
};
