/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { convertDate } from "../../utils/convertDate";
import { notificationExecuteActions } from "../../components/Header/actions";
import { updateNotification } from "../../controllers/Notifications/updateNotification";

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

export const ReceivedNotifications = ({ route }) => {
    const dispatch = useDispatch();
    const { originalDataNotifications, notificationCount } = useSelector(
        (state) => state.notificationExecute,
    );

    const [isLoading, setIsLoading] = useState({
        status: false,
        notificationId: null,
    });
    const [notifications, setNotifications] = useState(
        route.params.notifications,
    );

    useEffect(() => {
        if (notificationCount === 0) {
            Toast.show({
                type: "info",
                text1: "Não há mensagems para serem lidas!",
            });
        }
    }, []);

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
            await Notifications.setBadgeCountAsync(notificationCount - 1);

            dispatch({
                type: notificationExecuteActions.NOTIFICATION_UPDATE_ACTION,
                notificationCount: notificationCount - 1,
                notifications: newDataNotificationReducer,
            });

            setNotifications(newDataNotificationReducer);
        }

        setIsLoading({ status: false, notificationId: null });
    };

    return (
        <Container>
            <FlatList
                data={notifications}
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
