import { useState } from "react";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { Video, ResizeMode } from "expo-av";

import { DialogComponent } from "../../../../../components/Dialog";

import {
    ActionButton,
    ActionButtonFull,
    ContentActionsButton,
    ContentCardAds,
    ContentImage,
    TextActionButton,
} from "./styles";
import { BoxShadowIos } from "../../../../../styles/IosShadow";
import { theme } from "../../../../../styles/Theme";
import { updateStatusPublishAds } from "../../../../../controllers/PublishAds/update";
import { DialogInputComponent } from "../../../../../components/DialogInput";
import { dataRoutes } from "../../../../../routes/dataRoutes";

export const CardAds = ({ dataUserAds, reload, actionReload }) => {
    const navigation = useNavigation();

    const [alertData, setAlertData] = useState({
        text: "",
        buttonText: "",
        action: () => {},
    });
    const [isLoadingApprove, setIsLoadinApprove] = useState(false);
    const [isLoadingRepprove, setIsLoadinRepprove] = useState(false);
    const [isLoadingAdjust, setIsLoadinAdjust] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogInputVisible, setDialogInputVisible] = useState(false);
    const [alertValue, setAlertValue] = useState("");

    const handleReproveAds = () => {
        setDialogVisible(false);
        setIsLoadinRepprove(true);

        updateStatusPublishAds(dataUserAds.id, "reproved")
            .then((result) => {
                if (result) {
                    Toast.show({
                        type: "success",
                        text1: "Publicidade reprovada!",
                    });

                    actionReload(!reload);
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível reprovar a publicidade!",
                        text2: "Tente novamente em instantes",
                    });
                }
            })
            .catch()
            .finally(() => {
                setIsLoadinRepprove(false);
            });
    };

    const handleAdjustAds = () => {
        setDialogInputVisible(false);
        setIsLoadinAdjust(true);

        updateStatusPublishAds(dataUserAds.id, "adjust", alertValue)
            .then((result) => {
                if (result) {
                    Toast.show({
                        type: "success",
                        text1: "Publicidade enviada para ajuste!",
                    });

                    actionReload(!reload);
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível enviar para ajuste!",
                        text2: "Tente novamente em instantes",
                    });
                }
            })
            .catch()
            .finally(() => {
                setIsLoadinAdjust(false);
            });
    };

    const handleApproveAds = () => {
        setDialogVisible(false);
        setIsLoadinApprove(true);

        updateStatusPublishAds(dataUserAds.id, "approved")
            .then((result) => {
                if (result) {
                    Toast.show({
                        type: "success",
                        text1: "Publicidade aprovada!",
                    });

                    actionReload(!reload);
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível aprovar a publicidade!",
                        text2: "Tente novamente em instantes",
                    });
                }
            })
            .catch()
            .finally(() => {
                setIsLoadinApprove(false);
            });
    };

    const handleViewAds = () => {
        navigation.navigate(dataRoutes.registerMyAds, {
            dataAds: dataUserAds,
            view: true,
        });
    };

    return (
        <ContentCardAds style={BoxShadowIos}>
            <ContentImage onPress={handleViewAds}>
                {dataUserAds && dataUserAds.type === "img" ? (
                    <Image
                        source={{
                            uri: dataUserAds.imageUrl,
                        }}
                        style={{
                            width: "100%",
                            height: Number(
                                theme.size.componentSize(174).replace("px", ""),
                            ),
                        }}
                    />
                ) : (
                    <Video
                        source={{
                            uri: dataUserAds.imageUrl,
                        }}
                        style={{
                            width: "100%",
                            height: Number(
                                theme.size.componentSize(174).replace("px", ""),
                            ),
                        }}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                        shouldPlay
                        isMuted
                    />
                )}
            </ContentImage>
            <ContentActionsButton>
                <ActionButton
                    color={theme.colors.primary}
                    onPress={() => {
                        setAlertData({
                            text: "Deseja reprovar esta publicidade?",
                            buttonText: "Reprovar",
                            action: handleReproveAds,
                        });

                        setDialogVisible(true);
                    }}
                >
                    {!isLoadingRepprove ? (
                        <TextActionButton>Reprovar</TextActionButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ActionButton>
                <ActionButton
                    color={theme.colors.black}
                    onPress={() => {
                        setAlertData({
                            text: "Deseja devolver a publicidade para ajuste?",
                            buttonText: "Devolver",
                            action: () => {
                                setAlertValue("");
                                setDialogVisible(false);
                                setDialogInputVisible(true);
                            },
                        });

                        setDialogVisible(true);
                    }}
                >
                    {!isLoadingAdjust ? (
                        <TextActionButton>Ajustar/Corrigir</TextActionButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ActionButton>
            </ContentActionsButton>
            <ActionButtonFull
                onPress={() => {
                    setAlertData({
                        text: "Deseja aprovar esta publicidade?",
                        buttonText: "Aprovar",
                        action: handleApproveAds,
                    });

                    setDialogVisible(true);
                }}
            >
                {!isLoadingApprove ? (
                    <TextActionButton>Aprovar</TextActionButton>
                ) : (
                    <ActivityIndicator animating color="white" />
                )}
            </ActionButtonFull>
            <DialogComponent
                visible={dialogVisible}
                title="Atenção"
                text={alertData.text}
                textActionButton={alertData.buttonText}
                hideDialog={() => setDialogVisible(false)}
                actionButton={() => alertData.action()}
                dismissable={false}
            />
            <DialogInputComponent
                visible={dialogInputVisible}
                title="Atenção"
                text="Envie uma descrição do ajuste da publicidade!"
                textActionButton="Enviar Ajuste"
                hideDialog={() => setDialogInputVisible(false)}
                actionButton={() => handleAdjustAds()}
                dismissable={false}
                inputValue={alertValue}
                actionInputValue={setAlertValue}
            />
        </ContentCardAds>
    );
};
