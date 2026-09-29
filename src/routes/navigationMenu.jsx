import { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { GetUserStorage, SetUserStorage } from "../services/Storage/UserStorage";
import { expireUserPlan } from "../controllers/Plans/expirePlan";
import { planActions } from "../pages/MonthlyPlan/planActions";
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
import { MonthlyPlan } from "../pages/MonthlyPlan";
import { PondManagement } from "../pages/PondManagement";
import { MyPonds } from "../pages/MyPonds";

const { Navigator, Screen } = createDrawerNavigator();

export const NavigationMenu = () => {
    const dispatch = useDispatch();
    const [userRules, setUserRules] = useState([]);
    const [userType, setUserType] = useState([]);
    const [hasActivePlan, setHasActivePlan] = useState(false);

    const { isAuthenticated } = useSelector((state) => state.login);
    const { activated: planActivated } = useSelector(
        (state) => state.planState,
    );

    useEffect(() => {
        const checkPlanAndLoad = async () => {
            try {
                const data = await GetUserStorage();
                if (!data) return;

                setUserRules(data.rules);
                setUserType(data.userType);

                if (data.activePlan?.active === true) {
                    const endDate = new Date(data.activePlan.endDate);
                    if (endDate < new Date()) {
                        await expireUserPlan(data.email);
                        await SetUserStorage({
                            ...data,
                            activePlan: { ...data.activePlan, active: false },
                        });
                        dispatch({ type: planActions.PLAN_EXPIRED });
                        setHasActivePlan(false);
                    } else {
                        setHasActivePlan(true);
                    }
                } else {
                    setHasActivePlan(false);
                }
            } catch {
                // silently ignore storage errors
            }
        };

        checkPlanAndLoad();
    }, [isAuthenticated, planActivated]);

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
            {isAuthenticated && !hasActivePlan && (
                <Screen
                    name={dataRoutes.monthlyPlan}
                    component={MonthlyPlan}
                    options={{
                        title: "Assinar Plano Mensal",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <FontAwesome
                                name="star"
                                size={20}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
            {isAuthenticated && hasActivePlan && (
                <Screen
                    name={dataRoutes.myPonds}
                    component={MyPonds}
                    options={{
                        title: "Meus Viveiros",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <Feather name="layers" size={20} color={color} />
                        ),
                    }}
                />
            )}
            {isAuthenticated && hasActivePlan && (
                <Screen
                    name={dataRoutes.pondManagement}
                    component={PondManagement}
                    options={{
                        title: "Gestão de Viveiros",
                        header: (props) => <Header {...props} />,
                        drawerIcon: ({ color }) => (
                            <Feather name="cpu" size={20} color={color} />
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
