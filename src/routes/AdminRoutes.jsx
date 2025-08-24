import { createDrawerNavigator } from "@react-navigation/drawer";
import { FontAwesome } from "@expo/vector-icons";

import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";
import { DrawerContent } from "../components/DrawerContent";

import { theme } from "../styles/Theme";

import { DiscountCupons } from "../pages/DiscountCupons";
import { RequestExtensionPublicationDate } from "../pages/Admin/RequestExtensionPublicationDate";
import { ListPublishAds } from "../pages/Admin/ListPublishAds";
import { AdminTabNavigation } from "./navigationTabs";
import { Notification } from "../pages/Admin/Notification";
import { ListPublishAdsActived } from "../pages/Admin/ListPublishAdsActived";
import { ShrimpPrice } from "../pages/Admin/ShrimpPrice";
import { DrawPrizeRules } from "../pages/Admin/DrawPrizeRules";
import { DrawPrizeSelect } from "../pages/Admin/DrawPrizeSelect";
import { DrawPrizeHistory } from "../pages/Admin/DrawPrizeHistory";
import { DrawerPrizeLiveClient } from "../pages/DrawerPrizeLiveClient";

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
            component={AdminTabNavigation}
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
            component={ShrimpPrice}
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
            component={DiscountCupons}
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
            component={RequestExtensionPublicationDate}
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
            component={ListPublishAds}
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
            component={ListPublishAdsActived}
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
            component={Notification}
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
            component={DrawPrizeSelect}
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
            component={DrawPrizeHistory}
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
            component={DrawerPrizeLiveClient}
            options={{
                title: "Lista Sorteios ao Vivo",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <FontAwesome name="list-alt" size={20} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.drawPrizeRules}
            component={DrawPrizeRules}
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
