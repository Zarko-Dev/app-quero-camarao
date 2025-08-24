import { useEffect } from "react";
import { Image } from "react-native";
import SplashImage from "../../assets/images/splash.png";
import { dataRoutes } from "../../routes/dataRoutes";

export const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        setTimeout(() => {
            navigation.navigate(dataRoutes.navigation);
        }, 2000);
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
