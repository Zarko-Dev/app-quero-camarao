/* eslint-disable operator-linebreak */
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { v4 } from "uuid";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { Input } from "../../../components/Input";
import { ScrollView } from "react-native";
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
    getDrawPrizeLiveById,
    updateDrawPrizeLiveNames
} from "../../../controllers/DrawPrizes/live";
import { saveDrawPrize} from "../../../controllers/DrawPrizes/create";
import { getDataUserByIds } from "../../../controllers/User/authentication";
import { dataRoutes } from "../../../routes/dataRoutes";
import { ActionCountButton } from "../DrawPrize/styles";
import { DrawPrizeNameDialog } from "../DrawPrizeWinnersResult/components/DrawPrizeNameDialog";

export const DrawPrizeLive = ({ navigation }) => {
    const [drawerCode, setDrawerCode] = useState();
    const [drawerCodeFixed, setDrawerCodeFixed] = useState();
    const [drawerNameFixed, setDrawerNameFixed] = useState();
    const [drawerName, setDrawerName] = useState(); 
    const [drawerPrizeLiveId, setDrawerPrizeLiveId] = useState();
    const [showDrawPrizeNameDialog, setShowDrawPrizeNameDialog] = useState(false);
    const [drawPrizeNames, setDrawPrizeNames] = useState([]);
    const [currentDrawPrizeName, setCurrentDrawPrizeName] = useState("");
    const [participants, setParticipants] = useState([]);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [loadingStartDrawPrize, setLoadingStartDrawPrize] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [loadingWinners, setLoadingWinners] = useState(false);
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
                setDrawerNameFixed(response.data.names?.[0] ?? '');
                setDrawPrizeNames(response.data.names ?? []); // ??
                setDrawerPrizeLiveId(response.data.id);
                setParticipants(response.data?.participants ?? []);
                setCountPrizes(response.data?.participants?.length > 0 ? 1 : 0);
                }

                setInitialLoading(false);
            };

            getDrawerPriseLive();
        }, []),
    );

  const handleStartDrawPrizeLive = async () => {
    if (drawerCode) { // ?? valida os dois campos
        setLoadingStartDrawPrize(true);

        const id = v4();
        const response = await createDrawPrizeLiveByCode(id, drawerCode); // ?? passa o nome

        if (response) {
            setDrawerCodeFixed(drawerCode);
            setDrawerNameFixed(drawerName); // ?? seta o nome fixo
             setDrawPrizeNames([]); // ?? já inicia o array com o primeiro
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
            text1: !drawerCode 
                ? "Informe o código do sorteio" // ?? mensagens separadas
                : "Informe o nome do sorteio",
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

   // traz os ganhadores dos sorteios  ao clicar em visualizar ganhadores
 const handleShowWinners = async () => {
    setLoadingWinners(true);

    const response = await getDrawPrizeLiveById(drawerPrizeLiveId);

    if (!response.error) {
        const winners = response.data.winners ?? [];

        const fixResponse = winners.map((item) => ({
            ...item,
            createdAt: item.createdAt?.toDate?.() ?? null,
            updatedAt: item.updatedAt?.toDate?.() ?? null,
        }));

         setLoadingWinners(false); // ?? para o loading antes de navegar

        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: fixResponse,
        });
    }  else {
        setLoadingWinners(false); // ?? para o loading em caso de erro
    }
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

    //Muda o handleInitDrawPrizeLive para abrir o dialog quando já houver sorteios anteriores:
const handleInitDrawPrizeLive = async () => {
    if (countPrizes > 0) {
        setShowDrawPrizeNameDialog(true); // ?? sempre abre o dialog
    } else {
        Toast.show({
            type: "error",
            text1: "Informe a quantidade de vencedores a serem sorteados!",
        });
    }
};





   const executeDrawPrizeLive = async (prizeName) => {
    setShowDrawPrizeNameDialog(false);
    setLoadingInitDrawPrize(true);

    const responseActiveDrawPrizeLive = await getActiveDrawPrizeLive();
    const previousWinners = responseActiveDrawPrizeLive.data.winners ?? []
    const usersWinner = []

    const response = await getDataUserByIds(
        responseActiveDrawPrizeLive.data.participants,
    )
    const fixResponse = response.map((item) => ({
        ...item,
        createdAt: item.createdAt.toDate(),
        updatedAt: item.updatedAt.toDate(),
    }))

    const dataUsersPrize = fixResponse.filter(
        (user) =>
            ((user.address && user.address.state && user.address.city) ||
            (user.state && user.city)) &&
            !previousWinners.some((winner) => winner.email === user.email),
    )

    const shuffledUsers = [...dataUsersPrize]

    for (let index = 0; index < countPrizes; index++) {
        if (shuffledUsers.length === 0) break
        const randomIndex = Math.floor(Math.random() * shuffledUsers.length)
        const randomElement = shuffledUsers[randomIndex]
        usersWinner.push(randomElement)
        shuffledUsers.splice(randomIndex, 1)
    }

    if (usersWinner.length === 0) {
        Toast.show({
            type: "error",
            text1: "Todos os participantes já foram sorteados!",
        })
        setLoadingInitDrawPrize(false)
        return
    }

     const usersWinnerWithPrizeName = usersWinner.map((item) => ({
        ...item,
        drawName: prizeName,
    }));

    const allWinners = [...previousWinners, ...usersWinnerWithPrizeName]

    await setWinnerDrawPrizeLive(drawerPrizeLiveId, allWinners)

    // âœ… salva no histórico automaticamente
    await saveDrawPrize(prizeName,usersWinnerWithPrizeName, drawerPrizeLiveId)

    // ?? salva o novo nome no array names do Firestore
    await updateDrawPrizeLiveNames(drawerPrizeLiveId, prizeName)

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setDrawPrizeNames((prev) => [...prev, prizeName]) // ?? aqui
    setCurrentDrawPrizeName("") // ?? faltou isso

    setLoadingInitDrawPrize(false)

    navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
        drawerPrizeLiveId,
        newWinnersCount: usersWinner.length,
        drawPrizeName: prizeName,
    })
}

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
                 <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                                    : "Informe o código do sorteio"}
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
                                <>
                                    <Input
                                        label="Código do sorteio"
                                        onChange={setDrawerCode}
                                        value={drawerCode}
                                        autoCapitalize="sentences"
                                    />
                                  
                                </>
                            ) : (
                                <>    
                                      <TitleCode>{drawerCodeFixed}</TitleCode>
                                   <View style={{ flexDirection: "row", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                        {drawPrizeNames.map((name, index) => (
                                            <TitleCode key={index}>{name}</TitleCode>
                                        ))}
                                    </View>
                                </>
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

                            <ContentParticipants>
                           
                            <ButtonViewParticipants
                                disabled={!participants.length}
                                onPress={handleShowWinners}
                            >
                                {loadingWinners? (
                                    <ActivityIndicator
                                        animating
                                        color="white"
                                    />
                                ) : (
                                    <TextButtonStartDrawerStartAction>
                                        Visualizar Ganhadores
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
                </ScrollView>
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
              <DrawPrizeNameDialog  
                visible={showDrawPrizeNameDialog}
                title="Nome do Sorteio"
                text="Informe o nome deste sorteio!"
                textActionButton="Sortear"
                hideDialog={() => setShowDrawPrizeNameDialog(false)}
                actionButton={() => executeDrawPrizeLive(currentDrawPrizeName)}
                dismissable={false}
                inputValue={currentDrawPrizeName}
                actionInputValue={setCurrentDrawPrizeName}                                  
            />
           
        </>
        
    );
};
