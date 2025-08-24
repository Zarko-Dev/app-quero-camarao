/* eslint-disable object-curly-newline */
import React, { useRef } from "react";
import LottieView from "lottie-react-native";
import LottieNoInternet from "../../assets/lotties/lottieNoConnection.json";
import LottieFindConnection from "../../assets/lotties/lottieFindConnection.json";
import { Container, Header, Subtitle, Title } from "./styles";

export const InternetInfo = () => {
    const animation = useRef(null);

    return (
        <Container>
            <Header>
                <LottieView
                    autoPlay
                    speed={0.7}
                    ref={animation}
                    style={{
                        width: 100,
                        height: 100,
                    }}
                    source={LottieNoInternet}
                />
                <Title>Ops, conexão com a internet falhou!</Title>
            </Header>
            <LottieView
                autoPlay
                speed={0.7}
                ref={animation}
                style={{
                    width: 300,
                    height: 300,
                }}
                source={LottieFindConnection}
            />
            <Subtitle>Tentando reconectar... Por favor aguarde.</Subtitle>
        </Container>
    );
};
