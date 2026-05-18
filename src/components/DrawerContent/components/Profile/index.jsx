/* eslint-disable indent */

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { dataRoutes } from "../../../../routes/dataRoutes";
import { GetUserStorage } from "../../../../services/Storage/UserStorage";
import { BoxShadowIos } from "../../../../styles/IosShadow";

import {
    ButtonLoginRegister,
    ButtonText,
    Container,
    HeaderMark,
    HeaderMarkImage,
    IdentityBadge,
    IdentityBadgeText,
    UserContentIsNotAuthenticated,
    UserEmail,
    UserImage,
    UserName,
} from "./styles";
import ShrimpIcon from "../../../../assets/images/shrimpIcon.png";

export const Profile = ({ navigation }) => {
    const [dataUserStore, setDataUserStore] = useState();
    const [userImageUrl, setUserImageUrl] = useState(
        "https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=camarao",
    );

    const { isAuthenticated, refresh } = useSelector((state) => state.login);

    useEffect(() => {
        GetUserStorage().then((data) => {
            if (data) {
                setDataUserStore(data);
                setUserImageUrl(
                    data?.userImage
                        ? data.userImage
                        : `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=${
                              data.name.split(" ")[0]
                          }`,
                );
            }
        });
    }, [isAuthenticated, refresh]);

    const handleRedirectLogin = () => {
        navigation.navigate(dataRoutes.login);
    };

    return isAuthenticated ? (
        <LinearGradient
            colors={["#ff8f2a", "#ff5e1f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Container>
                <HeaderMark>
                    <HeaderMarkImage source={ShrimpIcon} />
                </HeaderMark>
                <UserImage
                    source={{
                        uri: userImageUrl,
                    }}
                />
                <UserName numberOfLines={2}>{dataUserStore?.name}</UserName>
                <UserEmail numberOfLines={1}>{dataUserStore?.email}</UserEmail>
                <IdentityBadge>
                    <IdentityBadgeText>Conta conectada</IdentityBadgeText>
                </IdentityBadge>
            </Container>
        </LinearGradient>
    ) : (
        <LinearGradient
            colors={["#ff8f2a", "#ff5e1f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Container>
                <HeaderMark>
                    <HeaderMarkImage source={ShrimpIcon} />
                </HeaderMark>
                <UserContentIsNotAuthenticated>
                    <Feather name="user" size={40} color="#1E1E1E" />
                </UserContentIsNotAuthenticated>
                <ButtonLoginRegister onPress={handleRedirectLogin}>
                    <ButtonText style={BoxShadowIos}>Entrar</ButtonText>
                </ButtonLoginRegister>
            </Container>
        </LinearGradient>
    );
};
