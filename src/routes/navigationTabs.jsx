import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { dataRoutes } from "./dataRoutes";

import { Header } from "../components/Header";

import { Home } from "../pages/Admin/Home";
import { theme } from "../styles/Theme";
import { Charts } from "../pages/Admin/Charts";
import { Users } from "../pages/Admin/Users";

const { Navigator, Screen } = createBottomTabNavigator();

export const AdminTabNavigation = () => (
    <Navigator
        screenOptions={({ route }) => ({
            lazy: true,
            tabBarIcon: ({ color, size }) => {
                let iconName = "home-variant-outline";

                switch (route.name) {
                    case dataRoutes.admin.home:
                        iconName = "home-variant-outline";
                        break;

                    case dataRoutes.admin.charts:
                        iconName = "chart-line";
                        break;

                    case dataRoutes.admin.users:
                        iconName = "account-group-outline";
                        break;

                    default:
                        iconName = "home-variant-outline";
                        break;
                }

                return (
                    <MaterialCommunityIcons
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
            component={Home}
            options={{
                title: "Início",
                header: (props) => <Header {...props} />,
            }}
        />
        <Screen
            name={dataRoutes.admin.charts}
            component={Charts}
            options={{
                title: "Gráficos",
                header: (props) => <Header {...props} />,
            }}
        />
        <Screen
            name={dataRoutes.admin.users}
            component={Users}
            options={{
                title: "Usuários",
                header: (props) => <Header {...props} />,
            }}
        />
    </Navigator>
);
