/* eslint-disable operator-linebreak */
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
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
import { BoxShadowIos } from "../../../styles/IosShadow";
import { AdminChartCardSkeleton } from "../../../components/Skeleton/AdminChartCardSkeleton";

// ─── paleta ────────────────────────────────────────────────────────────────
const C_CURRENT  = "#2563eb"; // azul forte – mês atual
const C_PREV     = "#94a3b8"; // cinza azulado – mês anterior
const C_TOP      = "#0ea5e9"; // azul céu – top pubs
const C_AXIS     = "#94a3b8";
const C_RULES    = "#e2e8f0";
const C_TITLE    = "#1e2d3d";
const C_ACCENT   = "#f55b1f";

// ─── helpers ───────────────────────────────────────────────────────────────
const withTimeout = (promise, ms = 30000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("ADMIN_CHARTS_TIMEOUT")), ms),
        ),
    ]);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const executeWithRetry = async (fn, retries = 1) => {
    try { return await fn(); }
    catch (e) {
        if (retries <= 0) throw e;
        await wait(1200);
        return executeWithRetry(fn, retries - 1);
    }
};

const MONTH_MAP = {
    Janeiro:1, Fevereiro:2, Março:3, Abril:4, Maio:5, Junho:6,
    Julho:7, Agosto:8, Setembro:9, Outubro:10, Novembro:11, Dezembro:12,
};
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                     "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const fmtMonth = (m) => MONTH_MAP[m] ?? 1;
const prevMonth = (month, year) => {
    const n = fmtMonth(month);
    return n === 1 ? { month: 12, year: Number(year) - 1 }
                   : { month: n - 1, year: Number(year) };
};
const monthName = (n) => MONTH_NAMES[n - 1];

// ─── componentes locais ────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
    <Text style={{ fontSize: 11, color: C_AXIS, marginBottom: 8, paddingHorizontal: 8 }}>
        {children}
    </Text>
);

const StatRow = ({ label, value, color }) => (
    <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 11, color: C_AXIS }}>{label}</Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color }}>{value}</Text>
        <Text style={{ fontSize: 10, color: C_AXIS }}>views</Text>
    </View>
);

