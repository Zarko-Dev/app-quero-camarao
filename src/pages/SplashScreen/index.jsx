import { useEffect } from "react";
import { Image } from "react-native";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";

import SplashImage from "../../assets/images/splash.png";
import { dataRoutes } from "../../routes/dataRoutes";
import { ClearUserStorage, GetUserStorage } from "../../services/Storage/UserStorage";
import { ensureFirebaseReady } from "../../services/Firebase";
import { getAuth, onAuthStateChanged } from "../../services/FirebaseAdapter";
import { LoginActions } from "../Login/actions";
import { waitForAuthUser } from "../../utils/authSession";

export const SplashScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            const user = await GetUserStorage();

            if (!user) {
                navigation.navigate(dataRoutes.login);
                return;
            }

            // O storage "@USER" sobrevive ao update 2.0.x (SDK JS) -> 3.0.x
            // (SDK nativo), mas a sessão do Firebase Auth não. Sem request.auth
            // as regras negam criar ordem, vendas e leituras do dono.
            const { user: authUser, timedOut } = await waitForAuthUser(async (cb) => {
                const { firebaseApp } = await ensureFirebaseReady();
                return onAuthStateChanged(getAuth(firebaseApp), cb);
            });

            if (!authUser && !timedOut) {
                await ClearUserStorage();
                dispatch({ type: LoginActions.NOT_AUTEHNTICATED_ACTION });
                Toast.show({
                    type: "info",
                    text1: "Sua sessão expirou",
                    text2: "Entre novamente para continuar.",
                });
                navigation.navigate(dataRoutes.login);
                return;
            }

            navigation.navigate(dataRoutes.navigation);
        };

        const timer = setTimeout(checkAuth, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Image
            source={SplashImage}
            style={{
                flex: 1,
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                marginTop: -30,
            }}
            fadeDuration={0}
        />
    );
};
