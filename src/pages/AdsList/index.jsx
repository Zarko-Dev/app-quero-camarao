/* eslint-disable no-case-declarations */
import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react-native";
import { FlatList, Linking } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { getAllPublishAdsApproved } from "../../controllers/PublishAds/getPublishAds";
import { redirectWhatsappLink } from "../../utils/redirectFunctions";
import { formatphone } from "../../utils/formatPhone";
import { dataRoutes } from "../../routes/dataRoutes";

import { Container, ContainerItem, ImageAdvertising } from "./styles";
import { CardSignatureListSkeleton } from "../../components/Skeleton/CardSignatureListSkeleton";
import { shuffleArray } from "../../utils/shuffleArray";

const RenderItem = ({ item }) => {
    const navigation = useNavigation();

    const handleRedirectAdvertising = async () => {
        switch (item.dataRedirect.type) {
            case "whatsapp":
                const whatsappMessage = `Olá, venho através do aplicativo *Quero Camarão* 🦐

Gostaria de saber mais a respeito de seus serviços!`;

                navigation.navigate(dataRoutes.redirect, {
                    subtext:
                        "Estamos lhe redirecionado ao whatsapp do patrocinador!",
                    actionRediret: redirectWhatsappLink(
                        `+55${formatphone(item.dataRedirect.value)}`,
                        whatsappMessage,
                        navigation,
                    ),
                });

                break;

            default:
                try {
                    Linking.openURL(item.dataRedirect.value).then().catch();
                } catch (error) {
                    Sentry.captureException(error);

                    Toast.show({
                        type: "error",
                        text1: "Tipo de publicidade inválida",
                    });
                }

                break;
        }
    };

    return (
        <ContainerItem onPress={handleRedirectAdvertising}>
            {item.type === "video" ? (
                <Video
                    source={{
                        uri: item.imageUrl,
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay
                    isMuted
                />
            ) : (
                <ImageAdvertising
                    source={{ uri: item.imageUrl }}
                    resizeMode="contain"
                />
            )}
        </ContainerItem>
    );
};

export const AdsList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [adsList, setAdsList] = useState([]);

    useEffect(() => {
        const getList = async () => {
            setIsLoading(true);

            const data = await getAllPublishAdsApproved();

            if (!data.error) {
                setAdsList(shuffleArray(data.data));
            }

            setIsLoading(false);
        };

        getList();
    }, []);

    return isLoading ? (
        <>
            <CardSignatureListSkeleton />
            <CardSignatureListSkeleton />
            <CardSignatureListSkeleton />
            <CardSignatureListSkeleton />
            <CardSignatureListSkeleton />
        </>
    ) : (
        <Container>
            <FlatList
                data={adsList}
                renderItem={({ item }) => <RenderItem item={item} />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
            />
        </Container>
    );
};
