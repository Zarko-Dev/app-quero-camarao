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

export const SelectTypeFileModal = ({ modalVisible, onClose, action }) => {
    const handleExecuteAction = (type) => {
        onClose();
        action(type);
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
                        <Title>Selecione o tipo de arquivo desejado!</Title>
                        <View />
                    </ContentTitle>

                    <ContentActionButtons>
                        <ButtonAction
                            onPress={() => handleExecuteAction("img")}
                        >
                            <TextButton>Imagem</TextButton>
                        </ButtonAction>

                        <ButtonAction
                            onPress={() => handleExecuteAction("gif")}
                            black
                        >
                            <TextButton>GIF</TextButton>
                        </ButtonAction>
                    </ContentActionButtons>
                </ContentModal>
            </ContainerModal>
        </Modal>
    );
};
