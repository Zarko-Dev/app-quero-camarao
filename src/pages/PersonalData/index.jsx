/* eslint-disable operator-linebreak */

import { useState } from "react";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { ActivityIndicator } from "react-native-paper";

import { LoginActions } from "../Login/actions";
import { updateUser } from "../../controllers/User/update";
import { SetUserStorage, GetUserStorage } from "../../services/Storage/UserStorage";

import {
    clientValidationForm,
    productroValidationForm,
} from "./validationForm";

import {
    ButtonSaveData,
    Container,
    ContentActionButton,
    ContentForm,
    InputStyle,
    TextButton,
} from "./styles";

export const PersonalData = ({ route, navigation }) => {
    const dispatch = useDispatch();

    const { dataUser } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(dataUser.name || "");
    const [email] = useState(dataUser.email || "");
    const [phone, setPhone] = useState(dataUser.phone || "");
    const [dateBirth, setDateBirth] = useState(dataUser.dateBirth || "");
    const [cpf] = useState(dataUser.cpf || "");
    const [ponds, setPonds] = useState(dataUser.ponds || "");
    const [acre, setAcre] = useState(dataUser.acre || "");

    const updateActionUser = async () => {
        const result = await updateUser({
            name,
            email,
            phone,
            dateBirth,
            ponds,
            acre,
        });

        if (result) {
            const stored = await GetUserStorage();
            if (stored) {
                await SetUserStorage({ ...stored, name, phone, dateBirth, ponds, acre });
            }

            Toast.show({
                type: "success",
                text1: "Informações atualizadas!",
            });

            dispatch({ type: LoginActions.REFRESH_DATA_ACTION });

            navigation.goBack();
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar suas informações!",
                text2: "Tente novamente mais tarde.",
            });
        }
    };

    const handleUpdateUser = async () => {
        setIsLoading(true);

        switch (dataUser.userType) {
            case "productor":
                if (
                    productroValidationForm({
                        name,
                        phone,
                        dateBirth,
                        ponds,
                        acre,
                    }) &&
                    !isLoading
                ) {
                    await updateActionUser();
                }

                break;

            case "client":
                if (
                    clientValidationForm({
                        name,
                        phone,
                        dateBirth,
                    }) &&
                    !isLoading
                ) {
                    await updateActionUser();
                }

                break;

            default:
                Toast.show({
                    type: "error",
                    text1: "Tipo de usuário inválido para atualizar!",
                });

                break;
        }

        setIsLoading(false);
    };

    return (
        <Container>
            <ContentForm>
                <InputStyle
                    label="Nome Completo"
                    icon="user"
                    autoCapitalize="sentences"
                    value={name}
                    onChange={setName}
                />
                <InputStyle
                    label="Email"
                    icon="at-sign"
                    keyboardType="email-address"
                    disable
                    value={email}
                />
                <InputStyle
                    label="Whatsapp/Telefone"
                    icon="phone"
                    keyboardType="numeric"
                    mask="(99) 99999-9999"
                    value={phone}
                    onChange={setPhone}
                />
                <InputStyle
                    label="Data de Nascimento"
                    icon="calendar"
                    keyboardType="numeric"
                    mask="99/99/9999"
                    value={dateBirth}
                    onChange={setDateBirth}
                />
                <InputStyle
                    label="CPF"
                    icon="user"
                    keyboardType="numeric"
                    mask="999.999.999-99"
                    disable
                    value={cpf}
                />
                {dataUser.userType === "productor" && (
                    <>
                        <InputStyle
                            label="Quantidade de Viveiros"
                            icon="anchor"
                            keyboardType="numeric"
                            value={ponds}
                            onChange={setPonds}
                        />
                        <InputStyle
                            label="Quantos hectares de lamina d'água"
                            icon="maximize-2"
                            keyboardType="numeric"
                            value={acre}
                            onChange={setAcre}
                        />
                    </>
                )}
            </ContentForm>
            <ContentActionButton>
                <ButtonSaveData onPress={handleUpdateUser}>
                    {!isLoading ? (
                        <TextButton>Atualizar</TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonSaveData>
            </ContentActionButton>
        </Container>
    );
};