// ─── tela principal ─────────────────────────────────────────────────────────
export const Charts = ({ navigation }) => {
    const [isLoading,             setIsLoading]             = useState(false);
    const [dataViewLogs,          setDataViewLogs]          = useState([]);
    const [selectRageDate,        setSelectRageDate]        = useState("01-15");
    const [monthOptions,          setMonthOptions]          = useState([]);
    const [currentExtendedMonth,  setCurrentExtendedMonth]  = useState(getCurrentExtendedMonth());
    const [yearOptions,           setYearOptions]           = useState([]);
    const [currentYear,           setCurrentYear]           = useState(getCurrentYear());
    const [dataChart,             setDataChart]             = useState([]);
    const [dataPrevChart,         setDataPrevChart]         = useState([]);
    const [dataHourChart,         setDataHourChart]         = useState([]);
    const [dataTopPubs,           setDataTopPubs]           = useState([]);

    const getCurrentDateRange = () => new Date().getDate() <= 15 ? "01-15" : "16-31";

    // ── processa gráfico de barras diário (agrupado: atual + anterior) ──────
    const processData = (data, selYear, selMonth, dateRange) => {
        const monthNum  = fmtMonth(selMonth);
        const year      = Number(selYear);
        const prev      = prevMonth(selMonth, selYear);
        const curr = {}, ante = {};

        data.forEach((entry) => {
            entry.logViews.forEach((log) => {
                const d = new Date(log.createdAt);
                const day = String(d.getDate()).padStart(2, "0");
                if (d.getFullYear() === year && d.getMonth() + 1 === monthNum)
                    curr[day] = (curr[day] || 0) + 1;
                if (d.getFullYear() === prev.year && d.getMonth() + 1 === prev.month)
                    ante[day] = (ante[day] || 0) + 1;
            });
        });

        let [start, end] = dateRange.split("-").map(Number);
        start = Math.max(start, 1); end = Math.min(end, 31);

        const result = [];
        for (let day = start; day <= end; day++) {
            const ds = String(day).padStart(2, "0");
            const vCurr = curr[ds] || 0;
            result.push({
                value: vCurr,
                label: ds,
                frontColor: C_CURRENT,
                topLabelComponent: vCurr > 0
                    ? () => (
                        <Text style={{ fontSize: 9, color: C_ACCENT, fontWeight: "800",
                            textAlign: "center" }}>
                            {vCurr}
                        </Text>
                    )
                    : undefined,
                onPress: () => Toast.show({
                    type: "info",
                    text1: `Dia ${ds} — ${selMonth}`,
                    text2: `${vCurr} visualizações`,
                    visibilityTime: 2000,
                }),
            });
        }
        setDataChart(result);

        // para o comparativo de totais
        const totCurr = Object.values(curr).reduce((s, v) => s + v, 0);
        const totPrev = Object.values(ante).reduce((s, v) => s + v, 0);
        setDataPrevChart([{ total: totPrev }, { total: totCurr }]);
    };

    // ── horário de pico ─────────────────────────────────────────────────────
    const processHourData = (data, selYear, selMonth) => {
        const monthNum = fmtMonth(selMonth);
        const year     = Number(selYear);
        const hours    = Array(24).fill(0);

        data.forEach((entry) => {
            entry.logViews.forEach((log) => {
                const d = new Date(log.createdAt);
                if (d.getFullYear() === year && d.getMonth() + 1 === monthNum)
                    hours[d.getHours()]++;
            });
        });

        const maxVal = Math.max(...hours, 1);
        setDataHourChart(
            hours.map((value, h) => ({
                value,
                label: `${String(h).padStart(2,"0")}h`,
                frontColor: value === maxVal && value > 0 ? C_ACCENT : C_CURRENT,
                topLabelComponent: value > 0
                    ? () => (
                        <Text style={{ fontSize: 9, fontWeight: "700",
                            color: value === maxVal ? C_ACCENT : "#64748b",
                            marginBottom: 1 }}>
                            {value}
                        </Text>
                    )
                    : undefined,
                onPress: () => Toast.show({
                    type: "info",
                    text1: `${String(h).padStart(2,"0")}h — ${selMonth}`,
                    text2: `${value} visualização${value !== 1 ? "s" : ""}`,
                }),
            }))
        );
    };

    // ── top 5 publicações ───────────────────────────────────────────────────
    const processTopPubs = (data, selYear, selMonth) => {
        const monthNum = fmtMonth(selMonth);
        const year     = Number(selYear);
        const counts = {}, labels = {};

        data.forEach((entry) => {
            let n = 0;
            entry.logViews.forEach((log) => {
                const d = new Date(log.createdAt);
                if (d.getFullYear() === year && d.getMonth() + 1 === monthNum) n++;
            });
            if (n > 0) {
                counts[entry.id] = n;
                labels[entry.id] = entry.location?.split("/")[0]?.trim() ?? "—";
            }
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        setDataTopPubs(
            sorted.map(([id, value]) => ({
                value,
                label: labels[id],
                frontColor: C_TOP,
                topLabelComponent: () => (
                    <Text style={{ fontSize: 9, color: C_TOP, fontWeight: "700", marginBottom: 2 }}>{value}</Text>
                ),
            }))
        );
    };

    const extractMonthsYears = (data) => {
        const ms = new Set(), ys = new Set();
        data.forEach((e) => e.logViews.forEach((l) => {
            const d = new Date(l.createdAt);
            ms.add(String(d.getMonth() + 1).padStart(2, "0"));
            ys.add(String(d.getFullYear()));
        }));
        const months = Array.from(ms).sort().map((m) => {
            const s = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(`2000-${m}-02`));
            return s.charAt(0).toUpperCase() + s.slice(1);
        });
        return { month: months, year: Array.from(ys).sort() };
    };

    const runAll = (data, year, month, range) => {
        processData(data, year, month, range);
        processHourData(data, year, month);
        processTopPubs(data, year, month);
    };

    const prepareData = async () => {
        const result = await executeWithRetry(() => withTimeout(getViewLogs(), 30000), 1);
        const range   = getCurrentDateRange();
        const fbMonth = getCurrentExtendedMonth();
        const fbYear  = getCurrentYear();

        if (!result.error && Array.isArray(result.data)) {
            const my     = extractMonthsYears(result.data);
            const months = my.month?.length ? my.month : [fbMonth];
            const years  = my.year?.length  ? my.year  : [fbYear];
            setMonthOptions(months);
            setYearOptions(years);
            setSelectRageDate(range);
            setDataViewLogs(result.data);
            runAll(result.data, currentYear, currentExtendedMonth, range);
            return;
        }
        setMonthOptions([fbMonth]); setYearOptions([fbYear]);
        setSelectRageDate(range); setDataViewLogs([]);
        runAll([], fbYear, fbMonth, range);
    };

    useFocusEffect(useCallback(() => {
        setIsLoading(true);
        prepareData()
            .catch((e) => Toast.show({
                type: "error",
                text1: "Erro ao carregar gráficos",
                text2: e?.message === "ADMIN_CHARTS_TIMEOUT" ? "Tempo limite." : "Falha ao buscar dados.",
            }))
            .finally(() => setIsLoading(false));
    }, []));

    const onMonth = (m) => { setCurrentExtendedMonth(m); runAll(dataViewLogs, currentYear, m, selectRageDate); };
    const onYear  = (y) => { setCurrentYear(y);           runAll(dataViewLogs, y, currentExtendedMonth, selectRageDate); };
    const onRange = (r) => { setSelectRageDate(r);         processData(dataViewLogs, currentYear, currentExtendedMonth, r); };

    const prevInfo    = prevMonth(currentExtendedMonth, currentYear);
    const prevName    = monthName(prevInfo.month);
    const totCurr     = dataPrevChart[1]?.total ?? 0;
    const totPrev     = dataPrevChart[0]?.total ?? 0;
    const diff        = totCurr - totPrev;
    const peakHour    = dataHourChart.length
        ? dataHourChart.reduce((mx, d, i) => d.value > mx.value ? { value: d.value, hour: i } : mx, { value: -1, hour: 0 })
        : null;

    if (isLoading) return <Container><AdminChartCardSkeleton /></Container>;

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                {/* ── 1. Visualizações Diárias (barras agrupadas) ── */}
                <CardChart title="Visualizações Diárias">
                    <ContainerDropdownSelects>
                        <ContentInputSelect width="38%">
                            <SelectComponent initialTitle={currentExtendedMonth} options={monthOptions} action={onMonth} />
                        </ContentInputSelect>
                        <ContentInputSelect width="30%">
                            <SelectComponent initialTitle={currentYear} options={yearOptions} action={onYear} />
                        </ContentInputSelect>
                        <ContentInputSelect width="30%">
                            <SelectComponent initialTitle={selectRageDate} options={["01-15","16-31"]} action={onRange} />
                        </ContentInputSelect>
                    </ContainerDropdownSelects>

                    {/* legenda */}
                    <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 8, marginTop: 10, marginBottom: 6 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: C_CURRENT }} />
                            <Text style={{ fontSize: 11, color: C_AXIS }}>{currentExtendedMonth}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: C_PREV }} />
                            <Text style={{ fontSize: 11, color: C_AXIS }}>{prevName}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                            <Text style={{ fontSize: 12, color: C_TITLE, fontWeight: "700" }}>
                                Total: <Text style={{ color: C_ACCENT }}>{totCurr}</Text>
                            </Text>
                        </View>
                    </View>

                    <BarChart
                        data={dataChart}
                        barWidth={12}
                        barBorderRadius={4}
                        spacing={6}
                        labelWidth={20}
                        hideRules={false}
                        rulesColor={C_RULES}
                        rulesType="solid"
                        xAxisLabelTextStyle={{ color: C_AXIS, fontSize: 9, textAlign: "center" }}
                        yAxisTextStyle={{ color: C_AXIS, fontSize: 10 }}
                        yAxisColor={C_RULES}
                        xAxisColor={C_RULES}
                        noOfSections={5}
                        height={200}
                        isAnimated
                        animationDuration={500}
                        initialSpacing={6}
                        endSpacing={6}
                    />

                    <CharButton
                        onPress={() => navigation.navigate(dataRoutes.admin.publicationViewLogsList, { dataViewLogsList: dataViewLogs })}>
                        <TitleButton>Visualizações por Publicação</TitleButton>
                        <Feather name="arrow-right" size={14} color="#f55b1f" />
                    </CharButton>
                </CardChart>

                {/* ── 2. Horário de Pico ── */}
                <CardChart title="Horário de Pico">
                    {peakHour && peakHour.value > 0 && (
                        <View style={{ backgroundColor: "#fff7ed", borderRadius: 8, paddingHorizontal: 14,
                            paddingVertical: 8, marginVertical: 8, borderLeftWidth: 3, borderLeftColor: C_ACCENT }}>
                            <Text style={{ fontSize: 13, color: C_TITLE, fontWeight: "700" }}>
                                Pico às <Text style={{ color: C_ACCENT }}>{String(peakHour.hour).padStart(2,"0")}h</Text>
                                {" "}com <Text style={{ color: C_ACCENT }}>{peakHour.value}</Text> visualizações
                            </Text>
                        </View>
                    )}
                    <SectionLabel>{currentExtendedMonth} {currentYear}</SectionLabel>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={dataHourChart}
                            barWidth={20}
                            barBorderRadius={4}
                            spacing={8}
                            hideRules={false}
                            rulesColor={C_RULES}
                            xAxisLabelTextStyle={{ color: C_AXIS, fontSize: 9, textAlign: "center" }}
                            labelWidth={34}
                            yAxisTextStyle={{ color: C_AXIS, fontSize: 10 }}
                            yAxisColor={C_RULES}
                            xAxisColor={C_RULES}
                            noOfSections={4}
                            height={160}
                            isAnimated
                            animationDuration={500}
                            initialSpacing={4}
                            endSpacing={8}
                            disableScroll
                        />
                    </ScrollView>
                </CardChart>

                {/* ── 3. Top 5 Publicações ── */}
                {dataTopPubs.length > 0 && (
                    <CardChart title="Top 5 Publicações">
                        <SectionLabel>{currentExtendedMonth} {currentYear}</SectionLabel>
                        <BarChart
                            data={dataTopPubs}
                            barWidth={38}
                            barBorderRadius={4}
                            spacing={16}
                            hideRules={false}
                            rulesColor={C_RULES}
                            xAxisLabelTextStyle={{ color: C_AXIS, fontSize: 10 }}
                            yAxisTextStyle={{ color: C_AXIS, fontSize: 10 }}
                            yAxisColor={C_RULES}
                            xAxisColor={C_RULES}
                            noOfSections={4}
                            height={160}
                            isAnimated
                            animationDuration={500}
                            initialSpacing={12}
                            endSpacing={12}
                        />
                    </CardChart>
                )}

                {/* ── 4. Comparativo Mês Anterior ── */}
                {(totCurr > 0 || totPrev > 0) && (
                    <CardChart title="Comparativo com Mês Anterior">
                        <View style={{ flexDirection: "row", justifyContent: "space-around",
                            paddingVertical: 16, width: "100%" }}>
                            <StatRow label={prevName} value={totPrev} color={C_PREV} />
                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ fontSize: 22, fontWeight: "800",
                                    color: diff >= 0 ? "#16a34a" : "#dc2626" }}>
                                    {diff >= 0 ? "▲" : "▼"} {Math.abs(diff)}
                                </Text>
                                <Text style={{ fontSize: 11, fontWeight: "600",
                                    color: diff >= 0 ? "#16a34a" : "#dc2626" }}>
                                    {totPrev > 0 ? `${Math.round((diff / totPrev) * 100)}%` : "—"}
                                </Text>
                            </View>
                            <StatRow label={currentExtendedMonth} value={totCurr} color={C_CURRENT} />
                        </View>
                    </CardChart>
                )}

            </ScrollView>
        </Container>
    );
};
