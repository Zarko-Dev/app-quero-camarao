import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { subscribeMyChats } from "../../controllers/Chat";
import { dataRoutes } from "../../routes/dataRoutes";
import {
    Avatar,
    AvatarText,
    ConvInfo,
    ConvItem,
    ConvLastMsg,
    ConvName,
    ConvPub,
    ConvRight,
    ConvTime,
    Container,
    EmptyText,
    EmptyWrap,
    ScreenHeader,
    HeaderSub,
    HeaderTitle,
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

const isUnread = (chat, safeId) => {
    const lastSeen = chat.lastSeenAt?.[safeId];
    const lastMsg = chat.lastMessageAt;
    if (!lastMsg || !chat.lastMessage) return false;
    if (!lastSeen) return true;
    const seenMs = lastSeen?.toMillis?.() ?? 0;
    const msgMs = lastMsg?.toMillis?.() ?? 0;
    return msgMs > seenMs;
};

export const MyChats = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);

    const safeId = myId?.replace(/[@.]/g, "_") ?? "";

    useEffect(() => {
        GetUserStorage().then((user) => {
            if (user) setMyId(user.email ?? user.uid);
            else setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!myId) return;
        const unsub = subscribeMyChats(myId, (data) => {
            setChats(data);
            setLoading(false);
        });
        return unsub;
    }, [myId]);

    const unreadTotal = chats.filter((c) => isUnread(c, safeId)).length;

    const getOtherUser = (chat) => {
        if (chat.sellerId === myId) {
            return { name: chat.buyerName || "Comprador" };
        }
        return { name: chat.sellerName || "Vendedor" };
    };

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
                <HeaderTitle>Minhas Conversas</HeaderTitle>
                {unreadTotal > 0 ? (
                    <HeaderSub>
                        {unreadTotal} mensagem{unreadTotal > 1 ? "s" : ""} não lida{unreadTotal > 1 ? "s" : ""}
                    </HeaderSub>
                ) : (
                    <HeaderSub />
                )}
            </ScreenHeader>
            {chats.length === 0 ? (
                <EmptyWrap>
                    <Feather name="message-circle" size={48} color="#c8d8e8" />
                    <EmptyText>Você ainda não tem conversas</EmptyText>
                </EmptyWrap>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const other = getOtherUser(item);
                        const unread = isUnread(item, safeId);
                        const initial = (other.name?.[0] ?? "?").toUpperCase();
                        return (
                            <ConvItem unread={unread} onPress={() => handleOpen(item)} activeOpacity={0.7}>
                                <Avatar>
                                    <AvatarText>{initial}</AvatarText>
                                </Avatar>
                                <ConvInfo>
                                    <ConvName numberOfLines={1}>{other.name}</ConvName>
                                    <ConvPub numberOfLines={1}>🦐 {item.publicationTitle || "Publicação"}</ConvPub>
                                    <ConvLastMsg unread={unread} numberOfLines={1}>
                                        {item.sellerId === myId && !unread ? "Você: " : ""}{item.lastMessage || ""}
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
