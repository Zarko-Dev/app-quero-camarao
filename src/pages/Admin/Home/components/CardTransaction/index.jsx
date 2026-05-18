/* eslint-disable react/no-array-index-key */
import { useNavigation } from "@react-navigation/native";

import { dataRoutes } from "../../../../../routes/dataRoutes";
import { convertDate } from "../../../../../utils/convertDate";
import { convertToMoney } from "../../../../../utils/convertToMoney";

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
    TitlePayValue,
    TitleTagPond,
} from "./styles";
import { BoxShadowIos } from "../../../../../styles/IosShadow";

import ShrimpIcon from "../../../../../assets/images/shrimpIcon.png";
import { formatKilo } from "../../../../../utils/formatKilo";

const CardTransaction = ({ item }) => {
    const navigation = useNavigation();

    const handleRedirectDetailTransactionPayment = () => {
        navigation.navigate(dataRoutes.admin.detailsTransactionPayment, {
            dataTransaction: item,
        });
    };

    return (
        <Container
            style={BoxShadowIos}
            onPress={handleRedirectDetailTransactionPayment}
        >
            <Content>
                <ContentInfo>
                    <ImageItem source={ShrimpIcon} />
                    <ContentTextInfo>
                        <InfoTitle>Publicação de Camarão</InfoTitle>
                        <InfoSubtitle>
                            {item?.user?.name || "-"} {item?.user?.surname || ""}
                        </InfoSubtitle>
                        <InfoSubtitle>{convertDate(item?.createdAt)}</InfoSubtitle>
                    </ContentTextInfo>
                </ContentInfo>
                <TitlePayValue>R$ {convertToMoney(Number(item?.paymentValue || 0))}</TitlePayValue>
            </Content>
            <ContentPonds>
                {(item?.dataPublication?.shrimps || []).map((shrimp, index) => (
                    <TagPonds key={index}>
                        <TitleTagPond>
                            {shrimp.grammage}g / {formatKilo(shrimp.kilo)}kg
                        </TitleTagPond>
                    </TagPonds>
                ))}
            </ContentPonds>
        </Container>
    );
};

export default CardTransaction;
