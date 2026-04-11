import { createDrawerNavigator } from "@react-navigation/drawer";
import { FontAwesome } from "@expo/vector-icons";

import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";
import { DrawerContent } from "../components/DrawerContent";

import { theme } from "../styles/Theme";

const { Navigator, Screen } = createDrawerNavigator();

export const NavigationAdminMenu = () => (
    <Navigator
        drawerContent={(props) => <DrawerContent {...props} backAdmin />}
        screenOptions={{
            drawerLabelStyle: { marginLeft: -25, fontSize: 16 },
            drawerActiveBackgroundColor: theme.colors.primary,
            drawerActiveTintColor: theme.colors.white,
            drawerInactiveTintColor: theme.colors.text,
        }}
    >
        <Screen
            name={dataRoutes.admin.navigationTab}
            getComponent={() => require("./navigationTabs").AdminTabNavigation}
            options={{
                title: "Início Administrador",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="user-secret" size={20} color={color} />
                ),
                headerShown: false,
            }}
        />
        <Screen
            name={dataRoutes.admin.shrimpPrice}
            getComponent={() => require("../pages/Admin/ShrimpPrice").ShrimpPrice}
            options={{
                title: "Preço do Camarão",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="dollar" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.discountCupons}
            getComponent={() =>
                require("../pages/DiscountCupons").DiscountCupons
            }
            options={{
                title: "Cupons de Desconto",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="ticket" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.requestExtensionPublicationDate}
            getComponent={() =>
                require("../pages/Admin/RequestExtensionPublicationDate")
                    .RequestExtensionPublicationDate
            }
            options={{
                title: "Estenção de Data",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="calendar" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.listPublishAds}
            getComponent={() =>
                require("../pages/Admin/ListPublishAds").ListPublishAds
            }
            options={{
                title: "Solici. de Publicidade",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="bookmark" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.listPublishAdsActived}
            getComponent={() =>
                require("../pages/Admin/ListPublishAdsActived")
                    .ListPublishAdsActived
            }
            options={{
                title: "Publicidades Ativas",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="bookmark" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.notification}
            getComponent={() =>
                require("../pages/Admin/Notification").Notification
            }
            options={{
                title: "Envio de Notificações",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="send" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.drawPrizeSelect}
            getComponent={() =>
                require("../pages/Admin/DrawPrizeSelect").DrawPrizeSelect
            }
            options={{
                title: "Sorteio",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="cube" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.drawPrizeHistory}
            getComponent={() =>
                require("../pages/Admin/DrawPrizeHistory").DrawPrizeHistory
            }
            options={{
                title: "Histórico de Sorteios",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="history" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.drawerPrizeLiveClient}
            getComponent={() =>
                require("../pages/DrawerPrizeLiveClient")
                    .DrawerPrizeLiveClient
            }
            options={{
                title: "Lista Sorteios ao Vivo",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="list-alt" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.drawPrizeRulesNew}
            getComponent={() =>
                require("../pages/Admin/DrawPrizeRules/DrawPrizeRulesNew")
                    .DrawPrizeRulesNew
            }
            options={{
                title: "Regras Sorteio",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="cube" size={20} color={color} />
                ),
            }}
        />
    </Navigator>
);
