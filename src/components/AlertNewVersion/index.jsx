/* eslint-disable operator-linebreak */

import { useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { nativeApplicationVersion } from "expo-application";
import { useDispatch } from "react-redux";

import { getConfigData } from "../../controllers/Config/find";

import { DialogComponent } from "../Dialog";

import { Container } from "./styles";
import { ConfigDataActions } from "./actions";

export const AlertNewVersion = () => {
    const dispatch = useDispatch();

    const [dialogVersionVisible, setDialogVersionVisible] = useState(false);
    const [dialogNotificationVisible, setDialogNotificationVisible] =
        useState(false);
    const [dialogNotificationMessage, setDialogNotificationMessage] =
        useState("");
    const [urls, setUrls] = useState({ android: "", ios: "" });

    const normalizeVersion = (value) =>
        String(value ?? "")
            .trim()
            .replace(/^v/i, "")
            .replace(/[^0-9.]/g, "");

    const isRemoteVersionNewer = (remoteVersion, localVersion) => {
        const remote = normalizeVersion(remoteVersion)
            .split(".")
            .map((part) => Number(part || 0));
        const local = normalizeVersion(localVersion)
            .split(".")
            .map((part) => Number(part || 0));

        const size = Math.max(remote.length, local.length);

        for (let index = 0; index < size; index++) {
            const remoteValue = Number.isFinite(remote[index])
                ? remote[index]
                : 0;
            const localValue = Number.isFinite(local[index]) ? local[index] : 0;

            if (remoteValue > localValue) {
                return true;
            }

            if (remoteValue < localValue) {
                return false;
            }
        }

        return false;
    };

    useEffect(() => {
        const getConfig = async () => {
            try {
                if (process.env.STATUS_PROJECT !== "production") {
                    return;
                }

                const resultConfig = await getConfigData();

                if (resultConfig.error || !resultConfig.data) {
                    return;
                }

                setUrls({
                    android: resultConfig.data.androidUri ?? "",
                    ios: resultConfig.data.iosUri ?? "",
                });

                dispatch({
                    type: ConfigDataActions.SET_CONFIG_DATA_ACTION,
                    configData: resultConfig.data,
                });

                if (
                    isRemoteVersionNewer(
                        resultConfig.data.versionNumber,
                        nativeApplicationVersion,
                    )
                ) {
                    setDialogVersionVisible(true);
                }

                if (resultConfig.data.notificationAlertMessage) {
                    setDialogNotificationVisible(true);
                    setDialogNotificationMessage(
                        resultConfig.data.notificationAlertMessage,
                    );
                }
            } catch (error) {
                console.error(
                    "Erro ao buscar configuracoes de inicializacao:",
                    error,
                );
            }
        };

        getConfig();
    }, [dispatch]);

    const handleRedirectUpdateApp = () => {
        const platform = Platform.OS;

        switch (platform) {
            case "android":
                if (urls.android) {
                    Linking.openURL(urls.android);
                }
                setDialogVersionVisible(false);
                break;

            case "ios":
                if (urls.ios) {
                    Linking.openURL(urls.ios);
                }
                setDialogVersionVisible(false);
                break;

            default:
                Toast.show({
                    type: "error",
                    text1: "Plataforma invalida para atualizacao!",
                });
                break;
        }
    };

    return (
        <Container>
            <DialogComponent
                visible={dialogVersionVisible && !dialogNotificationVisible}
                title="Nova versao disponivel!"
                text="Atualize a Quero Camarao e nao perca nenhuma novidade!"
                textActionButton="Atualizar"
                actionButton={() => handleRedirectUpdateApp()}
                textSecondaryActionButton="Continuar"
                secondaryActionButton={() => setDialogVersionVisible(false)}
                dismissable={false}
                inverterActionsButtons
            />
            <DialogComponent
                visible={dialogNotificationVisible}
                title="Atencao!"
                text={dialogNotificationMessage}
                textActionButton="OK"
                actionButton={() => setDialogNotificationVisible(false)}
                dismissable={false}
                showCancelButton={false}
            />
        </Container>
    );
};
