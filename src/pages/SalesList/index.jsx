/* eslint-disable operator-linebreak */
import { FlatList, TouchableOpacity, View } from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native-paper";

import {
    Body,
    ButtonChatProductor,
    ButtonText,
    CardHeader,
    CardHeaderInfo,
    CardItemSale,
    Container,
    DespescaContainer,
    DottedLine,
    FilterChip,
    FilterChipText,
    FilterContainer,
    Footer,
    GrammagePill,
    GrammageText,
    HeaderSubtitle,
    HeaderText,
    HeaderTitle,
    HeaderTitleContainer,
    HeaderTopRow,
    HorizontalLine,
    InfoSection,
    LocationTextContainer,
    PondRow,
    ProfileIconContainer,
    ProntoBadge,
    ProntoBadgeText,
    RowText,
    RowWeightText,
    ScreenHeader,
    SearchContainer,
    SearchInput,
    ShrimpIconHeader,
    SubtitleHeader,
    TableCol,
    TableContainer,
    TableHeader,
    TableRow,
    TableSection,
    TableText,
    TableTitle,
    TableTitleContainer,
    TitleDespesca,
    TitleHeader,
    TitleLine,
} from "./styles";
import { getLatestShrimpPonds } from "../../controllers/ShrimpPonds/getAll";
import { getShirimpSaleByCreatedAtLastSevenDays } from "../../controllers/ShirimpSale/sale";
import { getDataUserByIds } from "../../controllers/User/authentication";
import { dataRoutes } from "../../routes/dataRoutes";
import shrimpIcon from "../../assets/images/shrimpIcon.png";
import { redirectWhatsappLink } from "../../utils/redirectFunctions";

