/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Animated, Easing, useWindowDimensions } from "react-native";
import {
    BannerBody,
    BannerContainer,
    BannerTitle,
    ContentShirimpImage,
    ShrimpImage,
    ShrimpImageCircle,
    ContentDataInfo,
    DataRow,
    IconContainer,
    ShrimpMiniIcon,
    LabelText,
    ValueText,
    AnimatedDataRowsGroup,
} from "./styles";

import ShririmpBanner from "../../assets/images/camaraoBanner.png";
import { getShirimpSaleLastTen } from "../../controllers/ShirimpSale/sale";
import { BannerShirimpSaleSkeleton } from "../Skeleton/BannerShirimpSaleSkeleton";
import { dataRoutes } from "../../routes/dataRoutes";

let cachedSalesBanner = [];

export const BannerShrimpSalePrice = () => {
    const navigation = useNavigation();
    const { width: screenWidth } = useWindowDimensions();
    const isCompact = screenWidth <= 390;

    const [dataSales, setDataSales] = useState(cachedSalesBanner);
    const [loading, setLoading] = useState(cachedSalesBanner.length === 0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const transitionAnim = useState(new Animated.Value(1))[0];

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                const resultData = await getShirimpSaleLastTen();
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

    useEffect(() => {
        Animated.sequence([
            Animated.timing(transitionAnim, {
                toValue: 0,
                duration: 140,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
            Animated.timing(transitionAnim, {
                toValue: 1,
                duration: 420,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, [currentIndex, transitionAnim]);

    const currentItem = dataSales[currentIndex]?.data?.[0] || {
        grammage: "-",
        grammageValue: "-",
        saleDate: "-",
    };
    const currentLocation = dataSales[currentIndex]?.location || "-";
    const animatedRowsStyle = {
        opacity: transitionAnim,
        transform: [
            {
                translateY: transitionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                }),
            },
        ],
    };

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

    const handleOpenSalesList = () => {
        navigation.navigate(dataRoutes.salesList);
    };

    return loading ? (
        <BannerShirimpSaleSkeleton />
    ) : (
        <BannerContainer
            $compact={isCompact}
            activeOpacity={0.85}
            onPress={handleOpenSalesList}
        >
            <Feather
                name="chevron-right"
                size={24}
                color="#e85d22"
                style={{
                    position: "absolute",
                    right: isCompact ? 10 : 14,
                    top: isCompact ? 10 : 14,
                    zIndex: 10,
                }}
            />
            <BannerTitle $compact={isCompact}>
                {"Pre\u00e7o Atual do Camar\u00e3o"}
            </BannerTitle>

            <BannerBody>
                <ContentShirimpImage $compact={isCompact}>
                    <ShrimpImageCircle $compact={isCompact}>
                        <ShrimpImage
                            source={ShririmpBanner}
                            resizeMode="contain"
                            $compact={isCompact}
                        />
                    </ShrimpImageCircle>
                </ContentShirimpImage>

                <ContentDataInfo>
                    <AnimatedDataRowsGroup
                        style={animatedRowsStyle}
                        $compact={isCompact}
                    >
                        <DataRow $withDivider $compact={isCompact}>
                            <IconContainer $compact={isCompact}>
                                <ShrimpMiniIcon
                                    source={ShririmpBanner}
                                    resizeMode="contain"
                                    $compact={isCompact}
                                />
                            </IconContainer>
                            <LabelText numberOfLines={1} $compact={isCompact}>
                                {"Camar\u00e3o de:"}
                            </LabelText>
                            <ValueText $compact={isCompact}>
                                {classifyShrimpSize(currentItem.grammage)}
                            </ValueText>
                        </DataRow>

                        <DataRow $withDivider $compact={isCompact}>
                            <IconContainer $compact={isCompact}>
                                <MaterialCommunityIcons name="tag-outline" size={20} color="#e85d22" />
                            </IconContainer>
                            <LabelText $compact={isCompact}>
                                {"Pre\u00e7o Kg:"}
                            </LabelText>
                            <ValueText $compact={isCompact}>
                                R$ {currentItem.grammageValue ? `${currentItem.grammageValue},00` : "-"}
                            </ValueText>
                        </DataRow>

                        <DataRow $withDivider $compact={isCompact}>
                            <IconContainer $compact={isCompact}>
                                <Feather name="calendar" size={19} color="#e85d22" />
                            </IconContainer>
                            <LabelText $compact={isCompact}>Despesca:</LabelText>
                            <ValueText $compact={isCompact}>
                                {currentItem.saleDate || "-"}
                            </ValueText>
                        </DataRow>

                        <DataRow $isLocation $compact={isCompact}>
                            <IconContainer $compact={isCompact}>
                                <Feather name="map-pin" size={19} color="#e85d22" />
                            </IconContainer>
                            <LabelText $compact={isCompact}>Localidade:</LabelText>
                            <ValueText
                                numberOfLines={2}
                                $fontSize={getLocationFontSize(currentLocation)}
                                $compact={isCompact}
                            >
                                {currentLocation}
                            </ValueText>
                        </DataRow>
                    </AnimatedDataRowsGroup>
                </ContentDataInfo>
            </BannerBody>

        </BannerContainer>
    );
};
