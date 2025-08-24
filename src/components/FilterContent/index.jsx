/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */

import React, { useEffect, useState } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Dimensions, View } from "react-native";

import { Input } from "../Input";
import SelectComponent from "../SelectComponent";

import {
    ButtonClear,
    ButtonFilter,
    ButtonQuantity,
    Container,
    ContentButtonAction,
    ContentButtonBack,
    ContentFilterActions,
    ContentFilterStyle,
    ContentViewSeparator,
    ScrollTest,
    TextButtonQuantity,
    TextClear,
    TextFilter,
    TitleFilter,
} from "./styles";

export const FilterContent = ({
    width,
    showFilter,
    onClose,
    onClear,
    hideData,
    dataFilter,
    actionFilter = () => {},
}) => {
    const { height } = Dimensions.get("screen");

    const animatedStyle = useAnimatedStyle(() => ({
        width: width.value,
        height: height - 60,
    }));
    const [kiloFilter, setKiloFilter] = useState("");
    const [selectedPonds, setSelectedPonds] = useState([]);
    const [selectedGrammage, setSelectedGrammage] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");

    useEffect(() => {
        const dataLocations = [
            ...new Set(dataFilter.map((data) => data.location.split("/")[1])),
        ];

        setStates(dataLocations);
    }, [dataFilter]);

    const getPonds = () => {
        const dataPonds = dataFilter.map((data) => data.ponds);

        const orderPonds = dataPonds.filter(
            (value, index, self) => self.indexOf(value) === index,
        );

        return orderPonds.sort((a, b) => a - b);
    };

    const getGrammage = () => {
        const dataGrammage = dataFilter.map((data) =>
            data.shrimps.map((shrimp) => shrimp.grammage),
        );

        const filterGrammage = dataGrammage.reduce(
            (accumulator, currentValue) => accumulator.concat(currentValue),
            [],
        );

        const selfGrammage = filterGrammage.filter(
            (value, index, self) => self.indexOf(value) === index,
        );

        return selfGrammage.sort((a, b) => a - b);
    };

    const handleSelectPonds = (dataPond) => {
        if (selectedPonds.includes(dataPond)) {
            setSelectedPonds(selectedPonds.filter((pond) => pond !== dataPond));
        } else {
            setSelectedPonds((pond) => [...pond, dataPond]);
        }
    };

    const handleSelectGrammage = (dataGrammage) => {
        setSelectedGrammage(dataGrammage);
    };

    const handleSelectState = (value) => {
        setSelectedState(value);

        const dataCity = [
            ...new Set(
                dataFilter.flatMap((data) =>
                    data.location.includes(value)
                        ? [data.location.split("/")[0]]
                        : [],
                ),
            ),
        ].sort((a, b) => a - b);

        setCities(dataCity);
    };

    const handleClearFilter = () => {
        setKiloFilter("");
        setSelectedPonds([]);
        setSelectedGrammage([]);
        setSelectedState("");
        setSelectedCity("");

        onClear();
        onClose();
    };

    const renderLocation = (state, city) => {
        if (Array.isArray(city)) {
            return city.map((item) => `${item}/${state}`);
        }

        return `${city}/${state}`;
    };

    const handleGetFilterValues = () => {
        const filterValues = {
            ponds: selectedPonds,
            grammage: selectedGrammage,
            kilo: kiloFilter,
            location: renderLocation(selectedState, selectedCity),
        };

        actionFilter(filterValues);
        onClose();
    };

    return (
        showFilter && (
            <ScrollTest>
                <Container>
                    <ContentButtonBack onPress={onClose} />
                    <Animated.View style={[animatedStyle]}>
                        <ContentFilterStyle>
                            {!hideData && (
                                <ContentViewSeparator>
                                    <View>
                                        <TitleFilter>
                                            Quantidade de Viveiros
                                        </TitleFilter>
                                        <ContentButtonAction>
                                            {getPonds().map((pond) => (
                                                <ButtonQuantity
                                                    key={pond}
                                                    onPress={() =>
                                                        handleSelectPonds(pond)
                                                    }
                                                    selected={selectedPonds.includes(
                                                        pond,
                                                    )}
                                                >
                                                    <TextButtonQuantity
                                                        selected={selectedPonds.includes(
                                                            pond,
                                                        )}
                                                    >
                                                        {pond}
                                                    </TextButtonQuantity>
                                                </ButtonQuantity>
                                            ))}
                                        </ContentButtonAction>
                                        <TitleFilter>
                                            Gramatura do Camarão
                                        </TitleFilter>
                                        <SelectComponent
                                            title="Seleciona a gramatura"
                                            options={getGrammage()}
                                            action={handleSelectGrammage}
                                            style={{ marginBottom: 3 }}
                                            multipleSelect
                                            sufix="g"
                                        />
                                        <TitleFilter>
                                            Quilo do Camarão
                                        </TitleFilter>
                                        <Input
                                            label="Ex.: 1.000"
                                            keyboardType="numeric"
                                            value={kiloFilter}
                                            onChange={setKiloFilter}
                                        />
                                        <TitleFilter>Estado</TitleFilter>
                                        <SelectComponent
                                            title="Seleciona o Estado"
                                            options={states}
                                            action={handleSelectState}
                                            style={{ marginBottom: 3 }}
                                        />
                                        <TitleFilter>Cidade</TitleFilter>
                                        <SelectComponent
                                            title="Seleciona a Cidade"
                                            options={cities}
                                            action={setSelectedCity}
                                            multipleSelect
                                        />
                                        <ContentFilterActions>
                                            <ButtonClear
                                                onPress={handleClearFilter}
                                            >
                                                <TextClear>Limpar</TextClear>
                                            </ButtonClear>
                                            <ButtonFilter
                                                onPress={handleGetFilterValues}
                                            >
                                                <TextFilter>Filtrar</TextFilter>
                                            </ButtonFilter>
                                        </ContentFilterActions>
                                    </View>
                                </ContentViewSeparator>
                            )}
                        </ContentFilterStyle>
                    </Animated.View>
                </Container>
            </ScrollTest>
        )
    );
};
