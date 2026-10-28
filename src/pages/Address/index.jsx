import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import {
    ClearUserStorage,
    SetUserStorage,
} from "../../services/Storage/UserStorage";
import { getCity, getLocationByCep, getState } from "../../utils/getLocation";
import { getUserAddressValue } from "../../utils/userAddress";
import { addressValidationForm } from "./validationForm";

import { Input } from "../../components/Input";
import { UpdateUserAddress } from "../../controllers/User/updateAddress";

import {
    ButtonSaveAddress,
    CardFormAddress,
    Container,
    ContentPhone,
    InputPhoneStyleDDD,
    InputPhoneStylePhone,
    SelectComponentStyle,
    TextButtonSaveAddress,
    TitleCardAddress,
} from "./styles";

export const Address = ({ route }) => {
    const navigation = useNavigation();

    const { dataUser } = route.params;

    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [cep, setCep] = useState(getUserAddressValue(dataUser, "cep"));
    const [state, setState] = useState(getUserAddressValue(dataUser, "state") || undefined);
    const [states, setStates] = useState([]);
    const [city, setCity] = useState(getUserAddressValue(dataUser, "city") || undefined);
    const [cities, setCities] = useState([]);
    const [neighborhood, setNeighborhood] = useState(
        getUserAddressValue(dataUser, "neighborhood"),
    );
    const [street, setStreet] = useState(getUserAddressValue(dataUser, "street"));
    const [number, setNumber] = useState(getUserAddressValue(dataUser, "number"));
    const [complement, setComplement] = useState(
        getUserAddressValue(dataUser, "complement"),
    );

    useEffect(() => {
        getState()
            .then((dataState) => setStates(dataState))
            .catch();
    }, []);

    const handleGetAddressWithCep = async (dataCep) => {
        setCep(dataCep);

        if (dataCep !== "" && dataCep.length === 9) {
            setIsLoadingCep(true);
            const dataLocation = await getLocationByCep(dataCep);

            if (dataLocation) {
                setState(dataLocation.state);
                setCity(dataLocation.city);
                setNeighborhood(dataLocation.neighborhood);
                setStreet(dataLocation.street);
            }

            setIsLoadingCep(false);
        }
    };

    const handleSelectState = async (uf) => {
        setState(uf);
        setCity();
        setCities(await getCity(uf));
    };

    const setSelectedCity = (dataCity) => {
        setCity(dataCity);
    };

    const handleSaveAddress = async () => {
        if (
            addressValidationForm({
                cep,
                state,
                city,
                neighborhood,
                street,
                number,
            })
        ) {
            setIsLoading(true);

            const dataAddress = {
                cep,
                state,
                city,
                neighborhood,
                street,
                number,
                complement,
            };

            const updateResult = await UpdateUserAddress(
                dataUser.email,
                dataAddress,
            );

            if (updateResult) {
                await ClearUserStorage();

                await SetUserStorage({
                    ...dataUser,
                    address: dataAddress,
                });

                navigation.goBack();

                Toast.show({ type: "success", text1: "Endereço atualizado!" });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível atualizar o endereço.",
                    text2: "Verifique sua conexão e tente novamente.",
                });
            }

            setIsLoading(false);
        }
    };

    return (
        <ScrollView>
            <Container>
                <CardFormAddress>
                    <TitleCardAddress>Informações pessoais</TitleCardAddress>
                    <Input
                        label="Nome Completo"
                        autoCapitalize="sentences"
                        value={dataUser.name}
                        disable
                    />
                    <ContentPhone>
                        <InputPhoneStyleDDD
                            label="DDD"
                            autoCapitalize="sentences"
                            value={dataUser.phone.substring(1, 3)}
                            disable
                        />
                        <InputPhoneStylePhone
                            label="Telefone/Whatsapp"
                            autoCapitalize="sentences"
                            value={dataUser.phone.substring(5, 15)}
                            disable
                        />
                    </ContentPhone>
                    <Input
                        label="CPF"
                        autoCapitalize="sentences"
                        value={dataUser.cpf}
                        disable
                    />
                </CardFormAddress>
                <CardFormAddress>
                    <TitleCardAddress>Endereço</TitleCardAddress>
                    <Input
                        label="CEP"
                        autoCapitalize="sentences"
                        keyboardType="numeric"
                        value={cep}
                        onChange={handleGetAddressWithCep}
                        mask="99999-999"
                    />
                    <SelectComponentStyle
                        title="Selecione o Estado"
                        initialTitle={state}
                        options={states}
                        action={handleSelectState}
                    />
                    <SelectComponentStyle
                        title="Selecione a Cidade"
                        initialTitle={city}
                        options={cities}
                        action={setSelectedCity}
                    />
                    <Input
                        label="Bairro"
                        autoCapitalize="sentences"
                        value={neighborhood}
                        onChange={setNeighborhood}
                        disable={isLoadingCep}
                    />
                    <Input
                        label="Rua"
                        autoCapitalize="sentences"
                        value={street}
                        onChange={setStreet}
                        disable={isLoadingCep}
                    />
                    <Input
                        label="Número"
                        autoCapitalize="sentences"
                        value={number}
                        onChange={setNumber}
                        disable={isLoadingCep}
                    />
                    <Input
                        label="Complemento"
                        autoCapitalize="sentences"
                        value={complement}
                        onChange={setComplement}
                        disable={isLoadingCep}
                    />
                </CardFormAddress>
                <ButtonSaveAddress onPress={handleSaveAddress}>
                    {!isLoading ? (
                        <TextButtonSaveAddress>
                            Salvar Endereço
                        </TextButtonSaveAddress>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonSaveAddress>
            </Container>
        </ScrollView>
    );
};
