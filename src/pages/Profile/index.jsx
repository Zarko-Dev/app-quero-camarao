/* eslint-disable indent */

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Modal, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";

import {
    ClearUserStorage,
    GetUserStorage,
} from "../../services/Storage/UserStorage";
import { dataRoutes } from "../../routes/dataRoutes";
import { LoginActions } from "../Login/actions";

import { UserCamera } from "../../components/Camera/UserCamera";

import shrimpIcon from "../../assets/images/shrimpIcon.png";

import {
    ActionButton,
    ButtonCamera,
    ButtonExit,
    Container,
    ContentActionButtons,
    ContentProfile,
    ContentUserType,
    Divider,
    ShrimpIcon,
    TextButton,
    TextExitButton,
    UserEmail,
    UserImage,
    UserName,
    UserTypeTag,
} from "./styles";
import { theme } from "../../styles/Theme";

export const Profile = ({ navigation }) => {
    const dispatch = useDispatch();

    const { refresh } = useSelector((state) => state.login);

    const [isExitLoading, setIsExitLoading] = useState(false);
    const [dataUserStore, setDataUserStore] = useState();
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [userImageUrl, setUserImageUrl] = useState(
        "https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=camarao",
    );

    useFocusEffect(
        useCallback(() => {
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
        }, [refresh]),
    );

    const handleRefresh = () => {
        dispatch({ type: LoginActions.REFRESH_DATA_ACTION });
    };

    const handleRedirectPersolData = () => {
        navigation.navigate(dataRoutes.personalData, {
            dataUser: dataUserStore,
        });
    };

    const handleRedirectUserAddress = () => {
        navigation.navigate(dataRoutes.address, {
            dataUser: dataUserStore,
        });
    };

    const handleExitApplication = async () => {
        setIsExitLoading(true);

        await ClearUserStorage();

        dispatch({ type: LoginActions.NOT_AUTEHNTICATED_ACTION });

        navigation.navigate(dataRoutes.login);

        setIsExitLoading(false);
    };

    const handleRedirectMyPublications = () => {
        navigation.navigate(dataRoutes.myPublications);
    };

    const handleRedirectDeleteUser = () => {
        navigation.navigate(dataRoutes.deleteUser);
    };

    return (
        <>
            <Container>
                <ContentProfile>
                    <ContentUserType>
                        <UserTypeTag>
                            {dataUserStore?.userType === "productor"
                                ? "Produtor"
                                : "Cliente"}
                        </UserTypeTag>
                    </ContentUserType>
                    <ButtonCamera
                        activeOpacity={0.8}
                        onPress={() => setShowCameraModal(true)}
                    >
                        <UserImage
                            source={{
                                uri: dataUserStore?.userImage
                                    ? dataUserStore.userImage
                                    : userImageUrl,
                            }}
                        />
                    </ButtonCamera>
                    <UserName>{dataUserStore?.name}</UserName>
                    <UserEmail>{dataUserStore?.email}</UserEmail>
                </ContentProfile>
                <ContentActionButtons>
                    <ActionButton onPress={handleRedirectPersolData}>
                        <Feather name="user" size={24} color="black" />
                        <TextButton> Meus dados pessoais</TextButton>
                    </ActionButton>
                    <Divider />
                    <ActionButton onPress={handleRedirectMyPublications}>
                        <ShrimpIcon source={shrimpIcon} />
                        <TextButton>Camarões cadastrados</TextButton>
                    </ActionButton>
                    <Divider />
                    <ActionButton onPress={handleRedirectUserAddress}>
                        <Feather name="map-pin" size={24} color="black" />
                        <TextButton> Endereço cadastrado</TextButton>
                    </ActionButton>
                    <Divider />
                    <ActionButton onPress={handleRedirectDeleteUser}>
                        <Feather
                            name="x-circle"
                            size={24}
                            color={theme.colors.red}
                        />
                        <TextButton red>
                            {" "}
                            Desvincular usuário da Quero Camarão
                        </TextButton>
                    </ActionButton>
                </ContentActionButtons>
                <ButtonExit onPress={handleExitApplication}>
                    {!isExitLoading ? (
                        <TextExitButton>
                            <Feather name="log-out" size={22} color="white" />{" "}
                            Sair
                        </TextExitButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonExit>
            </Container>
            <View>
                <Modal
                    animationType="slide"
                    visible={showCameraModal}
                    onRequestClose={() => setShowCameraModal(false)}
                >
                    <UserCamera
                        onClose={() => setShowCameraModal(false)}
                        actionGetImage={handleRefresh}
                    />
                </Modal>
            </View>
        </>
    );
};
