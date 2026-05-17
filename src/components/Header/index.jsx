/* eslint-disable no-nested-ternary */
/* eslint-disable operator-linebreak */

import { Feather } from "@expo/vector-icons";
// import { useEffect, useState } from "react";
// import Toast from "react-native-toast-message";
// import { ActivityIndicator } from "react-native-paper";
// import { useDispatch, useSelector } from "react-redux";
// import * as Notifications from "expo-notifications";

// import { GetUserStorage } from "../../services/Storage/UserStorage";
// import { getAllNotifications } from "../../controllers/Notifications/getAllNotifications";
// import { notificationExecuteActions } from "./actions";
// import { dataRoutes } from "../../routes/dataRoutes";

import logo from "../../assets/images/logo.png";

import {
    Container,
    LogoImage,
    MenuButton,
    RightSpacer,
    // NotificationBadge,
    // NotificationsButton,
} from "./styles";

export const Header = (props) => {
    // const dispatch = useDispatch();

    // const [isLoading, setIsLoading] = useState(true);
    // const [showNotificationIcons, setShowNotificationIcon] = useState(true);

    // const {
    //     notificationExecuted,
    //     notificationsError,
    //     notifications,
    //     notificationCount,
    // } = useSelector((state) => state.notificationExecute);

    const handleOpenDrawer = () => {
        const { navigation } = props;
        navigation.openDrawer();
    };

    // useEffect(() => {
    //     const getNotifications = async () => {
    //         const dataUser = await GetUserStorage();

    //         if (dataUser) {
    //             const dataNotifications = await getAllNotifications(
    //                 dataUser.notification.token,
    //             );

    //             if (!dataNotifications.error) {
    //                 const dataNotificationCount =
    //                     dataNotifications.data.dataNotifications.filter(
    //                         (item) => !item.read,
    //                     ).length;

    //                 dispatch({
    //                     type: notificationExecuteActions.NOTIFICATION_EXECUTE_ACTION,
    //                     notificationsError: false,
    //                     notifications: dataNotifications.data.dataNotifications,
    //                     notificationCount: dataNotificationCount,
    //                     originalDataNotifications:
    //                         dataNotifications.data.originalData,
    //                 });

    //                 if (dataNotificationCount > 0) {
    //                     await Notifications.setBadgeCountAsync(
    //                         dataNotificationCount,
    //                     );
    //                 } else {
    //                     await Notifications.setBadgeCountAsync(0);
    //                 }
    //             } else {
    //                 dispatch({
    //                     type: notificationExecuteActions.NOTIFICATION_ERROR_ACTION,
    //                     notificationsError: true,
    //                 });
    //             }

    //             setIsLoading(false);
    //         } else {
    //             setShowNotificationIcon(false);
    //         }
    //     };

    //     if (isLoading && !notificationExecuted) {
    //         getNotifications();
    //     } else {
    //         setIsLoading(false);
    //     }
    // }, []);

    // const handleRedirectNotificationsPage = async () => {
    //     if (!notificationsError) {
    //         const { navigation } = props;
    //         navigation.navigate(dataRoutes.receivedNotifications, {
    //             notifications,
    //         });
    //     } else {
    //         Toast.show({
    //             type: "error",
    //             text1: "Não foi possível carregar as notificações!",
    //         });
    //     }
    // };

    return (
        <Container>
            <MenuButton onPress={handleOpenDrawer}>
                <Feather name="menu" size={24} color="white" />
            </MenuButton>
            <LogoImage source={logo} />
            {/* {showNotificationIcons ? (
                !isLoading ? (
                    <NotificationsButton
                        onPress={handleRedirectNotificationsPage}
                    >
                        <Feather
                            name="bell"
                            size={24}
                            color="white"
                            style={{ position: "absolute" }}
                        />
                        <NotificationBadge
                            visible={notificationCount !== 0}
                            size={21}
                        >
                            {!notificationsError ? (
                                notificationCount
                            ) : (
                                <Feather
                                    name="alert-triangle"
                                    size={14}
                                    color="white"
                                />
                            )}
                        </NotificationBadge>
                    </NotificationsButton>
                ) : (
                    <ActivityIndicator
                        animating
                        color="white"
                        style={{
                            width: "13%",
                            height: "100%",
                            marginRight: -1,
                        }}
                    />
                )
            ) : (
                <View />
            )} */}
            <RightSpacer />
        </Container>
    );
};
