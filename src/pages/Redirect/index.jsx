import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import originalLogo from "../../assets/images/originalLogo.png";

import {
    ActivityIndicatorStyle,
    Container,
    ImageLogo,
    Subtext,
    Title,
} from "./styles";

export const Redirect = ({ route }) => {
    const { subtext, actionRediret = () => {} } = route.params;

    useFocusEffect(
        useCallback(() => {
            actionRediret();
        }, []),
    );

    return (
        <Container>
            <ImageLogo source={originalLogo} />
            <Title>Você está saindo do Quero Camarão</Title>
            <Subtext>{subtext}</Subtext>
            <ActivityIndicatorStyle animating size={30} />
        </Container>
    );
};
