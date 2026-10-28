import { Modal, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import styled from "styled-components/native";

const Backdrop = styled.Pressable`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.4);
    justify-content: center;
    align-items: center;
`;

const Sheet = styled.Pressable`
    background-color: #fff;
    border-radius: 12px;
    padding: 10px 0;
    width: 80%;
    max-width: 300px;
    elevation: 5;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 4px;
`;

const ActionRow = styled.TouchableOpacity`
    height: 48px;
    flex-direction: row;
    align-items: center;
    padding: 0 20px;
    gap: 14px;
`;

const ActionLabel = styled(Text)`
    font-size: 16px;
    color: ${({ destructive }) => (destructive ? "#e53935" : "#36536e")};
`;

export const ChatActionsSheet = ({ visible, onClose, actions }) => (
    <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
    >
        <Backdrop onPress={onClose}>
            <Sheet>
                {actions.map((action, index) => (
                    <ActionRow
                        key={action.key || index}
                        onPress={() => {
                            onClose();
                            setTimeout(() => {
                                action.onPress();
                            }, 100);
                        }}
                        activeOpacity={0.7}
                    >
                        <Feather
                            name={action.icon}
                            size={22}
                            color={action.destructive ? "#e53935" : "#36536e"}
                        />
                        <ActionLabel destructive={action.destructive}>
                            {action.label}
                        </ActionLabel>
                    </ActionRow>
                ))}
            </Sheet>
        </Backdrop>
    </Modal>
);
