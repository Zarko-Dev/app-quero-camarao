import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { getChatsByPublication } from "../../controllers/Chat";
import { dataRoutes } from "../../routes/dataRoutes";
import { isUnread } from "../../utils/chatListSort";
import {
    Avatar,
    AvatarText,
    ConvInfo,
    ConvItem,
    ConvLastMsg,
    ConvName,
    ConvRight,
    ConvTime,
    Container,
    EmptyText,
    EmptyWrap,
    HeaderSub,
    HeaderTexts,
    HeaderTitle,
    ScreenHeader,
    UnreadBadge,
    UnreadBadgeText,
} from "./styles";

const formatTime = (ts) => {
    if (!ts) return "";
    try {
        const d = ts?.toDate?.() ?? new Date(ts);
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        if (diffDays === 1) return "Ontem";
        if (diffDays < 7) return d.toLocaleDateString("pt-BR", { weekday: "short" });
        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    } catch {
        return "";
    }
};

export const PublicationChatHistory = ({ route, navigation }) => {
    const { publicationId, publicationLocation } = route.params;

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);

    useEffect(() => {
        GetUserStorage().then((user) => {
            if (user) setMyId(user.email ?? user.uid);
            else setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!myId || !publicationId) return;
        getChatsByPublication(myId, publicationId).then((data) => {
            setChats(data);
            setLoading(false);
        });
    }, [myId, publicationId]);

    const safeId = myId?.replace(/[@.]/g, "_") ?? "";

    const handleOpen = (chat) => {
        navigation.navigate(dataRoutes.publicationChat, {
            publication: { id: chat.publicationId },
            sellerId: chat.sellerId,
            buyerId: chat.buyerId,
            sellerName: chat.sellerName || "Vendedor",
            buyerName: chat.buyerName || "Comprador",
            chatId: chat.id,
        });
    };

    if (loading) {
        return (
            <Container>
                <ActivityIndicator color="#f55b1f" style={{ flex: 1 }} />
            </Container>
        );
    }

    return (
        <Container>
            <ScreenHeader>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <HeaderTexts>
                    <HeaderTitle>Conversas do anúncio</HeaderTitle>
                    {publicationLocation ? <HeaderSub>{publicationLocation}</HeaderSub> : null}
                </HeaderTexts>
            </ScreenHeader>
            {chats.length === 0 ? (
                <EmptyWrap>
                    <Feather name="message-circle" size={48} color="#c8d8e8" />
                    <EmptyText>Ninguém conversou sobre este anúncio ainda</EmptyText>
                </EmptyWrap>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const unread = isUnread(item, safeId);
                        const lastMessageIsMine = item.lastMessageSenderId === myId;
                        const buyerName = item.buyerName || "Comprador";
                        const initial = (buyerName?.[0] ?? "?").toUpperCase();
                        return (
                            <ConvItem unread={unread} onPress={() => handleOpen(item)} activeOpacity={0.7}>
                                <Avatar>
                                    <AvatarText>{initial}</AvatarText>
                                </Avatar>
                                <ConvInfo>
                                    <ConvName numberOfLines={1}>{buyerName}</ConvName>
                                    <ConvLastMsg unread={unread} numberOfLines={1}>
                                        {lastMessageIsMine ? "Você: " : ""}{item.lastMessage || ""}
                                    </ConvLastMsg>
                                </ConvInfo>
                                <ConvRight>
                                    <ConvTime>{formatTime(item.lastMessageAt)}</ConvTime>
                                    {unread && (
                                        <UnreadBadge>
                                            <UnreadBadgeText>!</UnreadBadgeText>
                                        </UnreadBadge>
                                    )}
                                </ConvRight>
                            </ConvItem>
                        );
                    }}
                />
            )}
        </Container>
    );
};
