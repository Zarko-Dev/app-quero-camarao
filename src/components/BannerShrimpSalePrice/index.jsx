/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
import { Animated, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import {
    BannerBody,
    BannerContainer,
    BannerTitle,
    ContentShrimpInfo,
    ContentShirimpImage,
    ShrimpImage,
    ContentDataInfo,
    InfoTag,
    InfoTagText,
    ContantData,
    DataText,
} from "./styles";

import ShririmpBanner from "../../assets/images/camaraoBanner.png";
import { getShirimpSaleByCreatedAtLastSevenDays } from "../../controllers/ShirimpSale/sale";
import { BannerShirimpSaleSkeleton } from "../Skeleton/BannerShirimpSaleSkeleton";

export const BannerShrimpSalePrice = ({ open }) => {
    const [dataSales, setDataSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const calculateFontSize = (size) => {
        const baseSize = 16;
        const baseFontSize = 18;
        const minFontSize = 13;

        const proportionalFontSize = Math.max(
            minFontSize,
            Math.floor(baseFontSize - (size - baseSize) * 0.5),
        );

        return proportionalFontSize;
    };

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                const resultData =
                    await getShirimpSaleByCreatedAtLastSevenDays();

                setLoading(false);

                if (resultData.length === 0) {
                    Toast.show({
                        type: "info",
                        text1: "Nenhuma venda encontrada!",
                        text2: "Não foi realizado nenhuma venda nos últimos 7 dias!",
                    });

                    setDataSales([
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
                    ]);
                } else {
                    setDataSales(
                        resultData.map((item) => ({
                            location: item.location,
                            data: item.sales.map((data) => ({
                                grammage: data.grammage,
                                grammageValue: data.grammageValue,
                                saleDate: data.saleDate,
                            })),
                        })),
                    );
                }
            };

            getData();
        }, []),
    );

    const fadeOutIn = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {
        if (dataSales.length > 0) {
            const interval = setInterval(() => {
                fadeOutIn();
                setTimeout(() => {
                    setCurrentIndex(
                        (prevIndex) => (prevIndex + 1) % dataSales.length,
                    );
                }, 500);
            }, 4000);

            return () => clearInterval(interval);
        }

        return undefined;
    }, [dataSales]);

    const currentItem = dataSales[currentIndex]?.data[0] || {};
    const currentLocation = dataSales[currentIndex]?.location || "-";

    const classifyShrimpSize = (grammage) => {
        const numericGrammage = parseFloat(grammage.replace(",", "."));

        if (numericGrammage >= 7.5 && numericGrammage <= 9.9) {
            return `${grammage} gramas (P)`;
        }
        if (numericGrammage >= 10 && numericGrammage <= 14.9) {
            return `${grammage} gramas (M)`;
        }
        if (numericGrammage >= 15 && numericGrammage <= 19.9) {
            return `${grammage} gramas (G)`;
        }
        if (numericGrammage >= 20 && numericGrammage <= 22) {
            return `${grammage} gramas (GG)`;
        }
        if (numericGrammage > 22) {
            return `${grammage} gramas (XG)`;
        }
        return `${grammage} gramas (Tamanho não identificado)`;
    };

    return loading ? (
        <BannerShirimpSaleSkeleton />
    ) : (
        <BannerContainer onPress={open}>
            <View>
                <BannerTitle>Preço Atual do Camarão</BannerTitle>
            </View>

            <BannerBody>
                <ContentShrimpInfo>
                    <ContentDataInfo>
                        <InfoTag>
                            <InfoTagText>Camarão de: </InfoTagText>
                        </InfoTag>
                        <InfoTag>
                            <InfoTagText>Preço Kg: </InfoTagText>
                        </InfoTag>
                        <InfoTag>
                            <InfoTagText>Despesca: </InfoTagText>
                        </InfoTag>
                        <InfoTag>
                            <InfoTagText>Localidade: </InfoTagText>
                        </InfoTag>
                    </ContentDataInfo>
                    <ContentShirimpImage>
                        <ShrimpImage source={ShririmpBanner} />
                    </ContentShirimpImage>
                </ContentShrimpInfo>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <ContantData>
                        <DataText textSize={20}>
                            {currentItem.grammage
                                ? classifyShrimpSize(currentItem.grammage)
                                : "-"}
                        </DataText>
                        <DataText textSize={20}>
                            R${" "}
                            {currentItem.grammageValue
                                ? `${currentItem.grammageValue},00`
                                : "-"}
                        </DataText>
                        <DataText textSize={20}>
                            {currentItem.saleDate || "-"}
                        </DataText>
                        <DataText
                            textSize={calculateFontSize(currentLocation.length)}
                        >
                            {currentLocation}
                        </DataText>
                    </ContantData>
                </Animated.View>
            </BannerBody>
        </BannerContainer>
    );
};
