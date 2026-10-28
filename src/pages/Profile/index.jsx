/* eslint-disable indent */

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Modal, View, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import {
    ClearUserStorage,
    GetUserStorage,
    SetUserStorage,
} from "../../services/Storage/UserStorage";
import { saveImage } from "../../controllers/User/saveImage";
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

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Toast.show({
                type: "error",
                text1: "Permissão Negada",
                text2: "Permita o acesso à galeria para escolher uma foto.",
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            await uploadProfileImage(uri);
        }
    };

    const uploadProfileImage = async (imageUri) => {
        const dataUser = await GetUserStorage();
        const resultUploadImage = await saveImage(dataUser.email, imageUri);

        if (!resultUploadImage.error) {
            await SetUserStorage({ ...dataUser, userImage: imageUri });
            handleRefresh();
            Toast.show({
                type: "success",
                text1: "Sucesso",
                text2: "Foto de perfil atualizada!",
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Erro",
                text2: "Não foi possível salvar a imagem",
            });
        }
    };

    const handleAvatarPress = () => {
        Alert.alert(
            "Foto de Perfil",
            "Escolha como deseja adicionar sua foto:",
            [
                { text: "Tirar Foto", onPress: () => setShowCameraModal(true) },
                { text: "Escolher da Galeria", onPress: handlePickImage },
                { text: "Cancelar", style: "cancel" }
            ]
        );
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
                        onPress={handleAvatarPress}
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
