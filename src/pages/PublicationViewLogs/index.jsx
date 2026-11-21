/* eslint-disable indent */
import { FontAwesome } from "@expo/vector-icons";
import { FlatList, Linking } from "react-native";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { v4 } from "uuid";
import { ActivityIndicator } from "react-native-paper";

import { getPublicationViewLogsById } from "../../controllers/Publication/getPublicationViewsLogs";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";
import { convertDate } from "../../utils/convertDate";
import { buildWhatsAppAppUrl } from "../../utils/adminPublicationWhatsApp";

import {
    CardUser,
    Container,
    ContentInfo,
    ContentLoading,
    ContentUserImageInfo,
    Subtitle,
    Title,
    UserImage,
    WhatsAppIcon,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

const contactViewer = async (phone) => {
    const url = buildWhatsAppAppUrl(
        phone,
        "Olá, vi que você clicou na minha publicação de camarão pela Quero Camarão, você tem interesse em negociar?",
    );

    try {
        if (!url) throw new Error("sem telefone");
        await Linking.openURL(url);
    } catch {
        Toast.show({
            type: "error",
            text1: url ? "Não conseguimos abrir seu WhatsApp!" : "Telefone não disponível",
            text2: url ? "Verifique se o WhatsApp está instalado." : "Esta visualização não tem contato salvo.",
        });
    }
};

const RenderItem = ({ dataUser }) => (
        <CardUser
            style={BoxShadowIos}
            disabled={!dataUser?.userPhone}
            onPress={() => contactViewer(dataUser.userPhone)}
        >
            <ContentUserImageInfo>
                <UserImage
                    source={{
                        uri: dataUser?.userImage
                            ? dataUser.userImage
                            : `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=${
                                  (dataUser?.userName ?? "?").split(" ")[0]
                              }`,
                    }}
                />
                <ContentInfo>
                    <Title>{dataUser.userName}</Title>
                    <Subtitle>
                        {dataUser?.createdAt?.seconds
                            ? convertDate(
                                  convertSecondsToDate(dataUser.createdAt.seconds),
                              )
                            : ""}
                    </Subtitle>
                </ContentInfo>
            </ContentUserImageInfo>
            {dataUser?.userPhone ? (
                <WhatsAppIcon>
                    <FontAwesome name="whatsapp" size={28} color="white" />
                </WhatsAppIcon>
            ) : null}
        </CardUser>
);

export const PublicationViewLogs = ({ route }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataLogs, setDataLogs] = useState();

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                setIsLoading(true);

                const result = await getPublicationViewLogsById(
                    route.params.publicationViewId,
                );

                setDataLogs({
                    ...result,
                    views: (result?.views ?? [])
                        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
                        .map((item) => ({ ...item, id: v4() })),
                });

                setIsLoading(false);
            };

            getData();
        }, []),
    );

    return (
        <Container>
            {!isLoading ? (
                <FlatList
                    data={dataLogs?.views}
                    renderItem={({ item }) => (
                        <RenderItem dataUser={item} />
                    )}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <ContentLoading>
                    <ActivityIndicator animating color="black" size={80} />
                </ContentLoading>
            )}
        </Container>
    );
};
