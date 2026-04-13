/* eslint-disable operator-linebreak */

import { useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import { useDispatch } from "react-redux";

import { getConfigData } from "../../controllers/Config/find";

import { DialogComponent } from "../Dialog";

import { Container } from "./styles";
import { ConfigDataActions } from "./actions";

const sanitizeVersion = (value) => `${value ?? ""}`.trim();

const isNumericVersion = (value) => /^[0-9]+(\.[0-9]+)*$/.test(value);

const compareDotVersions = (remote, local) => {
    const remoteParts = remote.split(".").map((item) => Number(item));
    const localParts = local.split(".").map((item) => Number(item));
    const maxLength = Math.max(remoteParts.length, localParts.length);

    for (let index = 0; index < maxLength; index += 1) {
        const remoteValue = remoteParts[index] ?? 0;
        const localValue = localParts[index] ?? 0;

        if (remoteValue > localValue) return 1;
        if (remoteValue < localValue) return -1;
    }

    return 0;
};

const shouldForceUpdate = ({ remoteVersion, appVersion, buildVersion }) => {
    const remote = sanitizeVersion(remoteVersion);
    const app = sanitizeVersion(appVersion);
    const build = sanitizeVersion(buildVersion);

    if (!remote) return false;
    if (remote === app || remote === build) return false;

    const remoteIsNumeric = isNumericVersion(remote);
    const appIsNumeric = isNumericVersion(app);
    const buildIsNumeric = isNumericVersion(build);

    if (remoteIsNumeric && buildIsNumeric && !remote.includes(".")) {
        return Number(remote) > Number(build);
    }

    if (remoteIsNumeric && appIsNumeric) {
        return compareDotVersions(remote, app) > 0;
    }

    return false;
};

export const AlertNewVersion = () => {
    const dispatch = useDispatch();

    const [dialogVersionVisible, setDialogVersionVisible] = useState(false);
    const [dialogNotificationVisible, setDialogNotificationVisible] =
        useState(false);
    const [dialogNotificationMessage, setDialogNotificationMessage] =
        useState("");
    const [urls, setUrls] = useState({ android: "", ios: "" });

    useEffect(() => {
        const getConfig = async () => {
            console.log(process.env.STATUS_PROJECT);
            if (process.env.STATUS_PROJECT === "production") {
                const resultConfig = await getConfigData();

                if (!resultConfig.error) {
                    setUrls({
                        android: resultConfig.data.androidUri,
                        ios: resultConfig.data.iosUri,
                    });

                    dispatch({
                        type: ConfigDataActions.SET_CONFIG_DATA_ACTION,
                        configData: resultConfig.data,
                    });

                    if (
                        shouldForceUpdate({
                            remoteVersion: resultConfig.data.versionNumber,
                            appVersion: nativeApplicationVersion,
                            buildVersion: nativeBuildVersion,
                        })
                    ) {
                        setDialogVersionVisible(true);
                    }

                    if (resultConfig.data.notificationAlertMessage !== "") {
                        setDialogNotificationVisible(true);
                        setDialogNotificationMessage(
                            resultConfig.data.notificationAlertMessage,
                        );
                    }
                }
            }
        };

        getConfig();
    }, []);

    const handleRedirectUpdateApp = () => {
        const platform = Platform.OS;

        switch (platform) {
            case "android":
                Linking.openURL(urls.android);
                setDialogVersionVisible(false);
                break;

            case "ios":
                Linking.openURL(urls.ios);
                setDialogVersionVisible(false);
                break;

            default:
                Toast.show({
                    type: "error",
                    text1: "Plataforma inválida para atualização!",
                });
                break;
        }
    };

    return (
        <Container>
            <DialogComponent
                visible={dialogVersionVisible && !dialogNotificationVisible}
                title="Nova versão disponível!"
                text="Atualize a Quero Camarão e não perca nenhuma novidade!"
                textActionButton="Atualizar"
                actionButton={() => handleRedirectUpdateApp()}
                textSecondaryActionButton="Continuar"
                secondaryActionButton={() => setDialogVersionVisible(false)}
                dismissable={false}
                inverterActionsButtons
            />
            <DialogComponent
                visible={dialogNotificationVisible}
                title="Atenção!"
                text={dialogNotificationMessage}
                textActionButton="OK"
                actionButton={() => setDialogNotificationVisible(false)}
                dismissable={false}
                showCancelButton={false}
            />
        </Container>
    );
};
