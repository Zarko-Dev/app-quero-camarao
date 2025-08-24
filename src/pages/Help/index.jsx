/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
import LottieView from "lottie-react-native";
import { useRef } from "react";
import { FontAwesome } from "@expo/vector-icons";

import lottieContact from "../../assets/lotties/lottieContact.json";
import { dataRoutes } from "../../routes/dataRoutes";
import { redirectWhatsappLink } from "../../utils/redirectFunctions";

import { Container, TextWhatsapp, Title, WhatsappButton } from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

export const Help = ({ navigation }) => {
    const animation = useRef(null);

    const handleRedirectPage = async () => {
        const whatsappMessage =
            "Olá, gostaria de obter ajuda a respeito da *Quero Camarão* 🦐";

        navigation.navigate(dataRoutes.redirect, {
            subtext:
                "Estamos lhe redirecionado ao whatsapp do canal de ajuda da Quero Camarão!",
            actionRediret: redirectWhatsappLink(
                "+5585992265252",
                whatsappMessage,
                navigation,
                () => {
                    navigation.navigate(dataRoutes.help);
                },
            ),
        });
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
                source={lottieContact}
            />

            <Title>Boas vindas a central de ajuda da Quero Camarão!</Title>

            <WhatsappButton style={BoxShadowIos} onPress={handleRedirectPage}>
                <FontAwesome name="whatsapp" size={24} color="white" />
                <TextWhatsapp>WhatsApp Quero Camarão</TextWhatsapp>
            </WhatsappButton>
        </Container>
    );
};
