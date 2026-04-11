import { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { GetUserStorage } from "../services/Storage/UserStorage";
import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";
import { DrawerContent } from "../components/DrawerContent";

import { theme } from "../styles/Theme";

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
                getComponent={() => require("../pages/Home").Home}
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
                    getComponent={() => require("../pages/Profile").Profile}
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
                    getComponent={() =>
                        require("../pages/MyPublications").MyPublications
                    }
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
                    getComponent={() =>
                        require("../pages/PaymentOrders").PaymentOrders
                    }
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
                    getComponent={() => require("../pages/MyAds").MyAds}
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
                    getComponent={() =>
                        require("../pages/Invitations").Invitations
                    }
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
                    getComponent={() =>
                        require("../pages/DrawerPrizeLiveClient")
                            .DrawerPrizeLiveClient
                    }
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
                    getComponent={() =>
                        require("./AdminRoutes").NavigationAdminMenu
                    }
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
                getComponent={() => require("../pages/UseTerms").UseTerms}
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
                getComponent={() => require("../pages/Help").Help}
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
