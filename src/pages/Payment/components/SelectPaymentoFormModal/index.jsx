import { Modal, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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

export const SelectPaymentFormModal = ({
    modalVisible,
    onClose,
    pixAction,
    otherPaymentAction,
}) => {
    const handleActionPix = () => {
        onClose();
        pixAction();
    };

    const handleOtherPaymentAction = () => {
        onClose();
        otherPaymentAction();
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
                        <Title>Selecione a forma de pagamento!</Title>
                        <View />
                    </ContentTitle>

                    <ContentActionButtons>
                        <ButtonAction onPress={handleActionPix}>
                            <TextButton>PIX</TextButton>
                        </ButtonAction>

                        <ButtonAction onPress={handleOtherPaymentAction} black>
                            <TextButton>Outros</TextButton>
                        </ButtonAction>
                    </ContentActionButtons>
                </ContentModal>
            </ContainerModal>
        </Modal>
    );
};
