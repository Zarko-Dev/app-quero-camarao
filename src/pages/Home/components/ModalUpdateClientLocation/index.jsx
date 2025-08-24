import { useEffect, useState } from "react";
import { Modal, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import {
    GetUserStorage,
    SetUserStorage,
} from "../../../../services/Storage/UserStorage";
import { getCity, getState } from "../../../../utils/getLocation";

import {
    ButtonConcludedRegister,
    ButtonHeader,
    CancelText,
    Container,
    ContentForm,
    Divider,
    HeaderContent,
    HeaderTitle,
    SelectComponentStyle,
    TextButton,
    Title,
} from "./styles";
import { BoxShadowIos } from "../../../../styles/IosShadow";
import { updateClientUserLocation } from "../../../../controllers/User/update";

export const ModalUpdateClientLocation = ({ isVisible = false, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [state, setState] = useState("");
    const [cities, setCities] = useState([]);
    const [city, setCity] = useState("");
    const [clearCities, setClearCities] = useState(false);

    useEffect(() => {
        getState()
            .then((dataState) => setStates(dataState))
            .catch();
    }, []);

    const handleSelectState = async (uf) => {
        setClearCities(!clearCities);
        setState(uf);
        setCities(await getCity(uf));
    };

    const setSelectedCity = (dataCity) => {
        setCity(dataCity);
    };

    const handleUpdateClientLocation = async () => {
        setIsLoading(true);

        if (state !== "" && city !== "") {
            const dataUser = await GetUserStorage();

            const resultUpdateClientLocation = await updateClientUserLocation(
                state,
                city,
                dataUser.email,
            );

            if (resultUpdateClientLocation) {
                await SetUserStorage({ ...dataUser, state, city });

                onClose();

                Toast.show({
                    type: "success",
                    text1: "Local atualizado!",
                    text2: "A Quero Camarão agardece sua ajuda!",
                });
            } else {
                onClose();

                Toast.show({
                    type: "error",
                    text1: "Não foi possível atualizar seu local!",
                    text2: "Tente novamente em instantes!",
                });
            }
        }

        setIsLoading(false);
    };

    return (
        <Container>
            <Modal
                animationType="slide"
                visible={isVisible}
                onRequestClose={onClose}
            >
                <SafeAreaView>
                    <HeaderContent>
                        <ButtonHeader onPress={onClose}>
                            <Feather
                                name="arrow-left"
                                size={24}
                                color="black"
                            />
                        </ButtonHeader>
                        <HeaderTitle>Atualize seu local!</HeaderTitle>
                        <ButtonHeader onPress={onClose}>
                            <CancelText>Cancelar</CancelText>
                        </ButtonHeader>
                    </HeaderContent>
                    <Divider />
                    <ContentForm>
                        <Title>Mantenha seus dados atualizados!</Title>
                        <SelectComponentStyle
                            title="Selecione o Estado"
                            options={states}
                            action={handleSelectState}
                        />
                        <SelectComponentStyle
                            title="Selecione a Cidade"
                            options={cities}
                            action={setSelectedCity}
                            clear={clearCities}
                        />

                        <ButtonConcludedRegister
                            onPress={handleUpdateClientLocation}
                            style={BoxShadowIos}
                        >
                            {!isLoading ? (
                                <TextButton>Atualizar Local</TextButton>
                            ) : (
                                <ActivityIndicator animating color="white" />
                            )}
                        </ButtonConcludedRegister>
                    </ContentForm>
                </SafeAreaView>
            </Modal>
        </Container>
    );
};
