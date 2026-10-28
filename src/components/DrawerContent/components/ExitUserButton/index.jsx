import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { dataRoutes } from "../../../../routes/dataRoutes";
import { getAuth, signOut } from "../../../../services/FirebaseAdapter";
import { ensureFirebaseReady } from "../../../../services/Firebase";
import { ClearUserStorage } from "../../../../services/Storage/UserStorage";
import { LoginActions } from "../../../../pages/Login/actions";

import { Container, ExitButton, TextButton } from "./styles";

export const ExitUserButton = ({ navigation }) => {
    const dispatch = useDispatch();

    const { isAuthenticated } = useSelector((state) => state.login);

    const handleExitApplication = async () => {
        await ClearUserStorage();

        try {
            const { firebaseApp } = await ensureFirebaseReady();
            await signOut(getAuth(firebaseApp));
        } catch (error) {
            if (__DEV__) console.error("[Exit] signOut failed:", error?.code, error?.message);
        }

        dispatch({ type: LoginActions.NOT_AUTEHNTICATED_ACTION });

        navigation.navigate(dataRoutes.login);
    };

    return (
        isAuthenticated && (
            <Container>
                <ExitButton onPress={handleExitApplication}>
                    <Feather name="log-out" size={24} color="white" />
                    <TextButton>Sair</TextButton>
                </ExitButton>
            </Container>
        )
    );
};
