/* eslint-disable indent */

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { dataRoutes } from "../../../../routes/dataRoutes";
import { GetUserStorage } from "../../../../services/Storage/UserStorage";
import { BoxShadowIos } from "../../../../styles/IosShadow";

import {
    ButtonLoginRegister,
    ButtonText,
    Container,
    UserContentIsNotAuthenticated,
    UserEmail,
    UserImage,
    UserName,
} from "./styles";

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
        <Container>
            <UserImage
                source={{
                    uri: userImageUrl,
                }}
            />
            <UserName>{dataUserStore?.name}</UserName>
            <UserEmail>{dataUserStore?.email}</UserEmail>
        </Container>
    ) : (
        <Container>
            <UserContentIsNotAuthenticated>
                <Feather name="user" size={40} color="#1E1E1E" />
            </UserContentIsNotAuthenticated>
            <ButtonLoginRegister onPress={handleRedirectLogin}>
                <ButtonText style={BoxShadowIos}>Entrar</ButtonText>
            </ButtonLoginRegister>
        </Container>
    );
};
