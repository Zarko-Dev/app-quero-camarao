/* eslint-disable indent */
import { FontAwesome } from "@expo/vector-icons";
import { FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { v4 } from "uuid";
import { ActivityIndicator } from "react-native-paper";

import { getPublicationViewLogsById } from "../../controllers/Publication/getPublicationViewsLogs";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";
import { convertDate } from "../../utils/convertDate";
import { dataRoutes } from "../../routes/dataRoutes";
import { redirectWhatsappLink } from "../../utils/redirectFunctions";

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

const RenderItem = ({ dataUser, navigation }) => {
    const handleRedirectWhatsApp = () => {
        navigation.navigate(dataRoutes.redirect, {
            subtext:
                "Estamos lhe redirecionado ao whatsapp do cliente que selecionou",
            actionRediret: redirectWhatsappLink(
                `+55${dataUser.userPhone.replace(/[^0-9]/g, "")}`,
                "Olá, vi que você clicou na minha publicação de camarão pela Quero Camarão, você tem interesse em negociar?",
                navigation,
            ),
        });
    };

    return (
        <CardUser style={BoxShadowIos} onPress={handleRedirectWhatsApp}>
            <ContentUserImageInfo>
                <UserImage
                    source={{
                        uri: dataUser?.userImage
                            ? dataUser.userImage
                            : `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=${
                                  dataUser.userName.split(" ")[0]
                              }`,
                    }}
                />
                <ContentInfo>
                    <Title>{dataUser.userName}</Title>
                    <Subtitle>
                        {convertDate(
                            convertSecondsToDate(dataUser.createdAt.seconds),
                        )}
                    </Subtitle>
                </ContentInfo>
            </ContentUserImageInfo>
            <WhatsAppIcon>
                <FontAwesome name="whatsapp" size={28} color="white" />
            </WhatsAppIcon>
        </CardUser>
    );
};

export const PublicationViewLogs = ({ route, navigation }) => {
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
                    views: result.views
                        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
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
                        <RenderItem dataUser={item} navigation={navigation} />
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
