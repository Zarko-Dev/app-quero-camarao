/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import { useTheme } from "styled-components";
import { getDrawPrizeLiveById } from "../../../controllers/DrawPrizes/live";
import { Linking } from "react-native";

import lottieLoadingDrawPrize from "../../../assets/lotties/lottieLoadingDrawPrize.json";
import lottieWinDrawPrize from "../../../assets/lotties/lottieWinDrawPrize.json";
import lottieContinousWinDrawPrize from "../../../assets/lotties/lottieContinousWinDrawPrize.json";

import {
    CardUser,
    Container,
    ContainerCards,
    Content,
    ContentCards,
    ContentShareUser,
    DrawPizeShare,
    Header,
    LocationTitle,
    PhoneTitle,
    SaveDrawPrize,
    TextButton,
    Title,
    UserImage,
    UserNameTitle,
} from "./styles";
import { dataRoutes } from "../../../routes/dataRoutes";
import { saveDrawPrize } from "../../../controllers/DrawPrizes/create";
import { DrawPrizeNameDialog } from "./components/DrawPrizeNameDialog";
import { deleteDrawPrize } from "../../../controllers/DrawPrizes/delete";
import { handleRedirectPage } from "./redirectPageWhatsapp";

export const DrawPrizeWinnersResult = ({ route, navigation }) => {
    const theme = useTheme();
    const { drawPrizeId, showOnlyResults, drawerPrizeLiveId, newWinnersCount } =
        route.params;
    const [usersWinner, setUsersWinner] = useState([]); // 👈 vira estado    

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [animationStatus, setAnimationStatus] = useState(
        showOnlyResults
            ? {
                  width: 500,
                  height: 500,
                  loop: true,
                  duration: 1,
                  animation: lottieContinousWinDrawPrize,
              }
            : {
                  width: 350,
                  height: 350,
                  loop: false,
                  duration: 0.4,
                  animation: lottieLoadingDrawPrize,
              },
    );
    const [justifyContent, setJustifyContent] = useState("center");
    const [showResult, setShowResult] = useState(false);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [drawPrizeTitle, setDrawPrizeTitle] = useState("");
    const [backAfterSave, setBackAfterSave] = useState(false);

    const animation = useRef(null);


useEffect(() => {
    const loadWinners = async () => {
        if (drawerPrizeLiveId) {
            const response = await getDrawPrizeLiveById(drawerPrizeLiveId);
            if (!response.error) {
                const allWinners = response.data.winners ?? [];
                if (newWinnersCount) {
                    setUsersWinner(allWinners.slice(-newWinnersCount));
                } else {
                    setUsersWinner(allWinners);
                }
            }
        } else {
            setUsersWinner(route.params.usersWinner ?? []); // 👈 usa os do histórico
        }
    };

    loadWinners();
}, [drawerPrizeLiveId]);

    useEffect(() => {
        if (showOnlyResults) {
            setShowResult(true);
            setJustifyContent("flex-start");
        } else {
            setTimeout(() => {
                setAnimationStatus({
                    width: 500,
                    height: 500,
                    loop: false,
                    duration: 0.7,
                    animation: lottieWinDrawPrize,
                });

                setShowResult(true);

                setTimeout(() => {
                    setJustifyContent("flex-start");

                    setAnimationStatus({
                        width: 500,
                        height: 500,
                        loop: true,
                        duration: 1,
                        animation: lottieContinousWinDrawPrize,
                    });
                }, 2500);
            }, 7000);
        }
    }, []);

    const handleRedirectUserDetailed = (dataUser) => {
        navigation.navigate(dataRoutes.admin.userDetailed, { dataUser });
    };
    
    //Compartilha para o zap do ganhador do sorteio
        const shareOnWhatsApp = (user) => {
            if (!user?.phone) {
                alert("Usuário não possui telefone!");
                return;
            }

            // 👇 cria variável nova (não mexe no user)
            let phoneFormatted = user.phone.replace(/\D/g, "");

            if (!phoneFormatted.startsWith("55")) {
                phoneFormatted = "55" + phoneFormatted;
            }

            const text = `🎉 Parabéns ${user.name}!
        Você foi um dos ganhadores do sorteio! 🏆`;

            const url = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(text)}`;

            Linking.openURL(url);
        };

    const handleActionButton = () => {
        if (showOnlyResults || backAfterSave) {
            navigation.goBack();
        } else {
            setShowAlertVisible(true);
        }
    };

    //Não está sendo usado pois salva agora direto após a digitação do nome do sorteio no input
    const hadleSaveDrawPrizeHistory = async () => {
        setIsLoading(true);

        const resultSave = await saveDrawPrize(
            drawPrizeTitle,
            usersWinner,
            drawerPrizeLiveId,
        );

        if (resultSave) {
            Toast.show({ type: "success", text1: "Sorteio salvo!" });

            setBackAfterSave(true);
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível savalr este sorteio!",
            });
        }

        setIsLoading(false);
        setShowAlertVisible(false);
    };

    const hadleDeleteDrawPrizeHistory = async () => {
        setIsLoadingDelete(true);

        const resultDelete = await deleteDrawPrize(drawPrizeId);

        if (resultDelete) {
            Toast.show({ type: "success", text1: "Sorteio Excluído!" });

            setBackAfterSave(true);
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível excluir este sorteio!",
            });
        }

        setIsLoadingDelete(false);
        navigation.goBack();
    };

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
                   <DrawPizeShare
                        onPress={() =>
                            handleRedirectPage(usersWinner, navigation)
                        }
                    >
                        <Entypo
                            name="share"
                            color={theme.colors.white}
                            size={28}
                        />
                    </DrawPizeShare>
                     
                    </Header>
                    <ContainerCards>
                        <ContainerCards>
                    <ContentCards>
                        {usersWinner.map((user) => (
                            <CardUser
                                key={user.email}
                                onPress={() => handleRedirectUserDetailed(user)}
                            >
                                <ContentShareUser>
                                    <DrawPizeShare
                                        onPress={() => shareOnWhatsApp(user)}
                                    >
                                        <Entypo
                                            name="share"
                                            color={theme.colors.white}
                                            size={28}
                                        />
                                    </DrawPizeShare>
                                </ContentShareUser>
                                <UserImage
                                    source={{
                                        uri: user?.userImage
                                            ? user.userImage
                                            : `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=${
                                                user.name.split(" ")[0]
                                            }`,
                                    }}
                                />
                                <UserNameTitle>{user.name}</UserNameTitle>
                                <PhoneTitle>
                                    Tel:{" "}
                                    {`(**) ****${user?.phone?.substring(user.phone.length - 6)}`}
                                </PhoneTitle>
                                <PhoneTitle>
                                    CPF: {user?.cpf ?? "Não informado"}
                                </PhoneTitle>
                             <LocationTitle>
                            {user.userType === "productor"
                                ? user?.address?.city ?? "Cidade não informada"
                                : user?.city ?? "Cidade não informada"}{" "}
                            -{" "}
                            {user.userType === "productor"
                                ? user?.address?.state ?? "Estado não informado"
                                : user?.state ?? "Estado não informado"}
                        </LocationTitle>
                            </CardUser>
                        ))}
                    </ContentCards>
                </ContainerCards>
                    </ContainerCards>
                    {showOnlyResults && (
                        <SaveDrawPrize onPress={hadleDeleteDrawPrizeHistory}>
                            {!isLoadingDelete ? (
                                <TextButton>Excluir Sorteio</TextButton>
                            ) : (
                                <ActivityIndicator animating color="white" />
                            )}
                        </SaveDrawPrize>
                    )}
                    {!showOnlyResults && !backAfterSave && (
                        <SaveDrawPrize
                            onPress={() => navigation.goBack()}
                            changeColor
                        >
                            <TextButton>Voltar</TextButton>
                        </SaveDrawPrize>
                    )}
                </>
            )}
            <DrawPrizeNameDialog
                visible={showAlertVisible}
                title="Salvar Sorteio"
                text="Informe o nome do sorteio!"
                textActionButton="Salvar"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => hadleSaveDrawPrizeHistory()}
                dismissable={false}
                inputValue={drawPrizeTitle}
                actionInputValue={setDrawPrizeTitle}
            />
        </Container>
    );
};
