import React, { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { Camera } from "expo-camera";
import { ActivityIndicator } from "react-native-paper";
import Feather from "@expo/vector-icons/Feather";

import {
    GetUserStorage,
    SetUserStorage,
} from "../../../services/Storage/UserStorage";
import { saveImage } from "../../../controllers/User/saveImage";

import {
    Container,
    CameraStyle,
    ContentHeader,
    ContentFooter,
    ButtonTakePicture,
    ContentButtonTakePicture,
    ButtonBackCamera,
} from "./styles";

export const UserCamera = ({ onClose, actionGetImage }) => {
    const camRef = useRef(null);

    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [facing] = useState("front");
    const [pressButtonTakePicture, setPressButtonTakePicture] = useState(false);

    const ActionEffectCamera = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();

        setHasCameraPermission(status === "granted");
    };

    useEffect(() => {
        ActionEffectCamera().then().catch();
    }, []);

    if (hasCameraPermission === false) {
        onClose();

        Toast.show({
            type: "error",
            text1: "Acesso a Camera Negado",
            text2: "Permita que o aplicativo tenha acesso a sua camera!",
        });
    }

    const saveUserImage = async (imageUri) => {
        const dataUser = await GetUserStorage();

        const resultUploadImage = await saveImage(dataUser.email, imageUri);

        if (!resultUploadImage.error) {
            await SetUserStorage({ ...dataUser, userImage: imageUri });
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível salvar sua imagem",
                text2: "Tente novamente mais tarde",
            });
        }

        actionGetImage();
    };

    const handleTakePicture = async () => {
        if (camRef) {
            setPressButtonTakePicture(true);

            const dataImage = await camRef.current.takePictureAsync();

            await saveUserImage(dataImage.uri);

            onClose();

            setPressButtonTakePicture(false);
        }
    };

    const handleBackCamera = () => {
        onClose();
    };

    return (
        <Container>
            <CameraStyle facing={facing} ref={camRef}>
                <ContentHeader>
                    <ButtonBackCamera onPress={handleBackCamera}>
                        <Feather name="arrow-left" size={35} color="white" />
                    </ButtonBackCamera>
                </ContentHeader>
                <ContentFooter>
                    <ContentButtonTakePicture>
                        {!pressButtonTakePicture ? (
                            <ButtonTakePicture onPress={handleTakePicture} />
                        ) : (
                            <ActivityIndicator
                                animating
                                color="#fff"
                                size={40}
                            />
                        )}
                    </ContentButtonTakePicture>
                </ContentFooter>
            </CameraStyle>
        </Container>
    );
};
