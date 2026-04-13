/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { ActivityIndicator, Modal } from "react-native-paper";
import {
    BadgeCardDrawerPrize,
    BodyCardDrawerPrize,
    ButtonDeleteDrawPrizeLive,
    ButtonModalCancel,
    ButtonModalConfirm,
    ButtonParticipate,
    ButtonWinners,
    CardDrawerPrize,
    Container,
    ContainerScreen,
    ContentActionButton,
    ContentActionsModal,
    ContentTitleParticipating,
    DrawerprizeList,
    FooterCardDrawerPrize,
    HeaderCardDrawerPrize,
    ModalContent,
    SubTitleModal,
    TitleBadgeCardDrawerPrize,
    TitleButtonDeleteDrawPrizeLive,
    TitleButtonModalCancel,
    TitleButtonModalConfirm,
    TitleButtonParticipate,
    TitleButtonWinners,
    TitleCardDrawerPrize,
    TitleDateDrawPrize,
    TitleModal,
    TitleParticipating,
} from "./styles";
import {
    deleteDrawPrizeLiveById,
    findDrawPrizeLiveByCode,
    getAllDrawPrizesLiveWhereParticipant,
    setParticipantDrawPrizeLive,
} from "../../controllers/DrawPrizes/live";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { dataRoutes } from "../../routes/dataRoutes";
import { DialogComponent } from "../../components/Dialog";
import { Input } from "../../components/Input";

