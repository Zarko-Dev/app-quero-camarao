/* eslint-disable no-case-declarations */

import { useState } from "react";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { Video, ResizeMode } from "expo-av";

import { dataRoutes } from "../../../../routes/dataRoutes";
import {
    deleteAds,
    deleteAdsImage,
} from "../../../../controllers/PublishAds/delete";

import { DialogComponent } from "../../../../components/Dialog";
import { claculateTimer } from "../../../DiscountCupons/components/TimerCardCupom/controller/calculateTimer";

import {
    ActionButton,
    AlertText,
    ContentActionsButton,
    ContentAlert,
    ContentCardAds,
    ContentImage,
    ContentStatus,
    ContentTagTimeExpiresText,
    TagStatus,
    TextActionButton,
    TextDecreaseTime,
    TextTagStatus,
} from "./styles";
import { BoxShadowIos } from "../../../../styles/IosShadow";
import { theme } from "../../../../styles/Theme";

export const CardAds = ({ dataUserAds, reload, actionReload }) => {
    const navigation = useNavigation();

    const [isLoadingDelete, setIsLoadinDelete] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const getAdsStatus = () => {
        switch (dataUserAds?.status) {
            case "wating":
                return (
                    <TagStatus color={theme.colors.yellow}>
                        <TextTagStatus>Em análise</TextTagStatus>
                    </TagStatus>
                );

            case "adjust":
                return (
                    <TagStatus color={theme.colors.text}>
                        <TextTagStatus>Ajustar/Corrigir</TextTagStatus>
                    </TagStatus>
                );

            case "approved":
                const date = new Date(dataUserAds?.createdAt);
                date.setDate(date.getDate() + 7);

                return (
                    <>
                        <TagStatus color={theme.colors.green}>
                            <TextTagStatus>Aprovado</TextTagStatus>
                        </TagStatus>
                        <TagStatus color={theme.colors.text}>
                            <ContentTagTimeExpiresText>
                                <TextTagStatus>Expira em:</TextTagStatus>
                                <TextDecreaseTime>
                                    {claculateTimer(date)}
                                </TextDecreaseTime>
                            </ContentTagTimeExpiresText>
                        </TagStatus>
                    </>
                );

            case "reproved":
                return (
                    <TagStatus color={theme.colors.red}>
                        <TextTagStatus>Reprovado</TextTagStatus>
                    </TagStatus>
                );

            default:
                return (
                    <TagStatus color={theme.colors.yellow}>
                        <TextTagStatus>Em análise</TextTagStatus>
                    </TagStatus>
                );
        }
    };

    const getEnebleButtons = () => {
        switch (dataUserAds?.status) {
            case "wating":
                return {
                    edit: true,
                    delete: true,
                };

            case "adjust":
                return {
                    edit: false,
                    delete: false,
                };

            case "approved":
                return {
                    edit: true,
                    delete: false,
                };

            case "reproved":
                return {
                    edit: true,
                    delete: false,
                };

            default:
                return {
                    edit: true,
                    delete: false,
                };
        }
    };

    const handleEditAds = () => {
        navigation.navigate(dataRoutes.registerMyAds, { dataAds: dataUserAds });
    };

    const handleDeleteAds = async () => {
        setDialogVisible(false);
        setIsLoadinDelete(true);

        const resultDeleteImage = await deleteAdsImage(
            dataUserAds.imageUrl.split("ads%2F")[1].split("?alt=")[0],
        );

        if (resultDeleteImage) {
            const resultDeleteAds = await deleteAds(dataUserAds.id);

            if (resultDeleteAds) {
                Toast.show({
                    type: "success",
                    text1: "Publicidade escluída com sucesso!",
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

        setIsLoadinDelete(false);
    };

    return (
        <ContentCardAds style={BoxShadowIos}>
            <ContentImage>
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
            <ContentStatus>{getAdsStatus()}</ContentStatus>
            {dataUserAds?.alert !== null && (
                <ContentAlert>
                    <AlertText>{dataUserAds?.alert}</AlertText>
                </ContentAlert>
            )}
            <ContentActionsButton>
                <ActionButton
                    disabled={getEnebleButtons().edit}
                    onPress={handleEditAds}
                >
                    <TextActionButton>Editar</TextActionButton>
                </ActionButton>
                <ActionButton
                    black
                    disabled={getEnebleButtons().delete}
                    onPress={() => setDialogVisible(true)}
                >
                    {!isLoadingDelete ? (
                        <TextActionButton>Excluir</TextActionButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ActionButton>
            </ContentActionsButton>
            <DialogComponent
                visible={dialogVisible}
                title="Atenção"
                text="Deseja realmente excluir esta publicidade?"
                textActionButton="Excluir"
                hideDialog={() => setDialogVisible(false)}
                actionButton={() => handleDeleteAds()}
                dismissable={false}
            />
        </ContentCardAds>
    );
};
