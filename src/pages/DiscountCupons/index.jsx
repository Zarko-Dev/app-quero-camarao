/* eslint-disable function-paren-newline */
/* eslint-disable no-nested-ternary */

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, ScrollView } from "react-native";

import { dataRoutes } from "../../routes/dataRoutes";
import { getAllCupons } from "../../controllers/Cupons/getCupom";

import { CardCupom } from "./components/CardCupom";
import { CardEmpty } from "./components/CardEmpty";
import { QuantityCardCupom } from "./components/QuantityCardCupom";
import { TimerCardCupom } from "./components/TimerCardCupom";
import { UnlimitedCardCupom } from "./components/UnlimitedCardCupom";
import { CardCupomSkeleton } from "../../components/Skeleton/CardCupomSkeleton";

import {
    Container,
    ButtonRegister,
    TitleButton,
    ContentSearch,
} from "./styles";
import { SearchBar } from "../../components/SearchBar";

export const DiscountCupons = ({ navigation }) => {
    const [dataIsLoading, setDataIsLoading] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);
    const [dataCupons, setDataCupons] = useState([]);
    const [haveIsDefaultCoupon, setHeaveIsDefaultCoupon] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [filterDataCupons, setFilterDataCupons] = useState([]);

    useFocusEffect(
        useCallback(() => {
            setDataIsLoading(true);

            getAllCupons()
                .then((cupons) => {
                    setDataCupons(cupons);
                    setHeaveIsDefaultCoupon(
                        cupons.filter((item) => item.isDefault === true)[0]
                            .cupomCode,
                    );
                    setDataIsLoading(false);
                })
                .catch(() => {
                    setDataIsLoading(false);
                });
        }, [isRefresh]),
    );

    const showSkeleton = () => {
        const dataSkeleton = [1, 2, 3, 4, 5];

        return dataSkeleton.map((item) => <CardCupomSkeleton key={item} />);
    };

    const handleRedirectRegisterDiscountCupom = () => {
        navigation.navigate(dataRoutes.registerDiscountCupon);
    };

    const refresh = () => {
        setIsRefresh(!isRefresh);
    };

    const handleSearchCupons = (value) => {
        setSearchValue(value);

        if (value !== "") {
            setFilterDataCupons(
                dataCupons.filter((data) =>
                    data.cupomCode.toLowerCase().includes(value),
                ),
            );
        } else {
            setFilterDataCupons([]);
        }
    };

    return (
        <Container>
            <ContentSearch>
                <SearchBar
                    searchText={searchValue}
                    onChange={handleSearchCupons}
                    isLoadingSearch={false}
                />
            </ContentSearch>
            {!dataIsLoading ? (
                dataCupons.length > 0 ? (
                    <FlatList
                        data={
                            filterDataCupons.length > 0 || searchValue !== ""
                                ? filterDataCupons
                                : dataCupons
                        }
                        renderItem={({ item }) => {
                            switch (item.durationType) {
                                case "Quantity":
                                    return (
                                        <CardCupom
                                            cupomCode={item.cupomCode}
                                            isDefault={item.isDefault}
                                            heaveDefaultCoupon={
                                                haveIsDefaultCoupon
                                            }
                                            refresh={refresh}
                                        >
                                            <QuantityCardCupom
                                                durationValue={
                                                    item.durationValue
                                                }
                                                durationInitialValue={
                                                    item.durationInitialValue
                                                }
                                                discountType={item.discountType}
                                                discountValue={
                                                    item.discountValue
                                                }
                                            />
                                        </CardCupom>
                                    );

                                case "Time":
                                    return (
                                        <CardCupom
                                            cupomCode={item.cupomCode}
                                            isDefault={item.isDefault}
                                            heaveDefaultCoupon={
                                                haveIsDefaultCoupon
                                            }
                                            refresh={refresh}
                                        >
                                            <TimerCardCupom
                                                durationValue={
                                                    item.durationValue
                                                }
                                                discountType={item.discountType}
                                                discountValue={
                                                    item.discountValue
                                                }
                                                useCount={item.useCount}
                                            />
                                        </CardCupom>
                                    );

                                case "Unlimited":
                                    return (
                                        <CardCupom
                                            cupomCode={item.cupomCode}
                                            isDefault={item.isDefault}
                                            heaveDefaultCoupon={
                                                haveIsDefaultCoupon
                                            }
                                            refresh={refresh}
                                        >
                                            <UnlimitedCardCupom
                                                discountType={item.discountType}
                                                discountValue={
                                                    item.discountValue
                                                }
                                                useCount={item.useCount}
                                            />
                                        </CardCupom>
                                    );

                                default:
                                    return (
                                        <CardCupom
                                            cupomCode="INVÁLIDO"
                                            isDefault={item.isDefault}
                                            heaveDefaultCoupon={
                                                haveIsDefaultCoupon
                                            }
                                            refresh={refresh}
                                        >
                                            <QuantityCardCupom
                                                durationValue={0}
                                                durationInitialValue={0}
                                                discountType="Value"
                                                discountValue={0}
                                            />
                                        </CardCupom>
                                    );
                            }
                        }}
                        keyExtractor={(item) => item.cupomCode}
                    />
                ) : (
                    <CardEmpty />
                )
            ) : (
                <ScrollView>{showSkeleton()}</ScrollView>
            )}
            <ButtonRegister onPress={handleRedirectRegisterDiscountCupom}>
                <TitleButton>Cadastrar Cupom</TitleButton>
            </ButtonRegister>
        </Container>
    );
};
