import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";
import { DrawerContent } from "../components/DrawerContent";

import { DiscountCupons } from "../pages/DiscountCupons";
import { RequestExtensionPublicationDate } from "../pages/Admin/RequestExtensionPublicationDate";
import { ListPublishAds } from "../pages/Admin/ListPublishAds";
import { AdminTabNavigation } from "./navigationTabs";
import { Notification } from "../pages/Admin/Notification";
import { ListPublishAdsActived } from "../pages/Admin/ListPublishAdsActived";
import { ShrimpPrice } from "../pages/Admin/ShrimpPrice";
import { DrawPrizeRulesNew } from "../pages/Admin/DrawPrizeRules/DrawPrizeRulesNew";
import { DrawPrizeSelect } from "../pages/Admin/DrawPrizeSelect";
import { DrawPrizeHistory } from "../pages/Admin/DrawPrizeHistory";
import { DrawerPrizeLiveClient } from "../pages/DrawerPrizeLiveClient";
import { Parabens } from "../pages/Admin/Parabens";

const { Navigator, Screen } = createDrawerNavigator();

export const NavigationAdminMenu = () => (
    <Navigator
        drawerContent={(props) => <DrawerContent {...props} backAdmin />}
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
            name={dataRoutes.admin.navigationTab}
            component={AdminTabNavigation}
            options={{
                title: "Início Administrador",
                headerShown: false,
                drawerIcon: ({ color }) => (
                    <MaterialCommunityIcons name="view-dashboard-outline" size={21} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.shrimpPrice}
            component={ShrimpPrice}
            options={{
                title: "Preço do Camarão",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <MaterialCommunityIcons name="cash-multiple" size={21} color={color} />
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
                    <MaterialCommunityIcons name="ticket-percent-outline" size={21} color={color} />
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
                    <MaterialCommunityIcons name="calendar-month-outline" size={21} color={color} />
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
                    <MaterialCommunityIcons name="clipboard-text-outline" size={21} color={color} />
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
                    <MaterialCommunityIcons name="check-decagram-outline" size={21} color={color} />
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
                    <MaterialCommunityIcons name="send-outline" size={21} color={color} />
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
                    <MaterialCommunityIcons name="gift-outline" size={21} color={color} />
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
                    <MaterialCommunityIcons name="history" size={21} color={color} />
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
                    <MaterialCommunityIcons name="broadcast" size={21} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.drawPrizeRulesNew}
            component={DrawPrizeRulesNew}
            options={{
                title: "Regras Sorteio",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <MaterialCommunityIcons name="file-document-edit-outline" size={21} color={color} />
                ),
            }}
        />
        <Screen
            name={dataRoutes.admin.parabens}
            component={Parabens}
            options={{
                title: "Parabéns",
                header: (props) => <Header {...props} />,
                drawerIcon: ({ color }) => (
                    <MaterialCommunityIcons name="trophy-outline" size={21} color={color} />
                ),
            }}
        />
    </Navigator>
);
