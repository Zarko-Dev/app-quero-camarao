import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

import { dataRoutes } from "../../routes/dataRoutes";
import { InvitationActions } from "./actions";

import lottieTicket from "../../assets/lotties/lottieTicket.json";

import {
    Alert,
    AlertText,
    ButtonRegister,
    Container,
    ContentAlert,
    ContentInfo,
    TextButton,
    Title,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

export const ValidateInvitation = ({ navigation, route }) => {
    const animation = useRef(null);
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.login);

    const [animationData, setAnimationData] = useState();

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                setAnimationData({
                    animation: null,
                    icon: (
                        <FontAwesome
                            name="info-circle"
                            size={20}
                            color="#3c3c3c"
                        />
                    ),
                    text: "Você já faz parte da Quero Camarão",
                    color: "#ffe900",
                    textColor: "#3c3c3c",
                });

                setTimeout(() => {
                    navigation.navigate(dataRoutes.navigation);
                }, 6000);
            } else {
                setAnimationData({
                    animation: null,
                    icon: (
                        <FontAwesome
                            name="check-circle"
                            size={20}
                            color="white"
                        />
                    ),
                    text: "Convite Validado",
                    color: "#4BB543",
                    textColor: "#FFF",
                });
            }
        }, []),
    );

    const handleRedirectRegister = () => {
        dispatch({
            type: InvitationActions.SET_INVITATION_CODE_ACTION,
            invitationCode: route.params.convite,
        });

        navigation.navigate(dataRoutes.register);
    };

    const handleRedirectHome = () => {
        dispatch({
            type: InvitationActions.SET_INVITATION_CODE_ACTION,
            invitationCode: route.params.convite,
        });

        navigation.navigate(dataRoutes.navigation);
    };

    return (
        <Container>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 350,
                    height: 350,
                }}
                source={lottieTicket}
            />
            <ContentAlert style={BoxShadowIos} color={animationData?.color}>
                {animationData?.icon}
                <AlertText color={animationData?.textColor}>
                    {animationData?.text}
                </AlertText>
            </ContentAlert>
            {isAuthenticated ? (
                <Text>Você será redirecionado(a) para a tela principal!</Text>
            ) : (
                <ContentInfo>
                    <Title>
                        Falta pouco para você consguir seus créditos por
                        indicação, cadastre-se agora...
                    </Title>
                    <ButtonRegister
                        style={BoxShadowIos}
                        onPress={handleRedirectRegister}
                    >
                        <TextButton>Cadastrar-se</TextButton>
                    </ButtonRegister>
                    <Title>ou conheça nosso app e cadastre-se!</Title>
                    <ButtonRegister
                        black
                        style={BoxShadowIos}
                        onPress={handleRedirectHome}
                    >
                        <TextButton>Conhecer a Quero Camarão</TextButton>
                    </ButtonRegister>
                    <Alert>
                        Atenção: O convite só é valido para novos usuários, caso
                        você entre com um usuário existente ou feche o
                        aplicativo, seu convite será perdido!
                    </Alert>
                </ContentInfo>
            )}
        </Container>
    );
};
