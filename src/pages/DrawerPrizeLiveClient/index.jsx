/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import React from "react";
import { useTheme } from "styled-components";
import { ActivityIndicator, Modal } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import {
    Animated, View, TouchableOpacity, Text
} from "react-native";
import { DialogComponent } from "../../components/Dialog";
import { Input } from "../../components/Input";
import { useDrawerPrizeLive } from "./useDrawerPrizeLive";
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
    ModalHandle,
    ModalIconBadge,
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

export const DrawerPrizeLiveClient = ({ navigation }) => {
    const theme = useTheme();
    const {
        dialogInputVisible,
        setDialogInputVisible,
        itemValue,
        setItemValue,
        filteredDraws,
        loadingInitialData,
        showAlertVisible,
        setShowAlertVisible,
        setDeleteDrawPrizeLiveId,
        handleParticipateDrawPriseLive,
        handleDeleteDrawPrizeLive,
        handleShowWinners,
        userRules,
        dataUser,
        activeTab,
        setActiveTab,
        showSuccess,
        scaleAnim
    } = useDrawerPrizeLive({ navigation });

    return (
        <>
            <ContainerScreen>
                <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 16 }}>
                    <TouchableOpacity
                        onPress={() => setActiveTab("ativos")}
                        style={{ padding: 10, borderBottomWidth: activeTab === "ativos" ? 2 : 0, borderColor: theme.colors.primary }}
                    >
                        <Text style={{ fontWeight: activeTab === "ativos" ? "bold" : "normal" }}>Sorteios Atuais</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab("encerrados")}
                        style={{
                            padding: 10, borderBottomWidth: activeTab === "encerrados" ? 2 : 0, borderColor: theme.colors.primary, marginLeft: 20
                        }}
                    >
                        <Text style={{ fontWeight: activeTab === "encerrados" ? "bold" : "normal" }}>Encerrados</Text>
                    </TouchableOpacity>
                </View>

                {loadingInitialData ? (
                    <ActivityIndicator animating color="black" size={50} style={{ marginTop: 10 }} />
                ) : (
                    <>
                        <Container>
                            <DrawerprizeList
                                data={filteredDraws}
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

                                        {item.name ? (
                                            <TitleCardDrawerPrize>{item.name}</TitleCardDrawerPrize>
                                        ) : null}
                                        <BodyCardDrawerPrize>
                                            {item.status ? (
                                                (item?.participants || []).includes(dataUser?.email) ? (
                                                    <ContentTitleParticipating>
                                                        <TitleParticipating>
                                                            Você já está participando deste sorteio
                                                        </TitleParticipating>
                                                    </ContentTitleParticipating>
                                                ) : (
                                                    <ContentTitleParticipating notParticipant>
                                                        <TitleParticipating notParticipant>
                                                            Clique em participar do sorteio e informe o código
                                                        </TitleParticipating>
                                                    </ContentTitleParticipating>
                                                )
                                            ) : (
                                                <ButtonWinners onPress={() => handleShowWinners(item.id)}>
                                                    <TitleButtonWinners>Ver ganhadores</TitleButtonWinners>
                                                </ButtonWinners>
                                            )}
                                        </BodyCardDrawerPrize>
                                        <FooterCardDrawerPrize>
                                            <TitleDateDrawPrize>
                                                Criado em:{" "}
                                                {item.createdAt?.toDate
                                                    ? item.createdAt.toDate().toLocaleDateString("pt-BR")
                                                    : item.createdAt?.seconds
                                                        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("pt-BR")
                                                        : "—"}
                                            </TitleDateDrawPrize>
                                        </FooterCardDrawerPrize>
                                        {(userRules || []).includes("Admin") && (
                                            <ContentActionButton>
                                                <ButtonDeleteDrawPrizeLive
                                                    onPress={() => {
                                                        setDeleteDrawPrizeLiveId(item.id);
                                                        setShowAlertVisible(true);
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
                        <ButtonParticipate onPress={() => setDialogInputVisible(true)}>
                            <TitleButtonParticipate>Participar do sorteio ao vivo</TitleButtonParticipate>
                        </ButtonParticipate>

                        {/* Modified Modal based on UI/UX spec */}
                        <Modal
                            visible={dialogInputVisible}
                            onDismiss={() => setDialogInputVisible(false)}
                            contentContainerStyle={{
                                justifyContent: "flex-end",
                                alignItems: "center"
                            }}
                        >
                            <ModalContent>
                                <ModalHandle />
                                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                    <ModalIconBadge success={showSuccess}>
                                        <Feather name={showSuccess ? "check-circle" : "gift"} size={28} color={showSuccess ? "#fff" : theme.colors.primary} />
                                    </ModalIconBadge>
                                </Animated.View>

                                {showSuccess ? (
                                    <>
                                        <TitleModal>Você está participando!</TitleModal>
                                        <SubTitleModal>Boa sorte no sorteio 🎉</SubTitleModal>
                                    </>
                                ) : (
                                    <>
                                        <TitleModal>Informe o código do sorteio</TitleModal>
                                        <SubTitleModal>
                                            Digite o código informado pelo produtor para participar do sorteio ao vivo
                                        </SubTitleModal>
                                        <Input
                                            label="Código do sorteio"
                                            icon="hash"
                                            onChange={setItemValue}
                                            value={itemValue}
                                            autoCapitalize="characters"
                                        />
                                        <ContentActionsModal>
                                            <ButtonModalCancel onPress={() => setDialogInputVisible(false)}>
                                                <TitleButtonModalCancel>Cancelar</TitleButtonModalCancel>
                                            </ButtonModalCancel>
                                            <ButtonModalConfirm activeOpacity={0.8} onPress={handleParticipateDrawPriseLive}>
                                                <Feather name="check-circle" size={18} color={theme.colors.white} />
                                                <TitleButtonModalConfirm>Participar deste sorteio</TitleButtonModalConfirm>
                                            </ButtonModalConfirm>
                                        </ContentActionsModal>
                                    </>
                                )}
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
