import { useEffect, useState } from "react";

import { getCity, getState } from "../../../../utils/getLocation";

import {
    Container,
    ContentInputSelect,
    ContentLocation,
    Header,
    SelectComponentStyle,
    TextHeader,
    TextInputSelect,
} from "./styles";

export const CardLocationPublication = ({
    getDataState,
    getDataCity,
    editState,
    editCity,
}) => {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [clearCities, setClearCities] = useState(false);

    useEffect(() => {
        getState()
            .then((dataState) => setStates(dataState))
            .catch();
    }, []);

    const handleSelectState = async (uf) => {
        setClearCities(!clearCities);
        getDataState(uf);
        setCities(await getCity(uf));
    };

    const setSelectedCity = (city) => {
        getDataCity(city);
    };

    return (
        <Container>
            <Header>
                <TextHeader>Localização</TextHeader>
            </Header>
            <ContentLocation>
                <ContentInputSelect>
                    <TextInputSelect>Estado</TextInputSelect>
                    <SelectComponentStyle
                        title="Selecione o Estado"
                        initialTitle={editState}
                        options={states}
                        action={handleSelectState}
                        disabled={!!editState}
                    />
                </ContentInputSelect>
                <ContentInputSelect>
                    <TextInputSelect>Cidade</TextInputSelect>
                    <SelectComponentStyle
                        title="Selecione a Cidade"
                        initialTitle={editCity}
                        options={cities}
                        action={setSelectedCity}
                        clear={clearCities}
                        disabled={!!editCity}
                    />
                </ContentInputSelect>
            </ContentLocation>
        </Container>
    );
};
