import { FlatList, Modal, Text } from "react-native";
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
    padding: 16px 0 28px;
    max-height: 70%;
`;

const HeaderRow = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 12px;
`;

const HeaderTitle = styled(Text)`
    font-size: 16px;
    font-weight: 700;
    color: #36536e;
`;

const CloseButton = styled.TouchableOpacity`
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
`;

const ChatRow = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 10px 20px;
    gap: 12px;
`;

const ChatAvatar = styled.View`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #f55b1f;
    align-items: center;
    justify-content: center;
`;

const ChatAvatarText = styled(Text)`
    color: #fff;
    font-weight: 800;
    font-size: 15px;
`;

const ChatName = styled(Text)`
    flex: 1;
    font-size: 14px;
    color: #36536e;
`;

const EmptyText = styled(Text)`
    text-align: center;
    color: #8fa3b2;
    font-size: 13px;
    padding: 24px 20px;
`;

export const ForwardModal = ({
    visible,
    onClose,
    chats,
    onSelect,
    currentChatId,
}) => {
    const otherChats = (chats || []).filter(
        (chat) => chat.id !== currentChatId,
    );

    const renderChat = ({ item }) => (
        <ChatRow onPress={() => onSelect(item)} activeOpacity={0.7}>
            <ChatAvatar>
                <ChatAvatarText>
                    {String(item.displayName || "?").charAt(0).toUpperCase()}
                </ChatAvatarText>
            </ChatAvatar>
            <ChatName numberOfLines={1}>{item.displayName}</ChatName>
        </ChatRow>
    );

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <Backdrop onPress={onClose}>
                <Sheet>
                    <HeaderRow>
                        <HeaderTitle>Encaminhar para...</HeaderTitle>
                        <CloseButton onPress={onClose}>
                            <Feather name="x" size={22} color="#36536e" />
                        </CloseButton>
                    </HeaderRow>
                    {otherChats.length === 0 ? (
                        <EmptyText>Nenhuma outra conversa</EmptyText>
                    ) : (
                        <FlatList
                            data={otherChats}
                            keyExtractor={(item) => item.id}
                            renderItem={renderChat}
                        />
                    )}
                </Sheet>
            </Backdrop>
        </Modal>
    );
};
