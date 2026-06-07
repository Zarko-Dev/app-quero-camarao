import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { sendChatMessage, subscribeToChat } from "../../controllers/Chat";
import {
    Bubble,
    BubbleText,
    BubbleTime,
    BubbleWrap,
    ChatInput,
    Container,
    Header,
    HeaderTitle,
    InputRow,
    SendButton,
} from "./styles";

export const PublicationChat = ({ route, navigation }) => {
    const { publication, sellerId, sellerName } = route.params;
    const { dataUser } = useSelector((state) => state.login);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const listRef = useRef(null);

    const myId = dataUser?.email ?? dataUser?.uid;
    const buyerId = myId;

    useEffect(() => {
        const unsub = subscribeToChat({
            publicationId: publication.id,
            buyerId,
            onMessages: (msgs) => {
                setMessages([...msgs].reverse());
            },
        });
        return unsub;
    }, [publication.id, buyerId]);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setText("");
        await sendChatMessage({
            publicationId: publication.id,
            sellerId,
            buyerId,
            senderId: myId,
            text: trimmed,
        });
    };

    const formatTime = (createdAt) => {
        try {
            const d = createdAt?.toDate?.() ?? new Date(createdAt);
            return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    };

    return (
        <Container>
            <Header>
                <Feather
                    name="arrow-left"
                    size={22}
                    color="#36536e"
                    onPress={() => navigation.goBack()}
                />
                <HeaderTitle numberOfLines={1}>{sellerName || "Conversa"}</HeaderTitle>
            </Header>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={80}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(_, i) => String(i)}
                    inverted
                    contentContainerStyle={{ padding: 12 }}
                    renderItem={({ item }) => {
                        const isMine = item.senderId === myId;
                        return (
                            <BubbleWrap isMine={isMine}>
                                <Bubble isMine={isMine}>
                                    <BubbleText isMine={isMine}>{item.text}</BubbleText>
                                    <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                                </Bubble>
                            </BubbleWrap>
                        );
                    }}
                />
                <InputRow>
                    <ChatInput
                        value={text}
                        onChangeText={setText}
                        placeholder="Mensagem..."
                        placeholderTextColor="#8fa3b2"
                        multiline
                    />
                    <SendButton onPress={handleSend} activeOpacity={0.8}>
                        <Feather name="send" size={18} color="#fff" />
                    </SendButton>
                </InputRow>
            </KeyboardAvoidingView>
        </Container>
    );
};
