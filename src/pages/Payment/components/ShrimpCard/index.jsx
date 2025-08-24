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
} from "./styles";

export const ShrimpCard = memo(() => {
    const navigation = useNavigation();

    const { dataPayment } = useSelector((state) => state.publication);

    const handleGoBackEditPondShrimp = () => {
        navigation.goBack();
    };

    return (
        <Container>
            {dataPayment.dataPonds.map((item) => (
                <Fragment key={item.id}>
                    <ContentCardInfo>
                        <ContentImageShrimp>
                            <ImageComponentStyle uri={item.imageShrimpUri} />
                        </ContentImageShrimp>
                        <ContentShrimpInfo>
                            <TitleShrimpInfo>{`Camarão de ${item.grammage}g`}</TitleShrimpInfo>
                            <TitleShrimpInfo>{`Quantidade de ${item.kilo}kg`}</TitleShrimpInfo>
                        </ContentShrimpInfo>
                    </ContentCardInfo>
                    <Divider />
                </Fragment>
            ))}
            <EditButton onPress={handleGoBackEditPondShrimp}>
                <TitleButton>
                    <Feather name="edit" size={20} color="white" /> Alterar
                    Camarões
                </TitleButton>
            </EditButton>
        </Container>
    );
});
