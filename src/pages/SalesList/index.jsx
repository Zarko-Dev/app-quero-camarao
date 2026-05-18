/* eslint-disable operator-linebreak */
import { FlatList, TouchableOpacity, View } from "react-native";
import { FontAwesome, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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
    FlyerFooter,
    FlyerButtonChatProductor,
    FlyerButtonText,
} from "./styles";
import { getShirimpSaleByCreatedAtLastThirtyDays } from "../../controllers/ShirimpSale/sale";
import { getDataUserByIds } from "../../controllers/User/authentication";
import { dataRoutes } from "../../routes/dataRoutes";
import shrimpIcon from "../../assets/images/shrimpIcon.png";
import ShririmpBanner from "../../assets/images/camaraoBanner.png";
import { redirectWhatsappLink } from "../../utils/redirectFunctions";

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
                                location: doc.location || "-",
                                contactNumber: doc.contactNumber || "",
                                userId: doc.userId || "",
                                grammage: sale.grammage ?? "-",
                                grammageValue: sale.grammageValue ?? "-",
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

    const filteredData = useMemo(() => {
        let result = dataSales;

        if (searchValue) {
            const term = searchValue.toLowerCase();
            result = result.filter(
                (item) =>
                    item.location?.toLowerCase().includes(term) ||
                    classifyShrimpSize(item.grammage).toLowerCase().includes(term)
            );
        }

        return result;
    }, [dataSales, searchValue]);

    const handleChatProductor = async (item) => {
        const sizeLabel = classifyShrimpSize(item.grammage);
        const whatsappMessage =
            `Olá, venho através do aplicativo *Quero Camarão* 🦐\n\n` +
            `Vi seu encarte do *Preço Atual do Camarão* em *${item.location}*:\n` +
            `- Camarão de: *${sizeLabel}*\n` +
            `- Preço Kg: *R$ ${item.grammageValue},00*\n` +
            `- Despesca: *${item.saleDate}*\n\n` +
            `Gostaria de mais informações. Poderia me ajudar?`;

        const dataProductor = await getDataUserByIds([item.userId]);

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
                                        <FlyerLabelText>Preço Kg:</FlyerLabelText>
                                        <FlyerValueText>
                                            R$ {item.grammageValue ? `${item.grammageValue},00` : "-"}
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
