import { useState } from "react";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { Video, ResizeMode } from "expo-av";

import { DialogComponent } from "../../../../../components/Dialog";

import {
    ActionButtonFull,
    ContentCardAds,
    ContentImage,
    TextActionButton,
} from "./styles";
import { BoxShadowIos } from "../../../../../styles/IosShadow";
import { theme } from "../../../../../styles/Theme";
import { dataRoutes } from "../../../../../routes/dataRoutes";
import {
    deleteAds,
    deleteAdsImage,
} from "../../../../../controllers/PublishAds/delete";

export const CardAds = ({ dataUserAds, reload, actionReload }) => {
    const navigation = useNavigation();

    const [alertData, setAlertData] = useState({
        text: "",
        buttonText: "",
        action: () => {},
    });
    const [isLoadingRemove, setIsLoadinRemove] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleDeleteAds = async () => {
        setDialogVisible(false);
        setIsLoadinRemove(true);

        const resultDeleteImage = await deleteAdsImage(
            dataUserAds.imageUrl.split("ads%2F")[1].split("?alt=")[0],
        );

        if (resultDeleteImage) {
            const resultDeleteAds = await deleteAds(dataUserAds.id);

            if (resultDeleteAds) {
                Toast.show({
                    type: "success",
                    text1: "Publicidade excluída com sucesso!",
                });

                actionReload(!reload);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível excluir a publicidade!",
                    text2: "Tente novamente em instantes!",
                });
            }
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível excluir a imagem!",
                text2: "Tente novamente em instantes!",
            });
        }

        setIsLoadinRemove(false);
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
            <ActionButtonFull
                onPress={() => {
                    setAlertData({
                        text: "Deseja remover esta publicidade?",
                        buttonText: "Remover",
                        action: handleDeleteAds,
                    });

                    setDialogVisible(true);
                }}
            >
                {!isLoadingRemove ? (
                    <TextActionButton>Remover Publicidade</TextActionButton>
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
        </ContentCardAds>
    );
};
