import { Fragment, memo } from "react";
import { useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import {
    Container,
    ContentCardInfo,
    ContentImageShrimp,
    ContentShrimpInfo,
    Divider,
    EditButton,
    ImageComponentStyle,
    TitleButton,
    TitleShrimpInfo,
    SubTitleShrimpInfo,
} from "./styles";

export const ShrimpCard = memo(() => {
    const navigation = useNavigation();

    const { dataPayment } = useSelector((state) => state.publication);

    const handleGoBackEditPondShrimp = () => {
        navigation.goBack();
    };

    return (
        <Container>
            {(dataPayment?.dataPonds ?? []).map((item) => (
                <Fragment key={item.id}>
                    <ContentCardInfo>
                        <ContentImageShrimp>
                            <ImageComponentStyle uri={item.imageShrimpUri} />
                        </ContentImageShrimp>
                        <ContentShrimpInfo>
                            <TitleShrimpInfo>{`Camarão de ${item.grammage}g`}</TitleShrimpInfo>
                            <SubTitleShrimpInfo>{`Quantidade de ${item.kilo}kg`}</SubTitleShrimpInfo>
                        </ContentShrimpInfo>
                    </ContentCardInfo>
                    <Divider />
                </Fragment>
            ))}
            <EditButton onPress={handleGoBackEditPondShrimp} activeOpacity={0.8}>
                <TitleButton>
                    <Feather name="edit" size={18} color="white" style={{ marginRight: 8 }} /> Alterar Camarões
                </TitleButton>
            </EditButton>
        </Container>
    );
});
