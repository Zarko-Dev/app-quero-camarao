/* eslint-disable operator-linebreak */
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { v4 } from "uuid";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { Input } from "../../../components/Input";
import {
    ButtonEndDrawerPrizeAction,
    ButtonInitDrawerPrizeAction,
    ButtonStartDrawerPrizeAction,
    ButtonViewParticipants,
    CardSelection,
    Container,
    ContentActionCountButtons,
    ContentActionDrawerPrizeAction,
    ContentDrawerPrizeLive,
    ContentParticipants,
    HeaderDrawerPrizeLive,
    QuantityParticipants,
    ReloadButton,
    TextButtonStartDrawerStartAction,
    Title,
    TitleCode,
    TitleQuantityParticipants,
} from "./styles";
import { DialogComponent } from "../../../components/Dialog";
import {
    CloseDrawPrizeLiveById,
    createDrawPrizeLiveByCode,
    getActiveDrawPrizeLive,
    setWinnerDrawPrizeLive,
} from "../../../controllers/DrawPrizes/live";
import { getDataUserByIds } from "../../../controllers/User/authentication";
import { dataRoutes } from "../../../routes/dataRoutes";
import { ActionCountButton } from "../DrawPrize/styles";

export const DrawPrizeLive = ({ navigation }) => {
    const [drawerCode, setDrawerCode] = useState();
    const [drawerCodeFixed, setDrawerCodeFixed] = useState();
    const [drawerPrizeLiveId, setDrawerPrizeLiveId] = useState();
    const [participants, setParticipants] = useState([]);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [loadingStartDrawPrize, setLoadingStartDrawPrize] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [countPrizes, setCountPrizes] = useState(0);
    const [loadingInitDrawPrize, setLoadingInitDrawPrize] = useState(false);
    const [
        loadingReloadDataDrawerPrizeLive,
        setLoadingReloadDataDrawerPrizeLive,
    ] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const getDrawerPriseLive = async () => {
                const response = await getActiveDrawPrizeLive();

                if (!response.error) {
                    setDrawerCodeFixed(response.data.code);
                    setDrawerPrizeLiveId(response.data.id);
                    setParticipants(response.data?.participants ?? []);
                    setCountPrizes(
                        response.data?.participants?.length > 0 ? 1 : 0,
                    );
                }

                setInitialLoading(false);
            };

            getDrawerPriseLive();
        }, []),
    );

    const handleStartDrawPrizeLive = async () => {
        if (drawerCode) {
            setLoadingStartDrawPrize(true);

            const id = v4();
            const response = await createDrawPrizeLiveByCode(id, drawerCode);

            if (response) {
                setDrawerCodeFixed(drawerCode);
                setDrawerPrizeLiveId(id);

                setLoadingStartDrawPrize(false);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Erro ao criar o sorteio, tente novamente em instantes!",
                });
            }
        } else {
            Toast.show({
                type: "error",
                text1: "Informe o código do sorteio",
            });
        }
    };

    const handleEndDrawPrizeLive = async (hideToastMessage) => {
        const response = await CloseDrawPrizeLiveById(drawerPrizeLiveId);

        if (response) {
            setDrawerCode("");
            setDrawerCodeFixed();
            setShowAlertVisible(false);

            if (!hideToastMessage) {
                Toast.show({
                    type: "success",
                    text1: "Sorteio encerrado com sucesso!",
                });
            }
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao encerrar o sorteio, tente novamente em instantes!",
            });
        }
    };

    const handleShowParticipants = async () => {
        setLoadingParticipants(true);

        const response = await getDataUserByIds(participants);
        const fixResponse = response.map((item) => ({
            ...item,
            createdAt: item.createdAt.toDate(),
            updatedAt: item.updatedAt.toDate(),
        }));

        setLoadingParticipants(false);

        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: fixResponse,
        });
    };

    const addCountPrizes = () => {
        if (countPrizes < participants.length) {
            setCountPrizes((count) => count + 1);
        }
    };

    const removeCountPrizes = () => {
        if (countPrizes > 0) {
            setCountPrizes((count) => count - 1);
        }
    };

    const handleInitDrawPrizeLive = async () => {
        if (countPrizes > 0) {
            setLoadingInitDrawPrize(true);

            const responseActiveDrawPrizeLive = await getActiveDrawPrizeLive();

            const usersWinner = [];

            const response = await getDataUserByIds(
                responseActiveDrawPrizeLive.data.participants,
            );
            const fixResponse = response.map((item) => ({
                ...item,
                createdAt: item.createdAt.toDate(),
                updatedAt: item.updatedAt.toDate(),
            }));

            const dataUsersPrize = fixResponse.filter(
                (user) =>
                    (user.address && user.address.state && user.address.city) ||
                    (user.state && user.city),
            );

            for (let index = 0; index < countPrizes; index++) {
                const randomElement =
                    dataUsersPrize[
                        Math.floor(Math.random() * dataUsersPrize.length)
                    ];

                usersWinner.push(randomElement);
            }

            await setWinnerDrawPrizeLive(drawerPrizeLiveId, usersWinner);
            await handleEndDrawPrizeLive(true);

            setLoadingInitDrawPrize(false);

            navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
                usersWinner,
                drawerPrizeLiveId,
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Informe a quantidade de vencedores a serem sorteados!",
            });
        }
    };

    const handleReloadDataDrawerPrizeLive = async () => {
        setLoadingReloadDataDrawerPrizeLive(true);

        const response = await getActiveDrawPrizeLive();

        if (!response.error) {
            setDrawerCodeFixed(response.data.code);
            setDrawerPrizeLiveId(response.data.id);
            setParticipants(response.data?.participants ?? []);
            setCountPrizes(response.data?.participants?.length > 0 ? 1 : 0);

            Toast.show({
                type: "success",
                text1: "Sorteio atualizado!",
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao atualizar os dados do sorteio, tente novamente em instantes!",
            });
        }

        setLoadingReloadDataDrawerPrizeLive(false);
    };

    return (
        <>
            <Container>
                {initialLoading ? (
                    <ActivityIndicator
                        animating
                        color="black"
                        size={50}
                        style={{ marginTop: 10 }}
                    />
                ) : (
                    <ContentDrawerPrizeLive>
                        <HeaderDrawerPrizeLive center={!drawerCodeFixed}>
                            {drawerCodeFixed && <View style={{ width: 35 }} />}
                            <Title>
                                {drawerCodeFixed
                                    ? "Sorteio Ativo"
                                    : "Informe o códio do sorteio"}
                            </Title>
                            {drawerCodeFixed && (
                                <ReloadButton
                                    onPress={handleReloadDataDrawerPrizeLive}
                                >
                                    {loadingReloadDataDrawerPrizeLive ? (
                                        <ActivityIndicator
                                            animating
                                            color="white"
                                        />
                                    ) : (
                                        <Feather
                                            name="refresh-cw"
                                            size={24}
                                            color="white"
                                        />
                                    )}
                                </ReloadButton>
                            )}
                        </HeaderDrawerPrizeLive>
                        {!drawerCodeFixed ? (
                            <Input
                                label="Código do soteio"
                                onChange={setDrawerCode}
                                value={drawerCode}
                                autoCapitalize="sentences"
                            />
                        ) : (
                            <TitleCode>{drawerCodeFixed}</TitleCode>
                        )}
                        {!drawerCodeFixed && (
                            <ButtonStartDrawerPrizeAction
                                onPress={handleStartDrawPrizeLive}
                            >
                                {loadingStartDrawPrize ? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Iniciar Sorteio
                                    </TextButtonStartDrawerStartAction>
                                )}
                            </ButtonStartDrawerPrizeAction>
                        )}
                    </ContentDrawerPrizeLive>
                )}

                {drawerCodeFixed && (
                    <>
                        <ContentParticipants>
                            <TitleQuantityParticipants>
                                Quantidade de participantes
                            </TitleQuantityParticipants>
                            <QuantityParticipants>
                                {participants.length}
                            </QuantityParticipants>
                            <ButtonViewParticipants
                                disabled={!participants.length}
                                onPress={handleShowParticipants}
                            >
                                {loadingParticipants ? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Visualizar Participantes
                                    </TextButtonStartDrawerStartAction>
                                )}
                            </ButtonViewParticipants>
                        </ContentParticipants>

                        <CardSelection>
                            <TitleQuantityParticipants>
                                Quantos serão sorteados?
                            </TitleQuantityParticipants>
                            <QuantityParticipants>
                                {countPrizes}
                            </QuantityParticipants>
                            <ContentActionCountButtons>
                                <ActionCountButton
                                    disabled={countPrizes === 0}
                                    onPress={removeCountPrizes}
                                >
                                    <Feather
                                        name="minus"
                                        size={24}
                                        color="black"
                                    />
                                </ActionCountButton>
                                <ActionCountButton
                                    green
                                    disabled={
                                        countPrizes === participants.length
                                    }
                                    onPress={addCountPrizes}
                                >
                                    <Feather
                                        name="plus"
                                        size={24}
                                        color="black"
                                    />
                                </ActionCountButton>
                            </ContentActionCountButtons>
                        </CardSelection>

                        <ContentActionDrawerPrizeAction>
                            <ButtonInitDrawerPrizeAction
                                disabled={!participants.length}
                                onPress={handleInitDrawPrizeLive}
                            >
                                {loadingInitDrawPrize ? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Realizar Sorteio
                                    </TextButtonStartDrawerStartAction>
                                )}
                            </ButtonInitDrawerPrizeAction>
                            <ButtonEndDrawerPrizeAction
                                onPress={() => setShowAlertVisible(true)}
                            >
                                <TextButtonStartDrawerStartAction>
                                    Encerrar Sorteio
                                </TextButtonStartDrawerStartAction>
                            </ButtonEndDrawerPrizeAction>
                        </ContentActionDrawerPrizeAction>
                    </>
                )}
            </Container>
            <DialogComponent
                visible={showAlertVisible}
                title="Encerrar Sorteio?"
                text="Ao encerrar o sorteio, será necessário gerar um novo sorteio!"
                textActionButton="Encerrar Sorteio"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={handleEndDrawPrizeLive}
                dismissable={false}
            />
        </>
    );
};
