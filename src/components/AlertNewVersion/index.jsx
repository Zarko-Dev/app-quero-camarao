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
                        `${resultConfig.data.versionNumber}` !==
                        `${nativeApplicationVersion}`
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
