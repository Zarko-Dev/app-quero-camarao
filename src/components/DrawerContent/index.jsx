import {
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer";
import { BackAdminButton } from "./components/BackAdminButton";
import { ExitUserButton } from "./components/ExitUserButton";

import { Profile } from "./components/Profile";

export const DrawerContent = (props) => {
    const { navigation, backAdmin } = props;

    return (
        <>
            <Profile navigation={navigation} />
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            {backAdmin ? (
                <BackAdminButton navigation={navigation} />
            ) : (
                <ExitUserButton navigation={navigation} />
            )}
        </>
    );
};
