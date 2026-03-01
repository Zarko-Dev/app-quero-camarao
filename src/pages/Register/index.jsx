/* eslint-disable operator-linebreak */
import { useEffect, useState } from "react";
import { ActivityIndicator, Checkbox } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { TabsProvider, Tabs, TabScreen } from "react-native-paper-tabs";

import { dataRoutes } from "../../routes/dataRoutes";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { LoginActions } from "../Login/actions";

import { Input } from "../../components/Input";
import { RegisterUser } from "../../controllers/User/register";
import {
    clientValidationForm,
    productroValidationForm,
} from "./validationForm";
import { getInvitationByCode } from "../../controllers/Invitations/find";
import { createUserWallet } from "../../controllers/Wallet/create";
import { InvitationActions } from "../ValidateInvitation/actions";


import {
    ButtonRegister,
    ButtonUseTermsText,
    Container,
    Content,
    ContentForm,
    ContentUseTerms,
    ContentZonaRural,
    SelectComponentStyle,
    TextButton,
    TextButtonUseTerms,
    ZonaRuralText,
    Title,
    theme,
    UseTermsText,
} from "./styles";
import { getCity, getState } from "../../utils/getLocation";

export const Register = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { invitationCode } = useSelector((state) => state.invitation);

    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dateBirth, setDateBirth] = useState("");
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [ponds, setPonds] = useState("");
    const [acre, setAcre] = useState("");
    const [states, setStates] = useState([]);
    const [state, setState] = useState("");
    const [cities, setCities] = useState([]);
    const [city, setCity] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [clearCities, setClearCities] = useState(false);
    const [checked, setChecked] = useState(false);
    const [ruralArea, setRuralArea] = useState(false);

     // --- NOVOS CAMPOS DE ENDEREÇO ---
    const [zipCode, setZipCode] = useState("");       
    const [street, setStreet] = useState("");         
    const [number, setNumber] = useState("");  
    const [complement, setComplement] = useState("");        

    const buscarEndereco = async (cepDigitado) => {
        try {
            const cepLimpo = cepDigitado.replace(/\D/g, "");
            if (cepLimpo.length === 8) {
                const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const data = await response.json(); // <- CORREÇÃO AQUI
                if (!data.erro) {
                    setState(data.uf)
                    setCity(data.localidade)
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setComplement(data.complemento);
                }
            }
        } catch (error) {
            console.log("Erro ao buscar CEP", error);
        }
    };

    useEffect(() => {
        buscarEndereco(zipCode.replace(/\D/g, ""));
    }, [zipCode]);

    // --- FIM CAMPOS DE ENDEREÇO ---

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

    const handleRedirectUseTerms = () => {
        navigation.navigate(dataRoutes.useTerms);
    };

    

    const clearState = () => {
        setName("");
        setEmail("");
        setPhone("");
        setDateBirth("");
        setComplement("");
        setStreet("");
        setNumber("");
        setZipCode("");
        setCpf("");
        setPassword("");
        setPonds("");
        setAcre("");
        setNeighborhood("");
        setChecked(false);
        setRuralArea(false);
    };

    const registerActionUser = async (userType) => {
        let resultInvitation = { error: true };

        if (invitationCode) {
            resultInvitation = await getInvitationByCode(invitationCode);
        }

        const result = await RegisterUser({
            userType,
            name,
            email: email.toLowerCase(),
            phone,
            dateBirth,
            password,
            cpf,
            ponds,
            acre,
            state,
            city,
            neighborhood,
            number,
            zipCode,
            street,
            complement,
            ruralArea,
            checked,
            guestData: {
                wasInvited: invitationCode !== undefined,
                indicatorId: resultInvitation.error
                    ? ""
                    : resultInvitation.data.id,
                fristIndication: false,
            },
        });

        if (result) {
            const dataUserStore = await GetUserStorage();

            await createUserWallet(dataUserStore.email, {
                currentValue: 0,
                acumulatedValue: 0,
            });

            dispatch({ type: InvitationActions.DELETE_INVITATION_CODE_ACTION });

            Toast.show({
                type: "success",
                text1: `Boas Vindas, ${dataUserStore.name}`,
            });

            dispatch({ type: LoginActions.ISAUTHENTICATED_ACTION });

            clearState();

            navigation.navigate(dataRoutes.navigation);
        }
    };

    const handleRegisterUser = async (userType) => {
        setIsLoading(true);

        switch (userType) {
            case "productor":
                if (
                    productroValidationForm({
                        name,
                        email,
                        phone,
                        dateBirth,
                        cpf,
                        state,
                        city,
                        neighborhood,
                        number,
                        zipCode,
                        street,
                        complement,
                        ruralArea,
                        password,
                        ponds,
                        acre,
                        checked,
                    }) &&
                    !isLoading
                ) {
                    await registerActionUser(userType);
                }

                break;

            case "client":
                if (
                    clientValidationForm({
                        name,
                        email,
                        phone,
                        dateBirth,
                        cpf,
                        state,
                        city,
                        neighborhood,
                        number,
                        zipCode,
                        street,
                        complement,
                        ruralArea,
                        password,
                        checked,
                    }) &&
                    !isLoading
                ) {
                    await registerActionUser(userType);
                }

                break;

            default:
                Toast.show({
                    type: "error",
                    text1: "Tipo de usuário inválido para registro!",
                });

                break;
        }

        setIsLoading(false);
    };

    return (
        <TabsProvider
            defaultIndex={route?.params?.tabIndex ? route?.params?.tabIndex : 0}
        >
            <Tabs
                tabLabelStyle={{
                    fontSize: 16,
                }}
            >
                <TabScreen label="Produtor">
                    <Container>
                        <Content>
                            <Title>
                                Cadastre-se e aproveite todas as nossas
                                oportunidades.
                            </Title>
                            <ContentForm>
                                <Input
                                    label="Nome Completo"
                                    icon="user"
                                    onChange={setName}
                                    value={name}
                                    autoCapitalize="sentences"
                                />
                                <Input
                                    label="Email"
                                    icon="at-sign"
                                    keyboardType="email-address"
                                    onChange={setEmail}
                                    value={email}
                                />
                                <Input
                                    label="Whatsapp/Telefone"
                                    icon="phone"
                                    keyboardType="numeric"
                                    onChange={setPhone}
                                    value={phone}
                                    mask="(99) 99999-9999"
                                />
                                <Input
                                    label="CEP"
                                    icon="map-pin"
                                    keyboardType="numeric"
                                    onChange={setZipCode}
                                    value={zipCode}
                                    mask="99999-999"
                                />

                               <Input
                                    label="Bairro"
                                    icon="home"
                                    onChange={setNeighborhood}
                                    value={neighborhood}
                                   
                                />

                                <Input
                                    label="Rua"
                                    icon="home"
                                    onChange={setStreet}
                                    value={street}
                                    disable={true}
                                />
                                <Input
                                    label="Número"
                                    icon="hash"
                                    keyboardType="numeric"
                                    onChange={setNumber}
                                    value={number}
                                />
                                <Input
                                    label="Complemento"
                                    icon="edit"
                                    onChange={setComplement}
                                    value={complement}
                                />

                             <ContentZonaRural checked={ruralArea}>
                                <Checkbox.Android
                                    status={ruralArea ? "checked" : "unchecked"}
                                    onPress={() => setRuralArea(!ruralArea)}
                                    color={theme.colors.primary}
                                />
                                <ZonaRuralText>Zona Rural?</ZonaRuralText>
                            </ContentZonaRural>

                                <Input
                                    label="Data de Nascimento"
                                    icon="calendar"
                                    keyboardType="numeric"
                                    onChange={setDateBirth}
                                    value={dateBirth}
                                    mask="99/99/9999"
                                />
                                <Input
                                    label="CPF"
                                    icon="user"
                                    keyboardType="numeric"
                                    onChange={setCpf}
                                    value={cpf}
                                    mask="999.999.999-99"
                                />
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
                                <Input
                                    label="Senha"
                                    icon="lock"
                                    security
                                    onChange={setPassword}
                                    value={password}
                                />

                                <Input
                                    label="Quantidade de Viveiros"
                                    icon="anchor"
                                    keyboardType="numeric"
                                    onChange={setPonds}
                                    value={ponds}
                                />
                                <Input
                                    label="Quantos hectares de lamina d'água"
                                    icon="maximize-2"
                                    keyboardType="numeric"
                                    onChange={setAcre}
                                    value={acre}
                                />
                            </ContentForm>
                            <ContentUseTerms>
                                <Checkbox.Android
                                    status={checked ? "checked" : "unchecked"}
                                    onPress={() => {
                                        setChecked(!checked);
                                    }}
                                />
                                <UseTermsText>Li e aceito os </UseTermsText>
                                <ButtonUseTermsText>
                                    <TextButtonUseTerms
                                        onPress={handleRedirectUseTerms}
                                    >
                                        termos de uso e condições
                                    </TextButtonUseTerms>
                                </ButtonUseTermsText>
                            </ContentUseTerms>

                            <ButtonRegister
                                onPress={() => handleRegisterUser("productor")}
                            >
                                {!isLoading ? (
                                    <TextButton>Cadastrar</TextButton>
                                ) : (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                )}
                            </ButtonRegister>
                        </Content>
                    </Container>
                </TabScreen>
                <TabScreen label="Cliente">
                    <Container>
                        <Content>
                            <Title>
                                Cadastre-se e aproveite todas as nossas
                                oportunidades, ou seja você também um
                                fornecedor.
                            </Title>
                            <ContentForm>
                                <Input
                                    label="Nome Completo"
                                    icon="user"
                                    onChange={setName}
                                    value={name}
                                    autoCapitalize="sentences"
                                />
                                <Input
                                    label="Email"
                                    icon="at-sign"
                                    keyboardType="email-address"
                                    onChange={setEmail}
                                    value={email}
                                />
                                <Input
                                    label="Whatsapp/Telefone"
                                    icon="phone"
                                    keyboardType="numeric"
                                    onChange={setPhone}
                                    value={phone}
                                    mask="(99) 99999-9999"
                                />                              
                                   <Input
                                    label="CEP"
                                    icon="map-pin"
                                    keyboardType="numeric"
                                    onChange={setZipCode}
                                    value={zipCode}
                                    mask="99999-999"
                                />


                                 <Input
                                    label="Bairro"
                                    icon="home"
                                    onChange={setNeighborhood}
                                    value={neighborhood}
                                   
                                />

                                <Input
                                    label="Rua"
                                    icon="home"
                                    onChange={setStreet}
                                    value={street}
                                    disable={true}
                                />
                                <Input
                                    label="Número"
                                    icon="hash"
                                    keyboardType="numeric"
                                    onChange={setNumber}
                                    value={number}
                                />
                                <Input
                                    label="Complemento"
                                    icon="edit"
                                    onChange={setComplement}
                                    value={complement}
                                />

                               <ContentZonaRural checked={ruralArea}>
                                    <Checkbox.Android
                                        status={ruralArea ? "checked" : "unchecked"}
                                        onPress={() => setRuralArea(!ruralArea)}
                                        color={theme.colors.primary}
                                    />
                                    <ZonaRuralText>Zona Rural?</ZonaRuralText>
                                </ContentZonaRural>

                                <Input
                                    label="Data de Nascimento"
                                    icon="calendar"
                                    keyboardType="numeric"
                                    onChange={setDateBirth}
                                    value={dateBirth}
                                    mask="99/99/9999"
                                />
                                <Input
                                    label="CPF"
                                    icon="user"
                                    keyboardType="numeric"
                                    onChange={setCpf}
                                    value={cpf}
                                    mask="999.999.999-99"
                                />
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
                                <Input
                                    label="Senha"
                                    icon="lock"
                                    security
                                    onChange={setPassword}
                                    value={password}
                                />
                            </ContentForm>
                            <ContentUseTerms>
                                <Checkbox.Android
                                    status={checked ? "checked" : "unchecked"}
                                    onPress={() => {
                                        setChecked(!checked);
                                    }}
                                />
                                <UseTermsText>Li e aceito os </UseTermsText>
                                <ButtonUseTermsText>
                                    <TextButtonUseTerms
                                        onPress={handleRedirectUseTerms}
                                    >
                                        termos de uso e condições
                                    </TextButtonUseTerms>
                                </ButtonUseTermsText>
                            </ContentUseTerms>

                            <ButtonRegister
                                onPress={() => handleRegisterUser("client")}
                            >
                                {!isLoading ? (
                                    <TextButton>Cadastrar</TextButton>
                                ) : (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                )}
                            </ButtonRegister>
                        </Content>
                    </Container>
                </TabScreen>
            </Tabs>
        </TabsProvider>
    );
};
