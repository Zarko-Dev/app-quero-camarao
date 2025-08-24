import React, { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { Camera } from "expo-camera";
import { ActivityIndicator } from "react-native-paper";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";

import {
    Container,
    CameraStyle,
    ContentHeader,
    ContentFooter,
    ButtonTakePicture,
    ContentButtonTakePicture,
    ButtonGalery,
    ButtonBackCamera,
} from "./styles";

export const ShrimpCamera = ({ onClose, actionGetImage }) => {
    const camRef = useRef(null);

    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [facing] = useState("back");
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

    const handleTakePicture = async () => {
        if (camRef) {
            setPressButtonTakePicture(true);

            const dataImage = await camRef.current.takePictureAsync();

            actionGetImage(dataImage.uri);

            onClose();

            setPressButtonTakePicture(false);
        }
    };

    const handlePickImage = async () => {
        const dataImage = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!dataImage.canceled) {
            actionGetImage(dataImage.assets[0].uri);

            onClose();
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
                    <ButtonGalery onPress={handlePickImage}>
                        <Feather name="image" size={35} color="white" />
                    </ButtonGalery>
                </ContentFooter>
            </CameraStyle>
        </Container>
    );
};
