import { useEffect, useState } from "react";
import { Modal } from "react-native";
import { VictoryChart, VictoryLine } from "victory-native";
import { FontAwesome } from "@expo/vector-icons";

import {
    getCurrentExtendedMonth,
    getCurrentYear,
} from "../../../../../utils/convertDate";

import SelectComponent from "../../../../../components/SelectComponent";

import {
    ButtomBack,
    Container,
    ContainerDropdownSelects,
    Content,
    ContentHeader,
    ContentInputSelect,
    ModalContent,
    Title,
} from "./styles";
import { BoxShadowIos } from "../../../../../styles/IosShadow";
import { theme } from "../../../../../styles/Theme";
import { material } from "../../../../../styles/Theme/charts";

export const ModalChart = ({ isVisible = false, onClose, viewLogs }) => {
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
            Janeiro: 1,
            Fevereiro: 2,
            Março: 3,
            Abril: 4,
            Maio: 5,
            Junho: 6,
            Julho: 7,
            Agosto: 8,
            Setembro: 9,
            Outubro: 10,
            Novembro: 11,
            Dezembro: 12,
        };

        return monthsMap[month];
    };

    const processData = (data, selectedYear, selectedMonth, dateRange) => {
        const result = {};

        data.forEach((log) => {
            const date = log.createdAt.toISOString().split("T")[0];

            if (result[date]) {
                result[date]++;
            } else {
                result[date] = 1;
            }
        });

        const formattedResult = [];

        let [startDay, endDay] = dateRange.split("-").map(Number);

        if (startDay < 1) startDay = 1;
        if (endDay > 31) endDay = 31;

        const dataMonth = formatMonth(selectedMonth);

        for (let day = startDay; day <= endDay; day++) {
            const dayString = day < 10 ? `0${day}` : `${day}`;
            const date = `${selectedYear}-${
                dataMonth < 10 ? `0${dataMonth}` : dataMonth
            }-${dayString}`;

            const count = result[date] || null;

            formattedResult.push({ x: dayString, y: count });
        }

        setDataChart(formattedResult);
    };

    const extractUniqueMonthsAndYears = (data) => {
        const uniqueMonths = new Set();
        const uniqueYears = new Set();

        data.forEach((log) => {
            const date = new Date(log.createdAt);

            const newDate = date.toISOString().split("T")[0];

            uniqueMonths.add(newDate.split("-")[1]);
            uniqueYears.add(newDate.split("-")[0]);
        });

        const sortedMonths = Array.from(uniqueMonths).sort((a, b) => a - b);
        const sortedYears = Array.from(uniqueYears).sort((a, b) => a - b);

        const formattedMonths = sortedMonths.map((month) => {
            const extendedMonth = new Intl.DateTimeFormat("pt-BR", {
                month: "long",
            }).format(new Date(`2000-${month}-02`));

            return (
                extendedMonth.charAt(0).toUpperCase() + extendedMonth.slice(1)
            );
        });

        return {
            month: formattedMonths,
            year: sortedYears,
        };
    };

    useEffect(() => {
        const currentRageDate = getCurrentDateRange();
        const dataMonthYear = extractUniqueMonthsAndYears(viewLogs);

        setMonthOptions(dataMonthYear.month);
        setYearOptions(dataMonthYear.year);
        setSelectRageDate(currentRageDate);
        setDataViewLogs(viewLogs);

        processData(
            viewLogs,
            currentYear,
            currentExtendedMonth,
            currentRageDate,
        );
    }, [viewLogs]);

    const handleSelectMonth = async (dataMonth) => {
        setCurrentExtendedMonth(dataMonth);

        processData(dataViewLogs, currentYear, dataMonth, selectRageDate);
    };

    const handleSelectYear = async (dataYear) => {
        setCurrentYear(dataYear);

        processData(
            dataViewLogs,
            dataYear,
            currentExtendedMonth,
            selectRageDate,
        );
    };

    const handleSelectRangeDate = async (dataRangeDate) => {
        setSelectRageDate(dataRangeDate);

        processData(
            dataViewLogs,
            currentYear,
            currentExtendedMonth,
            dataRangeDate,
        );
    };

    return (
        <Container>
            <Modal
                animationType="slide"
                visible={isVisible}
                onRequestClose={onClose}
                transparent
            >
                <ModalContent>
                    <Content style={BoxShadowIos}>
                        <ContentHeader>
                            <Title>Visualizações Diária</Title>
                            <ButtomBack onPress={onClose}>
                                <FontAwesome
                                    name="close"
                                    size={24}
                                    color={theme.colors.black}
                                />
                            </ButtomBack>
                        </ContentHeader>
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
                        <VictoryChart
                            width={Number(
                                theme.size.componentSize(330).replace("px", ""),
                            )}
                            padding={35}
                            theme={material}
                        >
                            <VictoryLine
                                style={{
                                    data: {
                                        stroke: theme.colors.primary,
                                        strokeWidth: 3,
                                        strokeLinecap: "round",
                                    },
                                }}
                                data={dataChart}
                                animate={{
                                    duration: 2000,
                                    onLoad: { duration: 1000 },
                                }}
                                categories={{
                                    x: dataChart.map((item) => item.x),
                                }}
                                domainPadding={{
                                    x: 5,
                                    y: [0, 15],
                                }}
                                height={400}
                                width={800}
                                labels={({ datum }) => datum.y}
                            />
                        </VictoryChart>
                    </Content>
                </ModalContent>
            </Modal>
        </Container>
    );
};
