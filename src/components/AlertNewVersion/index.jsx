/* eslint-disable operator-linebreak */

import { useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import { useDispatch } from "react-redux";

import { getConfigData } from "../../controllers/Config/find";
import { compareDotVersions, isBelowMinimumVersion } from "../../utils/versionCheck";

import { DialogComponent } from "../Dialog";

import { Container } from "./styles";
import { ConfigDataActions } from "./actions";

const sanitizeVersion = (value) => `${value ?? ""}`.trim();

const isNumericVersion = (value) => /^[0-9]+(\.[0-9]+)*$/.test(value);

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
    const [mandatoryUpdate, setMandatoryUpdate] = useState(false);
    const [urls, setUrls] = useState({ android: "", ios: "" });

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

                // Bloqueio só com forceUpdate === true no Firestore (config/APe8eG...)
                // e versão abaixo de minimumVersion; caso contrário é só aviso.
                const belowMinimum = isBelowMinimumVersion(
                    resultConfig.data.minimumVersion,
                    nativeApplicationVersion,
                );
                if (belowMinimum && resultConfig.data.forceUpdate === true) {
                    setMandatoryUpdate(true);
                    setDialogVersionVisible(true);
                } else if (
                    belowMinimum ||
                    shouldForceUpdate({
                        remoteVersion: resultConfig.data.versionNumber,
                        appVersion: nativeApplicationVersion,
                        buildVersion: nativeBuildVersion,
                    })
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
                    "Erro ao buscar configurações de inicialização:",
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
                if (!mandatoryUpdate) setDialogVersionVisible(false);
                break;

            case "ios":
                if (urls.ios) {
                    Linking.openURL(urls.ios);
                }
                if (!mandatoryUpdate) setDialogVersionVisible(false);
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
                title={mandatoryUpdate ? "Atualização necessária" : "Nova versão disponível!"}
                text={mandatoryUpdate
                    ? "Esta versão do Quero Camarão não é mais compatível. Atualize para continuar usando o app."
                    : "Atualize a Quero Camarão e não perca nenhuma novidade!"}
                textActionButton="Atualizar"
                actionButton={() => handleRedirectUpdateApp()}
                textSecondaryActionButton={mandatoryUpdate ? undefined : "Continuar"}
                secondaryActionButton={() => setDialogVersionVisible(false)}
                dismissable={false}
                showCancelButton={false}
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
