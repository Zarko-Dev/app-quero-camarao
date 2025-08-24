/* eslint-disable react/no-array-index-key */
import { FlatList } from "react-native";

import {
    Container,
    Content,
    ContentInfo,
    ContentPonds,
    ContentTextInfo,
    ImageItem,
    InfoSubtitle,
    InfoTitle,
    TagPonds,
    TitleTagPond,
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";

import ShrimpIcon from "../../../assets/images/shrimpIcon.png";
import { convertDate } from "../../../utils/convertDate";
import { formatKilo } from "../../../utils/formatKilo";

export const UserPublications = ({ route }) => {
    const { dataShrimps } = route.params;

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

    return (
        <Container>
            <FlatList
                data={dataShrimps}
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
                    </Content>
                )}
                keyExtractor={(item) => item.id}
            />
        </Container>
    );
};
