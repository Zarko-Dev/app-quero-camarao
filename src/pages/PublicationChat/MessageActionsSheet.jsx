import { Modal, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import styled from "styled-components/native";

const Backdrop = styled.Pressable`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.4);
    justify-content: flex-end;
`;

const Sheet = styled.Pressable`
    background-color: #fff;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding: 12px 0 28px;
`;

const ActionRow = styled.TouchableOpacity`
    height: 48px;
    flex-direction: row;
    align-items: center;
    padding: 0 20px;
    gap: 14px;
`;

const ActionLabel = styled(Text)`
    font-size: 15px;
    color: ${({ destructive }) => (destructive ? "#e53935" : "#36536e")};
`;

export const MessageActionsSheet = ({ visible, onClose, actions }) => (
    <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
    >
        <Backdrop onPress={onClose}>
            <Sheet>
                {actions.map((action) => (
                    <ActionRow
                        key={action.key}
                        onPress={action.onPress}
                        activeOpacity={0.7}
                    >
                        <Feather
                            name={action.icon}
                            size={20}
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
