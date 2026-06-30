/* eslint-disable operator-linebreak */
import { FlatList, TouchableOpacity, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native-paper";

import {
    Container,
    FilterChip,
    FilterChipText,
    FilterContainer,
    HeaderSubtitle,
    HeaderTitle,
    HeaderTitleContainer,
    HeaderTopRow,
    ProfileIconContainer,
    RowText,
    ScreenHeader,
    SearchContainer,
    SearchInput,
    ShrimpIconHeader,
    FlyerContainer,
    FlyerTitle,
    FlyerBody,
    FlyerContentShrimpImage,
    FlyerShrimpImageCircle,
    FlyerShrimpImage,
    FlyerContentDataInfo,
    FlyerDataRow,
    FlyerIconContainer,
    FlyerShrimpMiniIcon,
    FlyerLabelText,
    FlyerValueText,
} from "./styles";
import { getShirimpSaleByCreatedAtLastThirtyDays } from "../../controllers/ShirimpSale/sale";
import shrimpIcon from "../../assets/images/shrimpIcon.png";
import ShririmpBanner from "../../assets/images/camaraoBanner.png";
import { buildEncarteLink } from "../../utils/encarteProdutor";
import {
    calculateShrimpSalePrice,
    formatPriceValue,
} from "../../utils/shrimpSalePricing";

export const SalesList = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [dataSales, setDataSales] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [activeFilter, setActiveFilter] = useState("Todos");

    const classifyShrimpSize = (grammage) => {
        if (!grammage || grammage === "-") return "-";

        const formattedGrammage = String(grammage);
        const numericGrammage = parseFloat(formattedGrammage.replace(",", "."));

        if (Number.isNaN(numericGrammage)) return "-";

        if (numericGrammage >= 7.5 && numericGrammage <= 9.9) {
            return `${formattedGrammage}g (P)`;
        }
        if (numericGrammage >= 10 && numericGrammage <= 14.9) {
            return `${formattedGrammage}g (M)`;
        }
        if (numericGrammage >= 15 && numericGrammage <= 19.9) {
            return `${formattedGrammage}g (G)`;
        }
        if (numericGrammage >= 20 && numericGrammage <= 22) {
            return `${formattedGrammage}g (GG)`;
        }
        if (numericGrammage > 22) {
            return `${formattedGrammage}g (XG)`;
        }
        return `${formattedGrammage}g`;
    };

    const getLocationFontSize = (location) => {
        const size = String(location ?? "").length;

        if (size > 30) return 12;
        if (size > 24) return 13;
        if (size > 18) return 14;
        return 15;
    };

    const getData = async () => {
        try {
            setLoading(true);
            const resultData = await getShirimpSaleByCreatedAtLastThirtyDays();
            
            // Achatando os dados para que cada gramatura seja um card individual (encarte)
            const flatSales = [];
            if (resultData && Array.isArray(resultData)) {
                resultData.forEach((doc) => {
                    if (Array.isArray(doc.sales)) {
                        doc.sales.forEach((sale, index) => {
                            flatSales.push({
                                id: `${doc.id}-${sale.grammage ?? "grammage"}-${index}`,
                                publicationId: doc.publicationId || doc.id || "",
                                location: doc.location || "-",
                                contactNumber: doc.contactNumber || "",
                                userId: doc.userId || "",
                                encarteLink: buildEncarteLink({
                                    providedLink: sale.encarteLink || doc.encarteLink || "",
                                    publicationId: doc.publicationId || doc.id || "",
                                }),
                                grammage: sale.grammage ?? "-",
                                grammageValue: sale.grammageValue ?? "-",
                                totalSaleValue: sale.totalSaleValue ?? "",
                                saleDate: sale.saleDate ?? "-",
                            });
                        });
                    }
                });
            }

            setDataSales(flatSales);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getData();
        }, []),
    );

    const parseSaleDate = (saleDate) => {
        if (!saleDate || typeof saleDate !== "string") return null;
        const parts = saleDate.split("/");
        if (parts.length !== 3) return null;
        const [day, month, year] = parts.map((p) => parseInt(p, 10));
        if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const getWeekRange = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const start = new Date(now);
        start.setDate(now.getDate() + diffToMonday);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    };

    const filteredData = useMemo(() => {
        let result = dataSales;

        if (activeFilter === "Prontos") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            result = result.filter((item) => {
                const d = parseSaleDate(item.saleDate);
                return d && d.getTime() <= today.getTime();
            });
        } else if (activeFilter === "Esta semana") {
            const { start, end } = getWeekRange();
            result = result.filter((item) => {
                const d = parseSaleDate(item.saleDate);
                return d && d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
            });
        }

        if (searchValue) {
            const term = searchValue.toLowerCase();
            result = result.filter(
                (item) =>
                    item.location?.toLowerCase().includes(term) ||
                    classifyShrimpSize(item.grammage).toLowerCase().includes(term)
            );
        }

        return [...result].sort((a, b) => {
            const dateA = parseSaleDate(a.saleDate);
            const dateB = parseSaleDate(b.saleDate);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
        });
    }, [dataSales, searchValue, activeFilter]);

    return (
        <Container>
            <ScreenHeader>
                <HeaderTopRow>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={28} color="white" />
                    </TouchableOpacity>

                    <HeaderTitleContainer>
                        <HeaderTitle>Preços Atuais</HeaderTitle>
                        <HeaderSubtitle>
                            Encartes de preços de camarão
                        </HeaderSubtitle>
                    </HeaderTitleContainer>

                    <ProfileIconContainer>
                        <ShrimpIconHeader source={shrimpIcon} resizeMode="contain" />
                    </ProfileIconContainer>
                </HeaderTopRow>

                <SearchContainer>
                    <Feather name="search" size={20} color="#888" />
                    <SearchInput
                        placeholder="Buscar por localidade ou tamanho..."
                        value={searchValue}
                        onChangeText={setSearchValue}
                    />
                </SearchContainer>

                <FilterContainer>
                    {["Todos", "Prontos", "Esta semana"].map((filter) => (
                        <FilterChip
                            key={filter}
                            active={activeFilter === filter}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <FilterChipText active={activeFilter === filter}>
                                {filter}
                            </FilterChipText>
                        </FilterChip>
                    ))}
                </FilterContainer>
            </ScreenHeader>

            {loading ? (
                <ActivityIndicator
                    animating
                    color="#e85d22"
                    size={60}
                    style={{ marginTop: 40 }}
                />
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", marginTop: 50 }}>
                            <RowText>Nenhum encarte encontrado.</RowText>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <FlyerContainer>
                            <FlyerTitle>Preço Atual do Camarão</FlyerTitle>

                            <FlyerBody>
                                <FlyerContentShrimpImage>
                                    <FlyerShrimpImageCircle>
                                        <FlyerShrimpImage
                                            source={ShririmpBanner}
                                            resizeMode="contain"
                                        />
                                    </FlyerShrimpImageCircle>
                                </FlyerContentShrimpImage>

                                <FlyerContentDataInfo>
                                    <FlyerDataRow $withDivider>
                                        <FlyerIconContainer>
                                            <FlyerShrimpMiniIcon
                                                source={ShririmpBanner}
                                                resizeMode="contain"
                                            />
                                        </FlyerIconContainer>
                                        <FlyerLabelText numberOfLines={1}>
                                            Camarão de:
                                        </FlyerLabelText>
                                        <FlyerValueText>
                                            {classifyShrimpSize(item.grammage)}
                                        </FlyerValueText>
                                    </FlyerDataRow>

                                    <FlyerDataRow $withDivider>
                                        <FlyerIconContainer>
                                            <MaterialCommunityIcons
                                                name="tag-outline"
                                                size={16}
                                                color="#e85d22"
                                            />
                                        </FlyerIconContainer>
                                        <FlyerLabelText>Preço do camarão:</FlyerLabelText>
                                        <FlyerValueText>
                                            {item.totalSaleValue
                                                ? `R$ ${formatPriceValue(item.totalSaleValue)}`
                                                : item.grammageValue
                                                    ? `R$ ${formatPriceValue(
                                                          calculateShrimpSalePrice(
                                                              item.grammageValue,
                                                              item.grammage,
                                                          ),
                                                      )}`
                                                    : "-"}
                                        </FlyerValueText>
                                    </FlyerDataRow>

                                    <FlyerDataRow $withDivider>
                                        <FlyerIconContainer>
                                            <Feather name="calendar" size={15} color="#e85d22" />
                                        </FlyerIconContainer>
                                        <FlyerLabelText>Despesca:</FlyerLabelText>
                                        <FlyerValueText>
                                            {item.saleDate || "-"}
                                        </FlyerValueText>
                                    </FlyerDataRow>

                                    <FlyerDataRow $isLocation>
                                        <FlyerIconContainer>
                                            <Feather name="map-pin" size={15} color="#e85d22" />
                                        </FlyerIconContainer>
                                        <FlyerLabelText>Localidade:</FlyerLabelText>
                                        <FlyerValueText
                                            numberOfLines={2}
                                            $fontSize={getLocationFontSize(item.location)}
                                        >
                                            {item.location}
                                        </FlyerValueText>
                                    </FlyerDataRow>
                                </FlyerContentDataInfo>
                            </FlyerBody>
                        </FlyerContainer>
                    )}
                />
            )}
        </Container>
    );
};
