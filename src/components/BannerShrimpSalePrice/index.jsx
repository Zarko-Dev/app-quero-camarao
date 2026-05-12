/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    BannerBody,
    BannerContainer,
    BannerTitle,
    ContentShirimpImage,
    ShrimpImage,
    ShrimpImageCircle,
    ContentDataInfo,
    DataRowsGroup,
    DataRow,
    IconContainer,
    ShrimpMiniIcon,
    LabelText,
    ValueText,
} from "./styles";

import ShririmpBanner from "../../assets/images/camaraoBanner.png";
import { getShirimpSaleByCreatedAtLastSevenDays } from "../../controllers/ShirimpSale/sale";
import { BannerShirimpSaleSkeleton } from "../Skeleton/BannerShirimpSaleSkeleton";

let cachedSalesBanner = [];

export const BannerShrimpSalePrice = ({ open }) => {
    const [dataSales, setDataSales] = useState(cachedSalesBanner);
    const [loading, setLoading] = useState(cachedSalesBanner.length === 0);
    const [currentIndex, setCurrentIndex] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                const resultData =
                    await getShirimpSaleByCreatedAtLastSevenDays();
                let nextData = [];

                if (resultData.length === 0) {
                    nextData = [
                        {
                            location: "-",
                            data: [
                                {
                                    grammage: "-",
                                    grammageValue: "-",
                                    saleDate: "-",
                                },
                            ],
                        },
                    ];
                } else {
                    nextData = resultData.map((item) => ({
                            location: item.location || "-",
                            data: Array.isArray(item.sales) && item.sales.length > 0
                                ? item.sales.map((data) => ({
                                    grammage: data?.grammage ?? "-",
                                    grammageValue: data?.grammageValue ?? "-",
                                    saleDate: data?.saleDate ?? "-",
                                }))
                                : [
                                    {
                                        grammage: "-",
                                        grammageValue: "-",
                                        saleDate: "-",
                                    },
                                ],
                        }));
                }

                cachedSalesBanner = nextData;
                setDataSales(nextData);
                setLoading(false);
            };

            getData();
        }, []),
    );

    useEffect(() => {
        if (currentIndex >= dataSales.length) {
            setCurrentIndex(0);
        }
    }, [currentIndex, dataSales.length]);

    useEffect(() => {
        if (dataSales.length <= 1) {
            return undefined;
        }

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % dataSales.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [dataSales.length]);

    const currentItem = dataSales[currentIndex]?.data?.[0] || {
        grammage: "-",
        grammageValue: "-",
        saleDate: "-",
    };
    const currentLocation = dataSales[currentIndex]?.location || "-";

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

    return loading ? (
        <BannerShirimpSaleSkeleton />
    ) : (
        <BannerContainer onPress={open}>
            <BannerTitle>{"Pre\u00e7o Atual do Camar\u00e3o"}</BannerTitle>

            <BannerBody>
                <ContentShirimpImage>
                    <ShrimpImageCircle>
                        <ShrimpImage source={ShririmpBanner} resizeMode="contain" />
                    </ShrimpImageCircle>
                </ContentShirimpImage>

                <ContentDataInfo>
                    <DataRowsGroup>
                        <DataRow $withDivider>
                            <IconContainer>
                                <ShrimpMiniIcon source={ShririmpBanner} resizeMode="contain" />
                            </IconContainer>
                            <LabelText numberOfLines={1}>{"Camar\u00e3o de:"}</LabelText>
                            <ValueText>{classifyShrimpSize(currentItem.grammage)}</ValueText>
                        </DataRow>

                        <DataRow $withDivider>
                            <IconContainer>
                                <MaterialCommunityIcons name="tag-outline" size={20} color="#e85d22" />
                            </IconContainer>
                            <LabelText>{"Pre\u00e7o Kg:"}</LabelText>
                            <ValueText>R$ {currentItem.grammageValue ? `${currentItem.grammageValue},00` : "-"}</ValueText>
                        </DataRow>

                        <DataRow $withDivider>
                            <IconContainer>
                                <Feather name="calendar" size={19} color="#e85d22" />
                            </IconContainer>
                            <LabelText>Despesca:</LabelText>
                            <ValueText>{currentItem.saleDate || "-"}</ValueText>
                        </DataRow>

                        <DataRow $isLocation>
                            <IconContainer>
                                <Feather name="map-pin" size={19} color="#e85d22" />
                            </IconContainer>
                            <LabelText>Localidade:</LabelText>
                            <ValueText
                                numberOfLines={2}
                                $fontSize={getLocationFontSize(currentLocation)}
                            >
                                {currentLocation}
                            </ValueText>
                        </DataRow>
                    </DataRowsGroup>
                </ContentDataInfo>
            </BannerBody>
        </BannerContainer>
    );
};
