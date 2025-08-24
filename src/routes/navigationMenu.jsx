import { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { GetUserStorage } from "../services/Storage/UserStorage";
import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";
import { DrawerContent } from "../components/DrawerContent";

import { theme } from "../styles/Theme";

import { Home } from "../pages/Home";
import { Profile } from "../pages/Profile";
import { MyPublications } from "../pages/MyPublications";
import { UseTerms } from "../pages/UseTerms";
import { PaymentOrders } from "../pages/PaymentOrders";
import { Help } from "../pages/Help";
import { Invitations } from "../pages/Invitations";
import { MyAds } from "../pages/MyAds";
import { NavigationAdminMenu } from "./AdminRoutes";
import { DrawerPrizeLiveClient } from "../pages/DrawerPrizeLiveClient";

const { Navigator, Screen } = createDrawerNavigator();

export const NavigationMenu = () => {
    const [userRules, setUserRules] = useState([]);
    const [userType, setUserType] = useState([]);

    const { isAuthenticated } = useSelector((state) => state.login);

    useEffect(() => {
        GetUserStorage()
            .then((data) => {
                setUserRules(data.rules);
                setUserType(data.userType);
            })
            .catch();
    }, [isAuthenticated]);

    return (
        <Navigator
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{
                drawerLabelStyle: { marginLeft: -25, fontSize: 16 },
                drawerActiveBackgroundColor: theme.colors.primary,
                drawerActiveTintColor: theme.colors.white,
                drawerInactiveTintColor: theme.colors.text,
            }}
        >
            <Screen
                name={dataRoutes.home}
                component={Home}
                options={{
                    title: "Início",
                    header: (props) => <Header {...props} />,
                    drawerIcon: ({ color }) => (
                        <Feather name="home" size={20} color={color} />
                    ),
                }}
            />
            {isAuthenticated && (
                <Screen
                    name={dataRoutes.profile}
                    component={Profile}
                    options={{
                        title: "Meus dados",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <Feather name="user" size={20} color={color} />
                        ),
                    }}
                />
            )}
            {isAuthenticated && userType === "productor" && (
                <Screen
                    name={dataRoutes.myPublications}
                    component={MyPublications}
                    options={{
                        title: "Meus camarões",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <Feather name="star" size={20} color={color} />
                        ),
                    }}
                />
            )}
            {isAuthenticated && userType === "productor" && (
                <Screen
                    name={dataRoutes.paymentOrders}
                    component={PaymentOrders}
                    options={{
                        title: "Meus Pagamentos",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <Feather
                                name="dollar-sign"
                                size={20}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
            {isAuthenticated && (
                <Screen
                    name={dataRoutes.myAds}
                    component={MyAds}
                    options={{
                        title: "Minhas Publicidades",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <FontAwesome
                                name="bookmark"
                                size={20}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
            {isAuthenticated && (
                <Screen
                    name={dataRoutes.invitations}
                    component={Invitations}
                    options={{
                        title: "Indique e ganhe",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <FontAwesome
                                name="ticket"
                                size={20}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
            {isAuthenticated && (
                <Screen
                    name={dataRoutes.drawerPrizeLiveClient}
                    component={DrawerPrizeLiveClient}
                    options={{
                        title: "Sorteio ao vivo",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <FontAwesome name="cube" size={20} color={color} />
                        ),
                    }}
                />
            )}
            {userRules?.includes("Admin") && (
                <Screen
                    name={dataRoutes.admin.navigation}
                    component={NavigationAdminMenu}
                    options={{
                        title: "Administrador",
                        headerShown: false,
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <FontAwesome
                                name="user-secret"
                                size={20}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
            <Screen
                name={dataRoutes.useTerms}
                component={UseTerms}
                options={{
                    title: "Termos de Uso",
                    header: (props) => <Header {...props} />,
                    drawerIcon: ({ color }) => (
                        <Feather name="file-text" size={20} color={color} />
                    ),
                }}
            />
            <Screen
                name={dataRoutes.help}
                component={Help}
                options={{
                    title: "Ajuda",
                    header: (props) => <Header {...props} />,
                    drawerIcon: ({ color }) => (
                        <Feather name="help-circle" size={20} color={color} />
                    ),
                }}
            />
        </Navigator>
    );
};
