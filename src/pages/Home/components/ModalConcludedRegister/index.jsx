import { useState } from "react";
import { Modal, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { productroValidationForm } from "./validationForm";

import { Input } from "../../../../components/Input";

import {
    ButtonConcludedRegister,
    ButtonHeader,
    CancelText,
    Container,
    ContentForm,
    Divider,
    HeaderContent,
    HeaderTitle,
    TextAlertMessage,
    TextButton,
} from "./styles";
import { BoxShadowIos } from "../../../../styles/IosShadow";
import { UpdateUserToProductor } from "../../../../controllers/User/updateToProductor";
import {
    GetUserStorage,
    SetUserStorage,
} from "../../../../services/Storage/UserStorage";

export const ModalConcludedRegister = ({ isVisible = false, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState("");

    const [cpf, setCpf] = useState("");
    const [ponds, setPonds] = useState("");
    const [acre, setAcre] = useState("");

    const handleConcludedRegisterUser = async () => {
        setShowMessage("");
        setIsLoading(true);

        const resultVallidation = productroValidationForm({
            cpf,
            ponds,
            acre,
        });

        if (resultVallidation.error) {
            setShowMessage(resultVallidation.message);
        } else {
            const storageDataUser = await GetUserStorage();
            const resultData = await UpdateUserToProductor(
                storageDataUser.email,
                {
                    cpf,
                    ponds,
                    acre,
                    userType: "productor",
                },
            );

            if (resultData.error) {
                setShowMessage(resultData.message);
            } else {
                await SetUserStorage(resultData.dataUser);

                onClose();

                Toast.show({
                    type: "success",
                    text1: "Cadastro atualizado!",
                    text2: "Agora você é um produtor(a)!",
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
                        <HeaderTitle>Complete seu Cadastro</HeaderTitle>
                        <ButtonHeader onPress={onClose}>
                            <CancelText>Cancelar</CancelText>
                        </ButtonHeader>
                    </HeaderContent>
                    <Divider />
                    <ContentForm>
                        <Input
                            label="CPF"
                            icon="user"
                            keyboardType="numeric"
                            onChange={setCpf}
                            value={cpf}
                            mask="999.999.999-99"
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
                        <TextAlertMessage>{showMessage}</TextAlertMessage>
                        <ButtonConcludedRegister
                            onPress={handleConcludedRegisterUser}
                            style={BoxShadowIos}
                        >
                            {!isLoading ? (
                                <TextButton>Torna-se Produtor(a)</TextButton>
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
