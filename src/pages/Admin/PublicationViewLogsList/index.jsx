/* eslint-disable react/no-array-index-key */
import { useState } from "react";
import { FlatList } from "react-native";

import { convertDate } from "../../../utils/convertDate";
import { formatKilo } from "../../../utils/formatKilo";

import { ModalChart } from "./components/ModalChart";

import {
    ActionButton,
    Container,
    Content,
    ContentActionButtons,
    ContentInfo,
    ContentPonds,
    ContentTextInfo,
    ImageItem,
    InfoSubtitle,
    InfoTitle,
    TagPonds,
    TitleActionButton,
    TitleTagPond,
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";

import ShrimpIcon from "../../../assets/images/shrimpIcon.png";
import { theme } from "../../../styles/Theme";
import { dataRoutes } from "../../../routes/dataRoutes";

export const PublicationViewLogsList = ({ route, navigation }) => {
    const { dataViewLogsList } = route.params;

    const [showModalChart, setShowModalChart] = useState(false);
    const [viewLogs, setViewLogs] = useState([]);

    const hadleShowChartModal = (logViews) => {
        setShowModalChart(true);
        setViewLogs(logViews);
    };

    const getShrimpImage = (shrimps) => {
        let uri;

        shrimps.map((shrimp) => {
            if (!uri && shrimp.imageShrimpUri !== null) {
                uri = shrimp.imageShrimpUri;
            }

            return null;
        });

        return uri ? { uri } : ShrimpIcon;
    };

    const handleRedirectListUsers = (dataViewLogs) => {
        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: dataViewLogs.map((item) => ({
                email: item.userId,
                name: item.user,
                userImage: item.userImage,
                createdAt: item.createdAt,
                contact: item.userPhone,
                noDetail: true,
            })),
        });
    };

    return (
        <Container>
            <FlatList
                data={dataViewLogsList}
                renderItem={({ item }) => (
                    <Content style={BoxShadowIos}>
                        <ContentInfo>
                            <ImageItem source={getShrimpImage(item.shrimps)} />
                            <ContentTextInfo>
                                <InfoTitle>{item.userId}</InfoTitle>
                                <InfoSubtitle>{item.location}</InfoSubtitle>
                                <InfoSubtitle>
                                    {convertDate(item.createdAt)}
                                </InfoSubtitle>
                            </ContentTextInfo>
                        </ContentInfo>
                        <ContentPonds>
                            {item.shrimps.map((shrimp, index) => (
                                <TagPonds key={index}>
                                    <TitleTagPond>
                                        {shrimp.grammage}g /{" "}
                                        {formatKilo(shrimp.kilo)}kg
                                    </TitleTagPond>
                                </TagPonds>
                            ))}
                        </ContentPonds>
                        <ContentActionButtons>
                            <ActionButton
                                color={theme.colors.primary}
                                onPress={() =>
                                    hadleShowChartModal(item.logViews)
                                }
                            >
                                <TitleActionButton>Gráfico</TitleActionButton>
                            </ActionButton>
                            <ActionButton
                                color={theme.colors.black}
                                onPress={() =>
                                    handleRedirectListUsers(item.logViews)
                                }
                            >
                                <TitleActionButton>
                                    Visualizações
                                </TitleActionButton>
                            </ActionButton>
                        </ContentActionButtons>
                    </Content>
                )}
                keyExtractor={(item) => item.id}
            />
            <ModalChart
                isVisible={showModalChart}
                onClose={() => setShowModalChart(false)}
                viewLogs={viewLogs}
            />
        </Container>
    );
};
