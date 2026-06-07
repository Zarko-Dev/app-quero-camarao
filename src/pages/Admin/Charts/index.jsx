/* eslint-disable operator-linebreak */
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
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

const formatMonth = (month) => {
    const monthsMap = {
        Janeiro: 1, Fevereiro: 2, Março: 3, Abril: 4,
        Maio: 5, Junho: 6, Julho: 7, Agosto: 8,
        Setembro: 9, Outubro: 10, Novembro: 11, Dezembro: 12,
    };
    return monthsMap[month];
};

const SectionTitle = ({ children }) => (
    <Text style={{ fontSize: 13, fontWeight: "700", color: "#36536e", marginBottom: 8, marginTop: 4 }}>
        {children}
    </Text>
);

export const Charts = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataViewLogs, setDataViewLogs] = useState([]);
    const [selectRageDate, setSelectRageDate] = useState("01-15");
    const [monthOptions, setMonthOptions] = useState([]);
    const [currentExtendedMonth, setCurrentExtendedMonth] = useState(getCurrentExtendedMonth());
    const [yearOptions, setYearOptions] = useState([]);
    const [currentYear, setCurrentYear] = useState(getCurrentYear());

    // chart data
    const [dataChart, setDataChart] = useState([]);
    const [dataPrevChart, setDataPrevChart] = useState([]);
    const [dataHourChart, setDataHourChart] = useState([]);
    const [dataTopPubs, setDataTopPubs] = useState([]);

    const getCurrentDateRange = () => {
        const currentDay = new Date().getDate();
        return currentDay <= 15 ? "01-15" : "16-31";
    };

    const getPrevMonth = (month, year) => {
        const monthNum = formatMonth(month);
        if (monthNum === 1) return { month: 12, year: Number(year) - 1 };
        return { month: monthNum - 1, year: Number(year) };
    };

    const getMonthName = (monthNum) => {
        const names = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        return names[monthNum - 1];
    };

    const processData = (data, selectedYear, selectedMonth, dateRange) => {
        const result = {};
        const selectedMonthNumber = formatMonth(selectedMonth);
        const normalizedYear = Number(selectedYear);

        // previous month
        const prev = getPrevMonth(selectedMonth, selectedYear);
        const resultPrev = {};

        data.forEach((entry) => {
            entry.logViews.forEach((log) => {
                const logDate = new Date(log.createdAt);
                const logYear = logDate.getFullYear();
                const logMonth = logDate.getMonth() + 1;

                const day = String(logDate.getDate()).padStart(2, "0");

                if (logYear === normalizedYear && logMonth === selectedMonthNumber) {
                    result[day] = (result[day] || 0) + 1;
                }
                if (logYear === prev.year && logMonth === prev.month) {
                    resultPrev[day] = (resultPrev[day] || 0) + 1;
                }
            });
        });

        let [startDay, endDay] = dateRange.split("-").map(Number);
        if (startDay < 1) startDay = 1;
        if (endDay > 31) endDay = 31;

        const formattedResult = [];
        const formattedPrev = [];

        for (let day = startDay; day <= endDay; day++) {
            const dayString = String(day).padStart(2, "0");
            const count = result[dayString] || 0;
            const countPrev = resultPrev[dayString] || 0;
            formattedResult.push({ value: count, label: dayString, dataPointText: count > 0 ? String(count) : "" });
            formattedPrev.push({ value: countPrev });
        }

        setDataChart(formattedResult);
        setDataPrevChart(formattedPrev);
    };

    const processHourData = (data, selectedYear, selectedMonth) => {
        const selectedMonthNumber = formatMonth(selectedMonth);
        const normalizedYear = Number(selectedYear);
        const hours = Array(24).fill(0);

        data.forEach((entry) => {
            entry.logViews.forEach((log) => {
                const logDate = new Date(log.createdAt);
                if (logDate.getFullYear() === normalizedYear && logDate.getMonth() + 1 === selectedMonthNumber) {
                    hours[logDate.getHours()]++;
                }
            });
        });

        setDataHourChart(
            hours.map((value, h) => ({
                value,
                label: h % 3 === 0 ? `${String(h).padStart(2,"0")}h` : "",
                frontColor: value === Math.max(...hours) ? "#f55b1f" : "#ffa07a",
            }))
        );
    };

    const processTopPubs = (data, selectedYear, selectedMonth) => {
        const selectedMonthNumber = formatMonth(selectedMonth);
        const normalizedYear = Number(selectedYear);
        const counts = {};
        const labels = {};

        data.forEach((entry) => {
            let count = 0;
            entry.logViews.forEach((log) => {
                const logDate = new Date(log.createdAt);
                if (logDate.getFullYear() === normalizedYear && logDate.getMonth() + 1 === selectedMonthNumber) {
                    count++;
                }
            });
            if (count > 0) {
                counts[entry.id] = count;
                labels[entry.id] = entry.location?.split("/")[0]?.trim() ?? "—";
            }
        });

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        setDataTopPubs(
            sorted.map(([id, value]) => ({
                value,
                label: labels[id],
                frontColor: "#36536e",
                topLabelComponent: () => (
                    <Text style={{ fontSize: 9, color: "#36536e", fontWeight: "700", marginBottom: 2 }}>{value}</Text>
                ),
            }))
        );
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
            const ext = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(`2000-${month}-02`));
            return ext.charAt(0).toUpperCase() + ext.slice(1);
        });

        return { month: formattedMonths, year: sortedYears };
    };

    const prepareData = async () => {
        const result = await executeWithRetry(() => withTimeout(getViewLogs(), 30000), 1);
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
            processHourData(result.data, currentYear, currentExtendedMonth);
            processTopPubs(result.data, currentYear, currentExtendedMonth);
            return;
        }

        setMonthOptions([fallbackMonth]);
        setYearOptions([fallbackYear]);
        setSelectRageDate(currentRageDate);
        setDataViewLogs([]);
        processData([], fallbackYear, fallbackMonth, currentRageDate);
        processHourData([], fallbackYear, fallbackMonth);
        processTopPubs([], fallbackYear, fallbackMonth);
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            prepareData()
                .catch((error) => {
                    Toast.show({
                        type: "error",
                        text1: "Erro ao carregar gráficos",
                        text2: error?.message === "ADMIN_CHARTS_TIMEOUT"
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
        processHourData(dataViewLogs, currentYear, dataMonth);
        processTopPubs(dataViewLogs, currentYear, dataMonth);
    };

    const handleSelectYear = (dataYear) => {
        setCurrentYear(dataYear);
        processData(dataViewLogs, dataYear, currentExtendedMonth, selectRageDate);
        processHourData(dataViewLogs, dataYear, currentExtendedMonth);
        processTopPubs(dataViewLogs, dataYear, currentExtendedMonth);
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

    const prevMonthInfo = getPrevMonth(currentExtendedMonth, currentYear);
    const prevMonthName = getMonthName(prevMonthInfo.month);
    const peakHour = dataHourChart.length
        ? dataHourChart.reduce((max, d, i) => (d.value > max.value ? { value: d.value, hour: i } : max), { value: -1, hour: 0 })
        : null;

    if (isLoading) {
        return (
            <Container>
                <AdminChartCardSkeleton />
            </Container>
        );
    }

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                {/* 1. Visualizações Diárias */}
                <CardChart title="Visualizações Diárias das Publicações">
                    <ContainerDropdownSelects>
                        <ContentInputSelect width="38%">
                            <SelectComponent initialTitle={currentExtendedMonth} options={monthOptions} action={handleSelectMonth} />
                        </ContentInputSelect>
                        <ContentInputSelect width="30%">
                            <SelectComponent initialTitle={currentYear} options={yearOptions} action={handleSelectYear} />
                        </ContentInputSelect>
                        <ContentInputSelect width="30%">
                            <SelectComponent initialTitle={selectRageDate} options={["01-15", "16-31"]} action={handleSelectRangeDate} />
                        </ContentInputSelect>
                    </ContainerDropdownSelects>

                    {(() => {
                        const totalViews = (dataChart ?? []).reduce((sum, d) => sum + (d.value ?? 0), 0);
                        return (
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, marginTop: 8, paddingHorizontal: 8 }}>
                                <Text style={{ fontSize: 13, color: "#36536e", fontWeight: "700" }}>
                                    Total: <Text style={{ color: "#f55b1f" }}>{totalViews}</Text> visualizações
                                </Text>
                            </View>
                        );
                    })()}

                    {/* Legend */}
                    <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 8, marginBottom: 6 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <View style={{ width: 12, height: 3, backgroundColor: "#f55b1f", borderRadius: 2 }} />
                            <Text style={{ fontSize: 11, color: "#8fa3b2" }}>{currentExtendedMonth}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <View style={{ width: 12, height: 3, backgroundColor: "#36536e", borderRadius: 2 }} />
                            <Text style={{ fontSize: 11, color: "#8fa3b2" }}>{prevMonthName}</Text>
                        </View>
                    </View>

                    <LineChart
                        data={dataChart}
                        data2={dataPrevChart}
                        color="#f55b1f"
                        color2="#36536e"
                        thickness={2.5}
                        thickness2={1.5}
                        curved
                        isAnimated
                        animationDuration={600}
                        areaChart
                        startFillColor="rgba(245,91,31,0.2)"
                        endFillColor="rgba(245,91,31,0.02)"
                        startFillColor2="rgba(54,83,110,0.1)"
                        endFillColor2="rgba(54,83,110,0.01)"
                        startOpacity={1}
                        endOpacity={0.1}
                        startOpacity2={0.5}
                        endOpacity2={0.1}
                        hideDataPoints={false}
                        dataPointsColor="#f55b1f"
                        dataPointsColor2="#36536e"
                        dataPointsRadius={4}
                        dataPointsRadius2={3}
                        focusedDataPointColor="#c03800"
                        focusedDataPointRadius={6}
                        xAxisLabelTextStyle={{ color: "#8fa3b2", fontSize: 9 }}
                        yAxisTextStyle={{ color: "#8fa3b2", fontSize: 10 }}
                        yAxisColor="#e8eef4"
                        xAxisColor="#e8eef4"
                        rulesColor="#f0f5fb"
                        rulesType="solid"
                        showVerticalLines
                        verticalLinesColor="#f0f5fb"
                        initialSpacing={8}
                        endSpacing={8}
                        spacing={18}
                        height={200}
                        noOfSections={5}
                        textShiftY={-6}
                        textShiftX={-4}
                        textFontSize={11}
                        textColor="#36536e"
                        showTextOnFocus
                        focusedDataPointLabelComponent={(item) => (
                            <View style={{ backgroundColor: "#36536e", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginBottom: 4 }}>
                                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{item.value}</Text>
                            </View>
                        )}
                    />

                    <CharButton style={[BoxShadowIos, { alignSelf: "stretch", margin: 8, borderRadius: 8 }]} onPress={handleRedirectPublicationViewLogsList}>
                        <TitleButton>Visualizações por Publicação</TitleButton>
                    </CharButton>
                </CardChart>

                {/* 2. Horário de Pico */}
                <CardChart title="Horário de Pico">
                    {peakHour && peakHour.value > 0 && (
                        <View style={{ backgroundColor: "rgba(245,91,31,0.12)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8, marginTop: 4 }}>
                            <Text style={{ fontSize: 13, color: "#36536e", fontWeight: "700", textAlign: "center" }}>
                                Pico às <Text style={{ color: "#f55b1f" }}>{String(peakHour.hour).padStart(2,"0")}h</Text> com <Text style={{ color: "#f55b1f" }}>{peakHour.value}</Text> visualizações
                            </Text>
                        </View>
                    )}
                    <BarChart
                        data={dataHourChart}
                        barWidth={10}
                        spacing={5}
                        roundedTop
                        hideRules
                        xAxisLabelTextStyle={{ color: "#8fa3b2", fontSize: 9 }}
                        yAxisTextStyle={{ color: "#8fa3b2", fontSize: 10 }}
                        yAxisColor="#e8eef4"
                        xAxisColor="#e8eef4"
                        noOfSections={4}
                        height={150}
                        isAnimated
                        animationDuration={600}
                        initialSpacing={4}
                        endSpacing={4}
                    />
                </CardChart>

                {/* 3. Top 5 Publicações */}
                {dataTopPubs.length > 0 && (
                    <CardChart title="Top 5 Publicações">
                        <SectionTitle>{currentExtendedMonth} {currentYear}</SectionTitle>
                        <BarChart
                            data={dataTopPubs}
                            barWidth={36}
                            spacing={18}
                            roundedTop
                            hideRules
                            xAxisLabelTextStyle={{ color: "#8fa3b2", fontSize: 10 }}
                            yAxisTextStyle={{ color: "#8fa3b2", fontSize: 10 }}
                            yAxisColor="#e8eef4"
                            xAxisColor="#e8eef4"
                            noOfSections={4}
                            height={160}
                            isAnimated
                            animationDuration={600}
                            initialSpacing={12}
                            endSpacing={12}
                        />
                    </CardChart>
                )}

                {/* 4. Comparativo Mês Anterior — já está no gráfico principal como linha2 */}
                {/* Resumo comparativo em números */}
                {(() => {
                    const totalAtual = (dataChart ?? []).reduce((s, d) => s + d.value, 0);
                    const totalAnterior = (dataPrevChart ?? []).reduce((s, d) => s + d.value, 0);
                    const diff = totalAtual - totalAnterior;
                    if (totalAnterior === 0 && totalAtual === 0) return null;
                    return (
                        <CardChart title="Comparativo com Mês Anterior">
                            <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, width: "100%" }}>
                                <View style={{ alignItems: "center" }}>
                                    <Text style={{ fontSize: 11, color: "#8fa3b2" }}>{prevMonthName}</Text>
                                    <Text style={{ fontSize: 22, fontWeight: "700", color: "#36536e" }}>{totalAnterior}</Text>
                                    <Text style={{ fontSize: 10, color: "#8fa3b2" }}>views</Text>
                                </View>
                                <View style={{ alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontSize: 20, fontWeight: "700", color: diff >= 0 ? "#4BB543" : "#f47575" }}>
                                        {diff >= 0 ? "▲" : "▼"} {Math.abs(diff)}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: diff >= 0 ? "#4BB543" : "#f47575" }}>
                                        {totalAnterior > 0 ? `${Math.round((diff / totalAnterior) * 100)}%` : "—"}
                                    </Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                    <Text style={{ fontSize: 11, color: "#8fa3b2" }}>{currentExtendedMonth}</Text>
                                    <Text style={{ fontSize: 22, fontWeight: "700", color: "#f55b1f" }}>{totalAtual}</Text>
                                    <Text style={{ fontSize: 10, color: "#8fa3b2" }}>views</Text>
                                </View>
                            </View>
                        </CardChart>
                    );
                })()}

            </ScrollView>
        </Container>
    );
};
