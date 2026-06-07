import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import { BackAdminButton } from "./components/BackAdminButton";
import { ExitUserButton } from "./components/ExitUserButton";
import { Profile } from "./components/Profile";
import { dataRoutes } from "../../routes/dataRoutes";

export const DrawerContent = (props) => {
    const { navigation, backAdmin, state, descriptors } = props;

    // Separate admin route from the rest
    const adminRouteName = dataRoutes.admin.navigation; // "Admin:Navigation"
    const filteredRoutes = state.routes.filter((r) => r.name !== adminRouteName);
    const adminRoute = state.routes.find((r) => r.name === adminRouteName);

    const filteredState = {
        ...state,
        routes: filteredRoutes,
        index: Math.min(
            state.index,
            Math.max(0, filteredRoutes.length - 1),
        ),
    };

    return (
        <>
            <Profile navigation={navigation} />
            <DrawerContentScrollView
                {...props}
                state={filteredState}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
            >
                <DrawerItemList {...props} state={filteredState} />
            </DrawerContentScrollView>
            {adminRoute && (
                <DrawerItem
                    label={
                        descriptors[adminRoute.key]?.options?.drawerLabel ??
                        descriptors[adminRoute.key]?.options?.title ??
                        "Administrador"
                    }
                    icon={({ size, color }) => (
                        <Feather name="settings" size={size} color={color} />
                    )}
                    onPress={() => navigation.navigate(adminRoute.name)}
                    style={{ marginBottom: 0 }}
                />
            )}
            {backAdmin ? (
                <BackAdminButton navigation={navigation} />
            ) : (
                <ExitUserButton navigation={navigation} />
            )}
        </>
    );
};
