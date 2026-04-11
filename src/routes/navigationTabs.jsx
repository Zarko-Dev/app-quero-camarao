import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";

import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";
import { theme } from "../styles/Theme";

const { Navigator, Screen } = createBottomTabNavigator();

export const AdminTabNavigation = () => (
    <Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                let iconName = "user-secret";

                switch (route.name) {
                    case dataRoutes.admin.home:
                        iconName = "user-secret";
                        break;

                    case dataRoutes.admin.charts:
                        iconName = "area-chart";
                        break;

                    case dataRoutes.admin.users:
                        iconName = "users";
                        break;

                    default:
                        iconName = "user-secret";
                        break;
                }

                return (
                    <FontAwesome
                        name={iconName}
                        size={size - 2}
                        color={color}
                    />
                );
            },
            tabBarStyle: {
                paddingTop: 5,
                paddingBottom: 5,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: "gray",
            tabBarLabelStyle: {
                fontSize: 12,
            },
        })}
    >
        <Screen
            name={dataRoutes.admin.home}
            getComponent={() => require("../pages/Admin/Home").Home}
            options={{
                title: "Início",
                header: (props) => <Header {...props} />,
            }}
        />
        <Screen
            name={dataRoutes.admin.charts}
            getComponent={() => require("../pages/Admin/Charts").Charts}
            options={{
                title: "Gráficos",
                header: (props) => <Header {...props} />,
            }}
        />
        <Screen
            name={dataRoutes.admin.users}
            getComponent={() => require("../pages/Admin/Users").Users}
            options={{
                title: "Usuários",
                header: (props) => <Header {...props} />,
            }}
        />
    </Navigator>
);
