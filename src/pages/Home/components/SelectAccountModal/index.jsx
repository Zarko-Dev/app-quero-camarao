import { Modal, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { dataRoutes } from "../../../../routes/dataRoutes";

import {
    ButtonAction,
    ButtonBack,
    ContainerModal,
    ContentActionButtons,
    ContentModal,
    ContentTitle,
    TextButton,
    Title,
} from "./styles";

export const SelectAccountModal = ({ modalVisible, onClose, action }) => {
    const navigation = useNavigation();

    const handleRedirectRegister = () => {
        onClose();
        action();
    };

    const handleRedirectLogin = () => {
        onClose();
        navigation.navigate(dataRoutes.login);
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={onClose}
        >
            <ContainerModal>
                <ContentModal>
                    <ContentTitle>
                        <ButtonBack onPress={onClose}>
                            <Feather
                                name="arrow-left"
                                size={24}
                                color="black"
                            />
                        </ButtonBack>
                        <Title>Boas vindas à Quero Camarão!</Title>
                        <View />
                    </ContentTitle>

                    <ContentActionButtons>
                        <ButtonAction onPress={handleRedirectRegister}>
                            <TextButton>
                                Quero fazer parte da Quero Camarão
                            </TextButton>
                        </ButtonAction>

                        <ButtonAction onPress={handleRedirectLogin} black>
                            <TextButton>Sou clinte Quero Camarão</TextButton>
                        </ButtonAction>
                    </ContentActionButtons>
                </ContentModal>
            </ContainerModal>
        </Modal>
    );
};
