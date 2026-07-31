import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { subscribeMyChats } from "../../controllers/Chat";
import { dataRoutes } from "../../routes/dataRoutes";
import { getMessageReadStatus } from "../../utils/chatReadStatus";
import { isUnread, sortChatsUnreadFirst } from "../../utils/chatListSort";
import { formatRatingLabel } from "../../utils/ratingLabel";
import {
    Avatar,
    AvatarText,
    ConvInfo,
    ConvItem,
    ConvLastMsg,
    ConvName,
    ConvPub,
    ConvRating,
    ConvRight,
    ConvTime,
    ConvTimeRow,
    Container,
    EmptyText,
    EmptyWrap,
    FilterTab,
    FilterTabsRow,
    FilterTabText,
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

const ChatListReadReceipt = ({ status }) => (
    <View style={{ flexDirection: "row" }}>
        <Feather
            name="check"
            size={12}
            color={status === "read" ? "#f55b1f" : "#8fa3b2"}
        />
        {status === "read" && (
            <Feather
                name="check"
                size={12}
                color="#f55b1f"
                style={{ marginLeft: -7 }}
            />
        )}
    </View>
);

export const MyChats = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);
    const [filter, setFilter] = useState("active");
    const [ratingsByUser, setRatingsByUser] = useState({});
    const ratingsFetchedRef = useRef(new Set());

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

    // Avaliação real dos outros participantes: 1 fetch por usuário único (cache em ref)
    useEffect(() => {
        if (!myId) return;
        chats.forEach((c) => {
            const otherId = c.sellerId === myId ? c.buyerId : c.sellerId;
            if (!otherId || ratingsFetchedRef.current.has(otherId)) return;
            ratingsFetchedRef.current.add(otherId);
            getDoc(doc(firestore, models.users, otherId))
                .then((snap) => {
                    if (!snap.exists()) return;
                    const data = snap.data() || {};
                    setRatingsByUser((prev) => ({
                        ...prev,
                        [otherId]: {
                            average: data.ratingAverage,
                            count: data.ratingCount,
                        },
                    }));
                })
                .catch(() => {});
        });
    }, [chats, myId]);

    const activeChats = chats.filter((c) => c.status !== "closed");
    const closedChats = chats.filter((c) => c.status === "closed");
    const unreadTotal = activeChats.filter((c) => isUnread(c, safeId)).length;

    let tabChats = activeChats;
    if (filter === "unread") tabChats = activeChats.filter((c) => isUnread(c, safeId));
    if (filter === "closed") tabChats = closedChats;

    const filteredChats = sortChatsUnreadFirst(tabChats, safeId);

    const getOtherUser = (chat) => {
        if (chat.sellerId === myId) {
            return { name: chat.buyerName || "Comprador" };
        }
        return { name: chat.sellerName || "Vendedor" };
    };

    const getOtherUserId = (chat) => (chat.sellerId === myId ? chat.buyerId : chat.sellerId);

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
                <HeaderTitle>Conversas</HeaderTitle>
                {unreadTotal > 0 ? (
                    <HeaderSub>
                        {unreadTotal} mensagem{unreadTotal > 1 ? "s" : ""} não lida{unreadTotal > 1 ? "s" : ""}
                    </HeaderSub>
                ) : (
                    <HeaderSub />
                )}
            </ScreenHeader>
            {chats.length > 0 && (
                <FilterTabsRow>
                    <FilterTab active={filter === "active"} onPress={() => setFilter("active")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "active"}>Ativas</FilterTabText>
                    </FilterTab>
                    <FilterTab active={filter === "unread"} onPress={() => setFilter("unread")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "unread"}>
                            Não lidas{unreadTotal > 0 ? ` (${unreadTotal})` : ""}
                        </FilterTabText>
                    </FilterTab>
                    <FilterTab active={filter === "closed"} onPress={() => setFilter("closed")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "closed"}>Encerradas</FilterTabText>
                    </FilterTab>
                </FilterTabsRow>
            )}
            {/* eslint-disable-next-line no-nested-ternary */}
            {chats.length === 0 ? (
                <EmptyWrap>
                    <Feather name="message-circle" size={48} color="#c8d8e8" />
                    <EmptyText>Você ainda não tem conversas</EmptyText>
                </EmptyWrap>
            ) : filteredChats.length === 0 ? (
                <EmptyWrap>
                    <Feather
                        name={filter === "closed" ? "archive" : "check-circle"}
                        size={48}
                        color="#c8d8e8"
                    />
                    <EmptyText>
                        {filter === "closed"
                            ? "Conversas encerradas aparecerão aqui"
                            : "Nenhuma conversa não lida"}
                    </EmptyText>
                </EmptyWrap>
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const other = getOtherUser(item);
                        const otherId = getOtherUserId(item);
                        const unread = isUnread(item, safeId);
                        const lastMessageIsMine = item.lastMessageSenderId === myId;
                        const initial = (other.name?.[0] ?? "?").toUpperCase();
                        return (
                            <ConvItem unread={unread} onPress={() => handleOpen(item)} activeOpacity={0.7}>
                                <Avatar>
                                    <AvatarText>{initial}</AvatarText>
                                </Avatar>
                                <ConvInfo>
                                    <ConvName numberOfLines={1}>{other.name}</ConvName>
                                    <ConvRating numberOfLines={1}>
                                        {formatRatingLabel(
                                            ratingsByUser[otherId]?.average,
                                            ratingsByUser[otherId]?.count,
                                        )}
                                    </ConvRating>
                                    <ConvPub numberOfLines={1}>
                                        {item.publicationLocation || item.publicationSummary
                                            ? [
                                                item.publicationLocation ? `📍 ${item.publicationLocation}` : null,
                                                item.publicationSummary ? `🦐 ${item.publicationSummary}` : null,
                                            ].filter(Boolean).join(" · ")
                                            : `🦐 ${item.publicationTitle || "Publicação"}`}
                                    </ConvPub>
                                    <ConvLastMsg unread={unread} numberOfLines={1}>
                                        {lastMessageIsMine ? "Você: " : ""}{item.lastMessage || ""}
                                    </ConvLastMsg>
                                </ConvInfo>
                                <ConvRight>
                                    <ConvTimeRow>
                                        {lastMessageIsMine && item.lastMessage ? (
                                            <ChatListReadReceipt
                                                status={getMessageReadStatus(
                                                    { createdAt: item.lastMessageAt },
                                                    item.lastSeenAt,
                                                    getOtherUserId(item),
                                                )}
                                            />
                                        ) : null}
                                        <ConvTime>{formatTime(item.lastMessageAt)}</ConvTime>
                                    </ConvTimeRow>
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
