// TODO: tela sem navegação de entrada, confirmar com Pedro se ainda é necessária
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { getUsersByCpfList } from "../../../controllers/DrawPrizes/live";

import lottieLoadingDrawPrize from "../../../assets/lotties/lottieLoadingDrawPrize.json";
import lottieWinDrawPrize from "../../../assets/lotties/lottieWinDrawPrize.json";
import lottieContinousWinDrawPrize from "../../../assets/lotties/lottieContinousWinDrawPrize.json";

import {
    CardUser,
    Container,
    ContainerCards,
    Content,
    ContentCards,
    SaveDrawPrize,
    TextButton,
    Title,
    Header,
    UserNameTitle,
    PhoneTitle,
} from "./styles";

export const DrawPrizeNewWinnerResult = ({ route, navigation }) => {
    const { usersWinner } = route.params

    const [showResult, setShowResult] = useState(false)
    const [justifyContent, setJustifyContent] = useState("center")
    const [winnersWithData, setWinnersWithData] = useState([])
    const [loadingWinners, setLoadingWinners] = useState(false)
    const [animationStatus, setAnimationStatus] = useState({
        key: "loading",
        width: 350,
        height: 350,
        loop: false,
        duration: 0.4,
        animation: lottieLoadingDrawPrize,
    })

    const animation = useRef(null)

    useEffect(() => {
        setTimeout(() => {
            setAnimationStatus({
                key: "win",
                width: 500,
                height: 500,
                loop: false,
                duration: 0.7,
                animation: lottieWinDrawPrize,
            })

            setShowResult(true)
            loadWinnersData()

            setTimeout(() => {
                setJustifyContent("flex-start")
                setAnimationStatus({
                    key: "continuous",
                    width: 500,
                    height: 500,
                    loop: true,
                    duration: 1,
                    animation: lottieContinousWinDrawPrize,
                })
            }, 2500)
        }, 7000)
    }, [])

    const loadWinnersData = async () => {
        setLoadingWinners(true)
        try {
            const cpfList = usersWinner.map(u => u.cpf)

            const response = await getUsersByCpfList(cpfList)
            const users = response.error ? [] : response.data

            const merged = usersWinner.map(winner => {
                const found = users.find(u => u.cpf === winner.cpf)
                return {
                    ...winner,
                    name: found?.name || "Nome não encontrado",
                    email: found?.email || winner.cpf,
                }
            })

            setWinnersWithData(merged)
        } catch (error) {
            console.log("Erro ao buscar dados dos ganhadores:", error)
        } finally {
            setLoadingWinners(false)
        }
    }

    return (
        <Container>
            <Content justifyContent={justifyContent}>
                <LottieView
                    key={animationStatus.key}
                    autoPlay
                    ref={animation}
                    style={{
                        width: animationStatus.width,
                        height: animationStatus.height,
                    }}
                    loop={animationStatus.loop || false}
                    speed={animationStatus.duration}
                    source={animationStatus.animation}
                />
            </Content>

            {showResult && (
                <>
                    <Header>
                        <Title>Vencedores do Sorteio</Title>
                    </Header>

                    <ContainerCards>
                        <ContentCards>
                            {loadingWinners ? (
                                <ActivityIndicator animating color="white" />
                            ) : (
                                winnersWithData.map((user, index) => (
                                    <CardUser key={`${user.cpf}-${index}`}>
                                        <UserNameTitle>{user.name}</UserNameTitle>
                                        <PhoneTitle>CPF: {user.cpf}</PhoneTitle>
                                        <PhoneTitle>
                                            {user.userType === "productor" ? "Produtor" : "Cliente"}
                                        </PhoneTitle>
                                    </CardUser>
                                ))
                            )}
                        </ContentCards>
                    </ContainerCards>

                    <SaveDrawPrize onPress={() => navigation.goBack()} changeColor>
                        <TextButton>Voltar</TextButton>
                    </SaveDrawPrize>
                </>
            )}
        </Container>
    )
}