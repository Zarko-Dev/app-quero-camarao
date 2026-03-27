import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../../services/Firebase";

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
import { dataRoutes } from "../../../routes/dataRoutes";

export const DrawPrizeNewWinnerResult = ({ route, navigation }) => {
    const { usersWinner } = route.params

    const [showResult, setShowResult] = useState(false)
    const [justifyContent, setJustifyContent] = useState("center")
    const [winnersWithData, setWinnersWithData] = useState([])
    const [loadingWinners, setLoadingWinners] = useState(false)
    const [animationStatus, setAnimationStatus] = useState({
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

            const q = query(
                collection(firestore, "users"),
                where("cpf", "in", cpfList)
            )

            const snapshot = await getDocs(q)
            const users = snapshot.docs.map(doc => doc.data())

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