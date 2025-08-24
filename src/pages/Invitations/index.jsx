/* eslint-disable object-curly-newline */

import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
    FlatList,
    View,
    Dimensions,
    ActivityIndicator,
    Platform,
    Share,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

import {
    TextSkeleton,
    ValueSkeleton,
} from "../../components/Skeleton/TextSkeleton";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { VerifyIfUserWalletExists } from "../../controllers/Wallet/find";
import { VerifyIfUserInvitationExists } from "../../controllers/Invitations/find";
import { createUserWallet } from "../../controllers/Wallet/create";
import { createUserInvitation } from "../../controllers/Invitations/create";
import { convertToMoney } from "../../utils/convertToMoney";
import { updateInvitationMoreSended } from "../../controllers/Invitations/update";

import { ShareNativeAction } from "./ShareNative";

import {
    ButtonSendInvitation,
    Container,
    ContentCardInvitation,
    ContentHeaderInvitation,
    ContentIndicators,
    ContentinvitationInfo,
    ContentMoney,
    HeaderCard,
    HeaderContentTitle,
    HeaderInvitation,
    HeaderTitle,
    Indicator,
    InvitationInfo,
    InvitationsContent,
    InvitationsValue,
    MoneyCurrent,
    MoneyInfo,
    MoneyText,
    MoneyTextContent,
    TextButton,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

export const Invitations = () => {
    const { configData } = useSelector((state) => state.configSystem);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [activeContentmoney, setActiveContentMoney] = useState(0);
    const [dataWallet, setDataWallet] = useState();
    const [dataInvitations, setDataInvitations] = useState();

    const onViewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems[0] !== undefined) {
            setActiveContentMoney(viewableItems[0]?.index);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const getUserWallet = async () => {
                setIsLoading(true);
                setIsLoadingAction(true);

                const dataUser = await GetUserStorage();

                const resultWallet = await VerifyIfUserWalletExists(
                    dataUser.email,
                );

                if (resultWallet.error) {
                    const dataConfigWallet = {
                        currentValue: 0,
                        acumulatedValue: 0,
                    };

                    const resultcreateWallet = await createUserWallet(
                        dataUser.email,
                        dataConfigWallet,
                    );

                    if (resultcreateWallet) {
                        setDataWallet(dataConfigWallet);
                    } else {
                        Toast.show({
                            type: "error",
                            text1: "Não foi possível criar sua carteira",
                            text2: "Tente novamente em instantes",
                        });
                    }
                } else {
                    setDataWallet(resultWallet.data);
                }

                const resultInvitation = await VerifyIfUserInvitationExists(
                    dataUser.email,
                );

                if (resultInvitation.error) {
                    const dataConfigInvitations = {
                        invitationCode: `conv-${Math.floor(Date.now() / 1000)}`,
                        invitationsSended: 0,
                        invitationsAccepted: 0,
                    };

                    const resultCreateInvitation = await createUserInvitation(
                        dataUser.email,
                        dataConfigInvitations,
                    );

                    if (resultCreateInvitation) {
                        setDataInvitations(dataConfigInvitations);
                    } else {
                        Toast.show({
                            type: "error",
                            text1: "Não foi possível criar seus convites",
                            text2: "Tente novamente em instantes",
                        });
                    }
                } else {
                    setDataInvitations(resultInvitation.data);
                }

                setIsLoading(false);
                setIsLoadingAction(false);
            };

            getUserWallet();
        }, []),
    );

    const viewabilityRef = useRef([
        {
            viewabilityConfig: {
                itemVisiblePercentThreshold: 50,
            },
            onViewableItemsChanged,
        },
    ]);

    const updateInvitations = async () => {
        const dataUser = await GetUserStorage();

        await updateInvitationMoreSended(
            dataUser.email,
            dataInvitations.invitationsSended,
        );

        setDataInvitations((data) => ({
            ...data,
            invitationsSended: data.invitationsSended + 1,
        }));
    };

    const handleShareInvitation = async () => {
        if (dataInvitations) {
            if (Platform.OS === "android") {
                try {
                    await ShareNativeAction(
                        dataInvitations.invitationCode,
                        configData.invitationDiscount,
                        {
                            android: configData.androidUrl,
                            ios: configData.iosUrl,
                        },
                    );

                    await updateInvitations();
                } catch (error) {
                    console.error("Share error:", error);
                }
            } else if (Platform.OS === "ios") {
                try {
                    await Share.share({
                        title: "Convite para indicação",
                        message: `Olá! Venho através do *Aplicativo Quero Camarão* 🦐

Use meu convite para ganhar um desconto especial de *R$${configData.invitationDiscount},00* em sua *primeira publicação* de camarão. 💰✨🎉

*Convite*:
http://querocamarao.logicphire.com.br?convite=${dataInvitations.invitationCode}

Se ainda não baixou o Quero Camarão, *baixe agora mesmo*! 📲🔥👇🏻👇🏻

*Play Store*: ${configData.androidUrl}

*App Store*: ${configData.iosUrl}
`,
                    });

                    await updateInvitations();
                } catch (error) {
                    console.error("Erro ao compartilhar:", error.message);
                }
            }
        }
    };

    return (
        <Container>
            <HeaderCard style={BoxShadowIos}>
                <HeaderContentTitle>
                    <FontAwesome5 name="wallet" size={20} color="black" />
                    <HeaderTitle>Minha Carteira</HeaderTitle>
                </HeaderContentTitle>
                <FlatList
                    data={[
                        {
                            value: dataWallet?.currentValue || 0,
                            text: "Créditos Disponíveis",
                        },
                        {
                            value: dataWallet?.acumulatedValue || 0,
                            text: "Créditos Acumulados",
                        },
                    ]}
                    renderItem={({ item }) => (
                        <View style={{ width: Dimensions.get("screen").width }}>
                            <ContentMoney>
                                <MoneyTextContent>
                                    <MoneyCurrent>R$ </MoneyCurrent>
                                    {isLoading ? (
                                        <ValueSkeleton />
                                    ) : (
                                        <MoneyText>
                                            {convertToMoney(item.value)}
                                        </MoneyText>
                                    )}
                                </MoneyTextContent>
                                <MoneyInfo>{item.text}</MoneyInfo>
                            </ContentMoney>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index}
                    pagingEnabled
                    viewabilityConfigCallbackPairs={viewabilityRef.current}
                />
                <ContentIndicators>
                    {[
                        {
                            id: 0,
                            value: dataWallet?.currentValue || 0,
                            text: "Valor Disponível",
                        },
                        {
                            id: 1,
                            value: dataWallet?.acumulatedValue || 0,
                            text: "Valor Acumulado",
                        },
                    ].map((item) => (
                        <Indicator
                            key={item.id}
                            active={activeContentmoney === item.id}
                        />
                    ))}
                </ContentIndicators>
            </HeaderCard>
            <ContentCardInvitation style={BoxShadowIos}>
                <ContentHeaderInvitation>
                    <FontAwesome name="ticket" size={20} color="black" />
                    <HeaderInvitation>Meus Convites</HeaderInvitation>
                </ContentHeaderInvitation>
                <ContentinvitationInfo>
                    <InvitationsContent>
                        {isLoading ? (
                            <TextSkeleton />
                        ) : (
                            <InvitationsValue>
                                {dataInvitations?.invitationsSended || 0}
                            </InvitationsValue>
                        )}
                        <InvitationInfo>Convites Enviados</InvitationInfo>
                    </InvitationsContent>
                    <InvitationsContent>
                        {isLoading ? (
                            <TextSkeleton />
                        ) : (
                            <InvitationsValue>
                                {dataInvitations?.invitationsAccepted || 0}
                            </InvitationsValue>
                        )}
                        <InvitationInfo>Convites Aceitos</InvitationInfo>
                    </InvitationsContent>
                </ContentinvitationInfo>
            </ContentCardInvitation>
            <ContentCardInvitation style={BoxShadowIos}>
                <ButtonSendInvitation onPress={handleShareInvitation}>
                    {!isLoadingAction ? (
                        <TextButton>Enviar Convite</TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonSendInvitation>
            </ContentCardInvitation>
        </Container>
    );
};
