import { useEffect } from "react";
import { Image } from "react-native";
import SplashImage from "../../assets/images/splash.png";
import { dataRoutes } from "../../routes/dataRoutes";
import { GetUserStorage } from "../../services/Storage/UserStorage";

export const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const checkAuth = async () => {
            const user = await GetUserStorage();
            navigation.navigate(user ? dataRoutes.navigation : dataRoutes.login);
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
