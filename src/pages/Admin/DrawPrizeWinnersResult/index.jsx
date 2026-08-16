/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { Entypo, Feather } from "@expo/vector-icons";
import { useTheme } from "styled-components";
import { getDrawPrizeLiveById } from "../../../controllers/DrawPrizes/live";
import { Linking } from "react-native";
import { animationSteps, buildAnimationSequence } from "../../../utils/drawAnimationSequence";

import lottieLoadingDrawPrize from "../../../assets/lotties/lottieLoadingDrawPrize.json";
import lottieWinDrawPrize from "../../../assets/lotties/lottieWinDrawPrize.json";
import lottieContinousWinDrawPrize from "../../../assets/lotties/lottieContinousWinDrawPrize.json";

import {
    BackButton,
    CardUser,
    Container,
    ContainerCards,
    Content,
    ContentCards,
    ContentShareUser,
    DrawPizeShare,
    Header,
    InfoRow,
    LocationTitle,
    PhoneTitle,
    SaveDrawPrize,
    TextButton,
    Title,
    UserImage,
    UserNameTitle,
} from "./styles";
import { dataRoutes } from "../../../routes/dataRoutes";
import { deleteDrawPrize } from "../../../controllers/DrawPrizes/delete";
import {
    buildSingleWinnerShareMessage,
    buildWinnersShareMessage,
} from "../../../utils/winnerShareMessage";

const ANIMATION_SOURCES = {
    loading: lottieLoadingDrawPrize,
    win: lottieWinDrawPrize,
    continuous: lottieContinousWinDrawPrize,
};

export const DrawPrizeWinnersResult = ({ route, navigation }) => {
    const theme = useTheme();
    const { drawPrizeId, showOnlyResults, drawerPrizeLiveId, newWinnersCount } =
        route.params;
    const [usersWinner, setUsersWinner] = useState([]);

    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [animationStatus, setAnimationStatus] = useState(
        showOnlyResults
            ? { ...animationSteps.continuous, animation: lottieContinousWinDrawPrize }
            : { ...animationSteps.loading, animation: lottieLoadingDrawPrize },
    );
    const [justifyContent, setJustifyContent] = useState("center");
    const [showResult, setShowResult] = useState(false);
    const [backAfterSave, setBackAfterSave] = useState(false);

    const animation = useRef(null);

    useEffect(() => {
    const loadWinners = async () => {
        if (drawerPrizeLiveId) {
            const response = await getDrawPrizeLiveById(drawerPrizeLiveId);
            if (!response.error) {
                const allWinners = response.data.winners ?? [];
                if (newWinnersCount != null) {
                    setUsersWinner(allWinners.slice(-newWinnersCount));
                } else {
                    setUsersWinner(allWinners);
                }
            }
        } else {
            setUsersWinner(route.params.usersWinner ?? []);
        }
    };

    loadWinners();
}, [drawerPrizeLiveId]);

    useEffect(() => {
        if (showOnlyResults) {
            setShowResult(true);
            setJustifyContent("flex-start");
            return;
        }
        const sequence = buildAnimationSequence();
        const timers = sequence.map(({ step, delayMs }) =>
            setTimeout(() => {
                setAnimationStatus({ ...animationSteps[step], animation: ANIMATION_SOURCES[step] });
                if (step === "win") setShowResult(true);
                if (step === "continuous") setJustifyContent("flex-start");
            }, delayMs),
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    const handleRedirectUserDetailed = (dataUser) => {
        navigation.navigate(dataRoutes.admin.userDetailed, { dataUser });
    };

    const shareSingleWinner = async (user) => {
        const rawPhone = user?.phone ?? "";
        const digits = rawPhone.replace(/\D/g, "");
        const phone = digits.startsWith("55") ? digits : `55${digits}`;

        if (!phone || phone.length < 12) {
            Toast.show({
                type: "error",
                text1: "Telefone do ganhador não disponível.",
            });
            return;
        }

        const message = buildSingleWinnerShareMessage(user);
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        try {
            await Linking.openURL(url);
        } catch {
            Toast.show({
                type: "error",
                text1: "Não foi possível abrir o WhatsApp.",
            });
        }
    };

    const shareAllWinners = async () => {
        try {
            const message = buildWinnersShareMessage(usersWinner);
            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            await Linking.openURL(url);
        } catch {
            Toast.show({
                type: "error",
                text1: "Não foi possível abrir o WhatsApp.",
            });
        }
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
                    key={animationStatus.key}
                    autoPlay
                    ref={animation}
                    style={{
                        width: animationStatus.width,
                        height: animationStatus.height,
                    }}
                    loop={animationStatus.loop || false}
                    speed={animationStatus.speed}
                    source={animationStatus.animation}
                />
            </Content>
            {showResult && (
                <>
                    <Header>
                        <BackButton onPress={() => navigation.goBack()}>
                            <Feather
                                name="arrow-left"
                                color={theme.colors.black}
                                size={20}
                            />
                        </BackButton>
                        <Title>Vencedores do Sorteio</Title>
                   <DrawPizeShare onPress={shareAllWinners}>
                        <Entypo
                            name="share"
                            color={theme.colors.white}
                            size={28}
                        />
                    </DrawPizeShare>
                     
                    </Header>
                    <ContainerCards>
                    <ContentCards>
                        {usersWinner.map((user) => (
                            <CardUser
                                key={user.email}
                                onPress={() => handleRedirectUserDetailed(user)}
                            >
                                <ContentShareUser>
                                    <DrawPizeShare onPress={() => shareSingleWinner(user)}>
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
                                <InfoRow>
                                    <Feather name="phone" size={18} color="black" />
                                    <PhoneTitle>
                                        Tel: {`(**) ****${user?.phone?.substring(user.phone.length - 6)}`}
                                    </PhoneTitle>
                                </InfoRow>
                                <InfoRow>
                                    <Feather name="file-text" size={18} color="black" />
                                    <PhoneTitle>
                                        CPF: ***.***{user?.cpf?.substring(user.cpf.length - 6) ?? "Não informado"}
                                    </PhoneTitle>
                                </InfoRow>
                                <InfoRow>
                                    <Feather name="map-pin" size={18} color="black" />
                                    <LocationTitle>
                                        {user.userType === "productor"
                                            ? user?.address?.city ?? "Cidade não informada"
                                            : user?.city ?? "Cidade não informada"}{" "}
                                        -{" "}
                                        {user.userType === "productor"
                                            ? user?.address?.state ?? "Estado não informado"
                                            : user?.state ?? "Estado não informado"}
                                    </LocationTitle>
                                </InfoRow>
                            </CardUser>
                        ))}
                    </ContentCards>
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
        </Container>
    );
};

