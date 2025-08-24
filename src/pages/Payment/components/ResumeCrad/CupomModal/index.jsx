import { useState } from "react";
import { Modal, Platform, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Feather } from "@expo/vector-icons";

import { useKeyboard } from "../../../../../utils/hooks/useKeyboardHeight";

import { Input } from "../../../../../components/Input";

import {
    ButtonBack,
    ButtonUseCupom,
    Container,
    ContainerModal,
    ContentModal,
    ContentTitle,
    Subtitle,
    TextButton,
    Title,
} from "./styles";

export const CupomModal = ({ modalVisible, onClose, action }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [cupomCode, setCupomCode] = useState("");
    const keyboardHeight = useKeyboard();

    const handleUseCode = async () => {
        setIsLoading(true);

        await action(cupomCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());

        setIsLoading(false);
        onClose();
        setCupomCode("");
    };

    return (
        <Container>
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={onClose}
            >
                <ContainerModal>
                    <ContentModal
                        opneKeyboard={
                            Platform.OS === "android"
                                ? false
                                : keyboardHeight > 0
                        }
                    >
                        <ContentTitle>
                            <ButtonBack onPress={onClose}>
                                <Feather
                                    name="arrow-left"
                                    size={24}
                                    color="black"
                                />
                            </ButtonBack>
                            <Title>CÓDIGO PROMOCIONAL</Title>
                            <View />
                        </ContentTitle>
                        <Subtitle>
                            Um código promocional é a combinação de letras
                            maiúsculas e números sem espaço
                        </Subtitle>
                        <Input
                            label="Insira seu código aqui"
                            autoCapitalize="characters"
                            value={cupomCode}
                            onChange={setCupomCode}
                        />
                        <ButtonUseCupom onPress={handleUseCode}>
                            {!isLoading ? (
                                <TextButton>Utilizar cupom</TextButton>
                            ) : (
                                <ActivityIndicator animating color="white" />
                            )}
                        </ButtonUseCupom>
                    </ContentModal>
                </ContainerModal>
            </Modal>
        </Container>
    );
};