export const DrawerPrizeLiveClient = ({ navigation }) => {
    const [dialogInputVisible, setDialogInputVisible] = useState(false);
    const [itemValue, setItemValue] = useState("");

    const [dataUser, setDataUser] = useState();
    const [userRules, setUserRules] = useState([]);
    const [drawerpriseLiveList, setDrawerpriseLiveList] = useState([]);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [deleteDrawPrizeLiveId, setDeleteDrawPrizeLiveId] = useState("");

    const handleGetInitialData = async () => {
        setLoadingInitialData(true);
        setDrawerpriseLiveList([]);

        const user = await GetUserStorage();
        setDataUser(user);
        const rules = Array.isArray(user?.rules) ? user.rules : [];
        const isAdmin = rules.includes("Admin");

        const response = await getAllDrawPrizesLiveWhereParticipant(
            user?.email,
            isAdmin,
        );
        setUserRules(rules);

        if (response.error) {
            Toast.show({
                type: "error",
                text1: isAdmin
                    ? "Não há sorteios a serem listados!"
                    : "Você não possui sorteios ao vivo",
                text2: isAdmin
                    ? "Realize a criação de um sorteio ao vivo!"
                    : "Participe de sorteios para visualizá-los aqui",
            });
        } else {
            setDrawerpriseLiveList(response.data);
        }

        setLoadingInitialData(false);
    };

    useFocusEffect(
        useCallback(() => {
            handleGetInitialData();
        }, []),
    );

    const handleParticipateDrawPriseLive = async () => {
        if (!itemValue) {
            Toast.show({
                type: "error",
                text1: "Código inválido",
                text2: "Informe o código do sorteio",
            });

            return;
        }

        const response = await findDrawPrizeLiveByCode(
            itemValue,
            dataUser.email,
        );

        if (response.error) {
            Toast.show({
                type: "error",
                text1: "Sorteio não encontrado",
                text2: "Verifique se o código digitado está correto!",
            });
        } else {
            const responseParticipant = await setParticipantDrawPrizeLive(
                response.data.id,
                dataUser.email,
            );

            if (responseParticipant.error) {
                Toast.show({
                    type: "error",
                    text1: "Erro ao participar do sorteio",
                    text2: "Tente novamente em instantes",
                });
            } else {
                Toast.show({
                    type: "success",
                    text1: "Participação realizada com sucesso",
                    text2: "Boa sorte!",
                });

                setTimeout(async () => {
                    await handleGetInitialData();
                }, 2000);
            }
        }

        setDialogInputVisible(false);
        setItemValue("");
    };

    const handleShowWinners = (winners) => {
        const fixWinners = winners.map((item) => ({
            ...item,
            createdAt: item.createdAt.toDate(),
            updatedAt: item.updatedAt.toDate(),
        }));

        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: fixWinners,
            noActions: true,
        });
    };

    const handleDeleteDrawPrizeLive = async () => {
        setLoadingInitialData(true);

        const result = await deleteDrawPrizeLiveById(deleteDrawPrizeLiveId);

        if (result) {
            setTimeout(async () => {
                await handleGetInitialData();
            }, 2000);
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao excluir sorteio",
                text2: "Tente novamente em instantes",
            });
        }

        setShowAlertVisible(false);
    };

    return (
        <>
            <ContainerScreen>
                {loadingInitialData ? (
                    <ActivityIndicator
                        animating
                        color="black"
                        size={50}
                        style={{ marginTop: 10 }}
                    />
                ) : (
                    <>
                        <Container>
                            <DrawerprizeList
                                data={drawerpriseLiveList}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <CardDrawerPrize>
                                   <HeaderCardDrawerPrize>
                                        <BadgeCardDrawerPrize status={item.status}>
                                            <TitleBadgeCardDrawerPrize>
                                                {item.status ? "Ativo" : "Encerrado"}
                                            </TitleBadgeCardDrawerPrize>
                                        </BadgeCardDrawerPrize>
                                    </HeaderCardDrawerPrize>

                                   {item.names?.map((name, index) => (
                                        <TitleCardDrawerPrize key={index}>
                                            Nome Sorteio: {name}
                                        </TitleCardDrawerPrize>
                                        ))}
                                        <BodyCardDrawerPrize>
                                            {item.status ? (
                                                (item?.participants || []).includes(
                                                    dataUser?.email,
                                                ) ? (
                                                    <ContentTitleParticipating>
                                                        <TitleParticipating>
                                                            Você já está
                                                            participando deste
                                                            sorteio
                                                        </TitleParticipating>
                                                    </ContentTitleParticipating>
                                                ) : (
                                                    <ContentTitleParticipating
                                                        notParticipant
                                                    >
                                                        <TitleParticipating>
                                                            Clique em participar
                                                            do sorteio e inform
                                                            o código
                                                        </TitleParticipating>
                                                    </ContentTitleParticipating>
                                                )
                                            ) : (
                                                <ButtonWinners
                                                    onPress={() =>
                                                        handleShowWinners(
                                                            item.winners,
                                                        )
                                                    }
                                                >
                                                    <TitleButtonWinners>
                                                        Ver ganhadores
                                                    </TitleButtonWinners>
                                                </ButtonWinners>
                                            )}
                                        </BodyCardDrawerPrize>
                                        <FooterCardDrawerPrize>
                                            <TitleDateDrawPrize>
                                                Criado em: 20/10/2021
                                            </TitleDateDrawPrize>
                                        </FooterCardDrawerPrize>
                                        {(userRules || []).includes("Admin") && (
                                            <ContentActionButton>
                                                <ButtonDeleteDrawPrizeLive
                                                    onPress={() => {
                                                        setDeleteDrawPrizeLiveId(
                                                            item.id,
                                                        );
                                                        setShowAlertVisible(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    <TitleButtonDeleteDrawPrizeLive>
                                                        Excluir Sorteio ao vivo
                                                    </TitleButtonDeleteDrawPrizeLive>
                                                </ButtonDeleteDrawPrizeLive>
                                            </ContentActionButton>
                                        )}
                                    </CardDrawerPrize>
                                )}
                            />
                        </Container>
                        <ButtonParticipate
                            onPress={() => setDialogInputVisible(true)}
                        >
                            <TitleButtonParticipate>
                                Participar do sorteio ao vivo
                            </TitleButtonParticipate>
                        </ButtonParticipate>
                        <Modal
                            visible={dialogInputVisible}
                            onDismiss={() => setDialogInputVisible(false)}
                            contentContainerStyle={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}
                        >
                            <ModalContent>
                                <TitleModal>
                                    Informe o código do sorteio
                                </TitleModal>
                                <SubTitleModal>
                                    Para participar do sorteio ao vivo, é
                                    necessário informar o código do sorteio
                                </SubTitleModal>
                                <Input
                                    label="Código do sorteio"
                                    onChange={setItemValue}
                                    value={itemValue}
                                />
                                <ContentActionsModal>
                                    <ButtonModalCancel
                                        onPress={() =>
                                            setDialogInputVisible(false)
                                        }
                                    >
                                        <TitleButtonModalCancel>
                                            Cancelar
                                        </TitleButtonModalCancel>
                                    </ButtonModalCancel>
                                    <ButtonModalConfirm
                                        onPress={handleParticipateDrawPriseLive}
                                    >
                                        <TitleButtonModalConfirm>
                                            Participar deste sorteio
                                        </TitleButtonModalConfirm>
                                    </ButtonModalConfirm>
                                </ContentActionsModal>
                            </ModalContent>
                        </Modal>
                    </>
                )}
            </ContainerScreen>

            <DialogComponent
                visible={showAlertVisible}
                title="Excluir Sorteio?"
                text="Deseja excluir este sorteio ao vivo?"
                textActionButton="Excluir Sorteio"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={handleDeleteDrawPrizeLive}
                dismissable={false}
            />
        </>
    );
};
