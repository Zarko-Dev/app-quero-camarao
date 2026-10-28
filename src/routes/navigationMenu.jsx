import { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { GetUserStorage } from "../services/Storage/UserStorage";
import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";
import { DrawerContent } from "../components/DrawerContent";

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
                drawerStyle: { width: "86%", backgroundColor: "#ffffff" },
                drawerLabelStyle: {
                    marginLeft: 4,
                    fontSize: 15,
                    fontWeight: "600",
                },
                drawerItemStyle: {
                    marginHorizontal: 10,
                    marginVertical: 3,
                    borderRadius: 12,
                    paddingHorizontal: 6,
                },
                drawerActiveBackgroundColor: "#fff1e8",
                drawerActiveTintColor: "#f55b1f",
                drawerInactiveTintColor: "#3f3f3f",
            }}
        >
            <Screen
                name={dataRoutes.home}
                component={Home}
                options={{
                    title: "Início",
                    header: (props) => <Header {...props} />,
                    drawerIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home-outline" size={21} color={color} />
                    ),
                }}
            />
            {isAuthenticated && (
                <Screen
                    name={dataRoutes.drawerPrizeLiveClient}
                    component={DrawerPrizeLiveClient}
                    options={{
                        title: "Sorteio ao vivo",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <MaterialCommunityIcons name="broadcast" size={21} color={color} />
                        ),
                    }}
                />
            )}
            {isAuthenticated && (
                <Screen
                    name={dataRoutes.profile}
                    component={Profile}
                    options={{
                        title: "Meus dados",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <MaterialCommunityIcons name="account-outline" size={21} color={color} />
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
                        headerShown: false,
                        drawerIcon: ({ color }) => (
                            <MaterialCommunityIcons name="fish" size={21} color={color} />
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
                        headerShown: false,
                        drawerIcon: ({ color }) => (
                            <MaterialCommunityIcons name="cash-multiple" size={21} color={color} />
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
                            <MaterialCommunityIcons name="bullhorn-outline" size={21} color={color} />
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
                            <MaterialCommunityIcons name="ticket-percent-outline" size={21} color={color} />
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
                            <MaterialCommunityIcons name="shield-account-outline" size={21} color={color} />
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
                        <MaterialCommunityIcons name="file-document-outline" size={21} color={color} />
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
                        <MaterialCommunityIcons name="help-circle-outline" size={21} color={color} />
                    ),
                }}
            />
        </Navigator>
    );
};