export const SalesList = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [dataSales, setDataSales] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [priceTable, setPriceTable] = useState({});
    const [searchValue, setSearchValue] = useState("");
    const [activeFilter, setActiveFilter] = useState("Todos");

    const formatDate = (date) => {
        if (!date) return "-";

        let parsedDate = date;
        if (date.seconds) {
            parsedDate = new Date(date.seconds * 1000);
        } else if (!(date instanceof Date)) {
            parsedDate = new Date(date);
        }

        return parsedDate.toLocaleDateString("pt-BR");
    };

    const getPriceData = async () => {
        try {
            const sales = await getShirimpSaleByCreatedAtLastSevenDays();
            const table = {};

            sales.forEach((saleDoc) => {
                const location = saleDoc.location;
                if (!table[location]) table[location] = {};

                if (Array.isArray(saleDoc.sales)) {
                    saleDoc.sales.forEach((sale) => {
                        const grammage = sale?.grammage
                            ?.toString()
                            .replace(/[^0-9]/g, "");

                        if (grammage && !table[location][grammage]) {
                            table[location][grammage] = sale.grammageValue;
                        }
                    });
                }
            });

            setPriceTable(table);
        } catch (error) {
            console.error(error);
        }
    };

    const getData = async () => {
        try {
            setLoading(true);
            await getPriceData();

            const resultData = await getLatestShrimpPonds();
            setDataSales(resultData);

            if (resultData.length > 0) {
                setLastVisible(resultData[resultData.length - 1]);
            }
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

    const handleLoadMore = async () => {
        if (loadingMore || !lastVisible || searchValue !== "") return;

        setLoadingMore(true);
        const nextData = await getLatestShrimpPonds(lastVisible);

        if (nextData.length > 0) {
            setDataSales((prev) => [...prev, ...nextData]);
            setLastVisible(nextData[nextData.length - 1]);
        } else {
            setLastVisible(null);
        }

        setLoadingMore(false);
    };

    const filteredData = useMemo(() => {
        if (!searchValue) return dataSales;

        const term = searchValue.toLowerCase();
        return dataSales.filter((item) =>
            item.location?.toLowerCase().includes(term),
        );
    }, [dataSales, searchValue]);

    const handleChatProductor = async (userId) => {
        const whatsappMessage =
            "Ola, venho atraves do aplicativo *Quero Camarao*\\n\\nVi seu viveiro cadastrado recentemente e gostaria de algumas informacoes adicionais. Poderia me ajudar?";

        const dataProductor = await getDataUserByIds([userId]);

        if (dataProductor && dataProductor[0]) {
            const contactNumber = dataProductor[0].phone?.replace(/\D/g, "");
            if (!contactNumber) return;

            navigation.navigate(dataRoutes.redirect, {
                subtext: "Estamos lhe redirecionado ao whatsapp do produtor que selecionou",
                actionRediret: redirectWhatsappLink(
                    contactNumber,
                    whatsappMessage,
                    navigation,
                ),
            });
        }
    };

    return (
        <Container>
            <ScreenHeader>
                <HeaderTopRow>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={28} color="white" />
                    </TouchableOpacity>

                    <HeaderTitleContainer>
                        <HeaderTitle>Ultimos Viveiros</HeaderTitle>
                        <HeaderSubtitle>
                            Viveiros disponiveis para despesca
                        </HeaderSubtitle>
                    </HeaderTitleContainer>

                    <ProfileIconContainer>
                        <ShrimpIconHeader source={shrimpIcon} resizeMode="contain" />
                    </ProfileIconContainer>
                </HeaderTopRow>

                <SearchContainer>
                    <Feather name="search" size={20} color="#888" />
                    <SearchInput
                        placeholder="Buscar por cidade ou especie"
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
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.8}
                    removeClippedSubviews
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", marginTop: 50 }}>
                            <RowText>Nenhum viveiro encontrado.</RowText>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <CardItemSale>
                            <CardHeader>
                                <CardHeaderInfo>
                                    <Feather name="map-pin" size={24} color="white" />
                                    <LocationTextContainer>
                                        <TitleHeader>{item.location}</TitleHeader>
                                        <SubtitleHeader>Especie: Cinza</SubtitleHeader>
                                    </LocationTextContainer>
                                </CardHeaderInfo>

                                <ProntoBadge>
                                    <Feather name="clock" size={16} color="#e85d22" />
                                    <ProntoBadgeText>Pronto</ProntoBadgeText>
                                </ProntoBadge>
                            </CardHeader>

                            <Body>
                                {Array.isArray(item.shrimps) &&
                                    item.shrimps.map((shrimp, index) => (
                                        <PondRow key={index}>
                                            <GrammagePill>
                                                <GrammageText>
                                                    {shrimp?.grammage}g
                                                </GrammageText>
                                            </GrammagePill>
                                            <DottedLine />
                                            <RowWeightText>{shrimp?.kilo} kg</RowWeightText>
                                        </PondRow>
                                    ))}

                                <InfoSection>
                                    <DespescaContainer>
                                        <Feather name="clock" size={24} color="#e85d22" />
                                        <TitleDespesca>
                                            Despesca: {formatDate(item.createdAt)}
                                        </TitleDespesca>
                                    </DespescaContainer>

                                    <HorizontalLine />

                                    {Array.isArray(item.shrimps) &&
                                        item.shrimps.some((shrimp) => {
                                            const gramKey = shrimp?.grammage
                                                ?.toString()
                                                .replace(/[^0-9]/g, "");

                                            return (
                                                gramKey &&
                                                priceTable[item.location]?.[gramKey]
                                            );
                                        }) && (
                                            <TableSection>
                                                <TableTitleContainer>
                                                    <TitleLine />
                                                    <TableTitle>Valores de Tabela</TableTitle>
                                                    <TitleLine />
                                                </TableTitleContainer>

                                                <TableContainer>
                                                    <TableHeader>
                                                        <TableCol>
                                                            <HeaderText>gramatura</HeaderText>
                                                        </TableCol>
                                                        <TableCol noBorder>
                                                            <HeaderText>preco</HeaderText>
                                                        </TableCol>
                                                    </TableHeader>

                                                    {item.shrimps.map((shrimp, index) => {
                                                        const gramKey = shrimp?.grammage
                                                            ?.toString()
                                                            .replace(/[^0-9]/g, "");
                                                        if (!gramKey) return null;

                                                        const price =
                                                            priceTable[item.location]?.[gramKey];

                                                        if (!price) return null;

                                                        return (
                                                            <TableRow key={`table-row-${index}`}>
                                                                <TableCol>
                                                                    <TableText>
                                                                        {shrimp.grammage}g
                                                                    </TableText>
                                                                </TableCol>
                                                                <TableCol noBorder>
                                                                    <TableText>
                                                                        R$ {price},00
                                                                    </TableText>
                                                                </TableCol>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableContainer>
                                            </TableSection>
                                        )}
                                </InfoSection>
                            </Body>

                            <Footer>
                                <ButtonChatProductor
                                    onPress={() => handleChatProductor(item.userId)}
                                >
                                    <FontAwesome
                                        name="whatsapp"
                                        size={28}
                                        color="white"
                                    />
                                    <ButtonText>Falar com o Produtor</ButtonText>
                                </ButtonChatProductor>
                            </Footer>
                        </CardItemSale>
                    )}
                />
            )}
        </Container>
    );
};
