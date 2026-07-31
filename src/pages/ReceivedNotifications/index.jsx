/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { convertDate } from "../../utils/convertDate";
import { notificationExecuteActions } from "../../components/Header/actions";
import { updateNotification } from "../../controllers/Notifications/updateNotification";
import { getMyChats } from "../../controllers/Chat";
import { getMyRating } from "../../controllers/Chat/ratings";
import { useUnreadChatsCount } from "../../hooks/useUnreadChatsCount";
import { dataRoutes } from "../../routes/dataRoutes";

import {
    ActionButton,
    Container,
    ContainerCard,
    ContentActionButtons,
    ContentIcon,
    ContentInfo,
    DateReceived,
    MessageInfo,
    TitleInfo,
} from "./styles";

const VirtualCard = ({
    icon, title, message, onPress,
}) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <ContainerCard>
            <ContentIcon read={false}>
                <Feather name={icon} size={22} color="black" />
            </ContentIcon>
            <ContentInfo read>
                <TitleInfo>{title}</TitleInfo>
                <MessageInfo>{message}</MessageInfo>
            </ContentInfo>
        </ContainerCard>
    </TouchableOpacity>
);

const MessageCard = ({ data, onRead, isLoading }) => (
    <ContainerCard>
        <ContentIcon read={data.read}>
            <FontAwesome
                name={data.read ? "envelope-open-o" : "envelope-o"}
                size={24}
                color="black"
            />
        </ContentIcon>
        <ContentInfo read={data.read}>
            <TitleInfo>{data.notification.title}</TitleInfo>
            <MessageInfo>{data.notification.body}</MessageInfo>
            <DateReceived>{convertDate(data.createdAt)}</DateReceived>
        </ContentInfo>
        <ContentActionButtons>
            {!data.read && (
                <ActionButton
                    read={!data.read}
                    onPress={() =>
                        isLoading.status === false &&
                        isLoading.notificationId !== data.id
                            ? onRead(data.id, data.token)
                            : null
                    }
                    disabled={
                        isLoading.status === true &&
                        isLoading.notificationId !== data.id
                    }
                >
                    {isLoading.status === true &&
                    isLoading.notificationId === data.id ? (
                        <ActivityIndicator animating color="white" />
                    ) : (
                        <FontAwesome
                            name="envelope-open-o"
                            size={24}
                            color="white"
                        />
                    )}
                </ActionButton>
            )}
        </ContentActionButtons>
    </ContainerCard>
);

export const ReceivedNotifications = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const { originalDataNotifications, notificationCount } = useSelector(
        (state) => state.notificationExecute,
    );
    const { dataUser } = useSelector((state) => state.login);
    const unreadChatsCount = useUnreadChatsCount();

    const [isLoading, setIsLoading] = useState({
        status: false,
        notificationId: null,
    });
    const [notifications, setNotifications] = useState(
        route.params.notifications,
    );
    const [pendingRatings, setPendingRatings] = useState([]);

    useEffect(() => {
        if (notificationCount === 0) {
            Toast.show({
                type: "info",
                text1: "Não há mensagems para serem lidas!",
            });
        }
    }, []);

    useEffect(() => {
        const myId = dataUser?.email ?? dataUser?.uid;
        if (!myId) return;

        getMyChats(myId).then(async (chats) => {
            const closedChats = chats.filter((chat) => chat.status === "closed");
            const results = await Promise.all(
                closedChats.map((chat) => getMyRating(chat.id, myId)),
            );
            const withoutRating = closedChats.filter((_, index) => !results[index]);
            setPendingRatings(withoutRating);
        }).catch(() => {});
    }, [dataUser?.email, dataUser?.uid]);

    const handleMarkAsRead = async (notificationId, token) => {
        setIsLoading({ status: true, notificationId });

        const resultFilter = originalDataNotifications.filter(
            (item) => item.id === notificationId,
        )[0];

        const newDataNotification = {
            ...resultFilter,
            tokens: resultFilter.tokens.map((item) => {
                if (item.token === token) {
                    return { ...item, read: true };
                }

                return item;
            }),
        };

        const dataToken = newDataNotification.tokens.filter(
            (item) => item.token === token,
        )[0];

        const newDataNotificationReducer = notifications.map((item) => {
            if (item.id === notificationId) {
                return {
                    id: item.id,
                    notification: item.notification,
                    token: dataToken.token,
                    read: dataToken.read,
                    createdAt: item.createdAt,
                };
            }

            return item;
        });

        const resultUpdate = await updateNotification(
            notificationId,
            newDataNotification.tokens,
        );

        if (resultUpdate) {
            dispatch({
                type: notificationExecuteActions.NOTIFICATION_UPDATE_ACTION,
                notificationCount: notificationCount - 1,
                notifications: newDataNotificationReducer,
            });

            setNotifications(newDataNotificationReducer);
        }

        setIsLoading({ status: false, notificationId: null });
    };

    const openChat = (chat) => {
        navigation.navigate(dataRoutes.publicationChat, {
            publication: { id: chat.publicationId },
            sellerId: chat.sellerId,
            buyerId: chat.buyerId,
            sellerName: chat.sellerName || "Vendedor",
            buyerName: chat.buyerName || "Comprador",
            chatId: chat.id,
        });
    };

    const myId = dataUser?.email ?? dataUser?.uid;

    return (
        <Container>
            <FlatList
                data={notifications}
                ListHeaderComponent={
                    unreadChatsCount > 0 || pendingRatings.length > 0 ? (
                        <>
                            {unreadChatsCount > 0 && (
                                <VirtualCard
                                    icon="message-circle"
                                    title="Mensagens não lidas"
                                    message={`Você tem ${unreadChatsCount} mensagem${unreadChatsCount > 1 ? "ns" : ""} não lida${unreadChatsCount > 1 ? "s" : ""}`}
                                    onPress={() => navigation.navigate(dataRoutes.myChats)}
                                />
                            )}
                            {pendingRatings.map((chat) => {
                                const otherName = chat.sellerId === myId
                                    ? (chat.buyerName || "comprador")
                                    : (chat.sellerName || "produtor");
                                return (
                                    <VirtualCard
                                        key={chat.id}
                                        icon="star"
                                        title="Avaliação pendente"
                                        message={`Avalie ${otherName}`}
                                        onPress={() => openChat(chat)}
                                    />
                                );
                            })}
                        </>
                    ) : null
                }
                renderItem={({ item }) => (
                    <MessageCard
                        data={item}
                        onRead={handleMarkAsRead}
                        isLoading={isLoading}
                    />
                )}
                keyExtractor={(item) => item.id}
            />
        </Container>
    );
};
