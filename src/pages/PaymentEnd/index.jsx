/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable operator-linebreak */
/* eslint-disable no-nested-ternary */
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { paymentActions } from "../Payment/actions";
import { dataRoutes } from "../../routes/dataRoutes";
import { updateOrder } from "../../controllers/Payment/order";
import { saveShrimpPonds } from "../../controllers/Publication/saveShrimpPonds";
import {
    GetUserStorage,
    SetUserStorage,
} from "../../services/Storage/UserStorage";
import { decreaseAmountCupom } from "../../controllers/Cupons/decreaseAmountCupom";
import { decreaseWallet, updateWallet } from "../../controllers/Wallet/update";
import { PaymentWalletActions } from "../Payment/components/ResumeCrad/actions";

import lottieCreditCardError from "../../assets/lotties/lottieCreditCardError.json";
import lottieCreditCardSuccess from "../../assets/lotties/lottieCreditCardSuccess.json";
import lottieError from "../../assets/lotties/lottieError.json";
import lottiePending from "../../assets/lotties/lottiePending.json";
import lottieSuccess from "../../assets/lotties/lottieSuccess.json";
import lottiePrepare from "../../assets/lotties/lottiePrepare.json";
import lottieSaveImage from "../../assets/lotties/lottieSaveImage.json";
import lottieSend from "../../assets/lotties/lottieSend.json";

import { Container, ContentInformation, TextInformation } from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";
import { incrementAmountCupom } from "../../controllers/Cupons/incrementAmountCupom";
import { getDataUser } from "../../controllers/User/authentication";
import { VerifyIfUserInvitationExists } from "../../controllers/Invitations/find";
import { getWalletByUserId } from "../../controllers/Wallet/find";
import { updateInvitationMoreAccepted } from "../../controllers/Invitations/update";
import {
    updateUserInvitationGuestStatus,
    updateUserWasInvitedStatus,
} from "../../controllers/User/update";
import { getOrderDetails } from "../../services/MercadoPago/getOrder";

export const PaymentEnd = ({ route, navigation }) => {
    const dispatch = useDispatch();

    const { dataOrder } = useSelector((state) => state.payment);
    const { dataWallet } = useSelector((state) => state.paymentWallet);
    const { configData } = useSelector((state) => state.configSystem);

    const { params } = route;
    const animation = useRef(null);
    const hasNavigatedToPayment = useRef(false);

    const [animationStatus, setAnimationStatus] = useState();
    const [verifyPayment, setVerifyPayment] = useState({
        show: false,
    });
    const [preparePonds, setPreparePonds] = useState({
        show: false,
    });
    const [prepareImage, setPrepareImage] = useState({
        show: false,
    });
    const [sendPublication, setSendPublication] = useState({
        show: false,
    });

    const animationTypes = [
        // account_money, bank_transfer, default
        {
            pending: {
                animation: lottiePending,
                duration: 0.6,
                icon: "alert",
                text: "Pagamento Pendente",
                color: "#ffe900",
                textColor: "#FFF",
            },
            approved: {
                animation: lottieSuccess,
                duration: 1,
                icon: "success",
                text: "Pagamento Aprovado",
                color: "#4BB543",
                textColor: "#FFF",
            },
            inprocess: {
                animation: lottiePending,
                duration: 0.6,
                icon: "alert",
                text: "Pagamento em Progresso",
                color: "#ffe900",
                textColor: "#FFF",
            },
            rejected: {
                animation: lottieError,
                duration: 0.4,
                icon: "error",
                text: "Pagamento Rejeitado",
                color: "#FF9494",
                textColor: "#FFF",
            },
            cancelled: {
                animation: lottieError,
                duration: 0.4,
                icon: "error",
                text: "Pagamento Cancelado",
                color: "#FF9494",
                textColor: "#FFF",
            },
        },
        // credit_card, debit_card
        {
            pending: {
                animation: lottiePending,
                duration: 0.6,
                icon: "alert",
                text: "Pagamento Pendente",
                color: "#ffe900",
                textColor: "#FFF",
            },
            approved: {
                animation: lottieCreditCardSuccess,
                duration: 1,
                icon: "success",
                text: "Pagamento Aprovado",
                color: "#4BB543",
                textColor: "#FFF",
            },
            inprocess: {
                animation: lottiePending,
                duration: 0.6,
                icon: "alert",
                text: "Pagamento em Progresso",
                color: "#ffe900",
                textColor: "#FFF",
            },
            rejected: {
                animation: lottieCreditCardError,
                duration: 1,
                icon: "error",
                text: "Pagamento Rejeitado",
                color: "#FF9494",
                textColor: "#FFF",
            },
            cancelled: {
                animation: lottieCreditCardError,
                duration: 1,
                icon: "error",
                text: "Pagamento Cancelado",
                color: "#FF9494",
                textColor: "#FFF",
            },
        },
    ];

    const updateInvitation = async (dataUser, resultInvitation, value) => {
        const resultWallet = await getWalletByUserId(
            dataUser?.guestData?.indicatorId,
        );

        await updateWallet(dataUser?.guestData?.indicatorId, {
            acumulatedValue: resultWallet.data.acumulatedValue + value,
            currentValue: resultWallet.data.currentValue + value,
        });

        await updateInvitationMoreAccepted(
            dataUser?.guestData?.indicatorId,
            resultInvitation.data.invitationsAccepted,
        );
    };

    const executeInvitationActions = async (dataUser) => {
        if (dataUser?.guestData.wasInvited) {
            const resultDataInvitationUser = await getDataUser(
                dataUser?.guestData?.indicatorId,
            );

            const resultInvitation = await VerifyIfUserInvitationExists(
                dataUser?.guestData?.indicatorId,
            );

            if (resultDataInvitationUser.guestData.fristIndication) {
                await updateInvitation(
                    dataUser,
                    resultInvitation,
                    configData.secondInvitationCredit,
                );
            } else {
                await updateInvitation(
                    dataUser,
                    resultInvitation,
                    configData.fristInvitationCredit,
                );

                await updateUserInvitationGuestStatus(
                    dataUser?.guestData?.indicatorId,
                    true,
                );
            }

            await updateUserWasInvitedStatus(dataUser.email, false);

            await SetUserStorage({
                ...dataUser,
                guestData: {
                    ...dataUser.guestData,
                    wasInvited: false,
                },
            });
        }
    };

    const actions = async () => {
        switch (params.status) {
            case "approved":
                if (dataOrder.idOrder) {
                    const dataUser = await GetUserStorage();

                    const resultSavePond = await saveShrimpPonds(
                        dataOrder.dataPublication,
                        dataUser.email,
                    );

                    if (resultSavePond) {
                        if (
                            dataOrder.dataCupomPayment?.cuponCode &&
                            dataOrder.dataCupomPayment?.cupomType === "Quantity"
                        ) {
                            await decreaseAmountCupom(
                                dataOrder.dataCupomPayment?.cuponCode,
                            );
                        } else if (
                            dataOrder.dataCupomPayment?.cuponCode &&
                            dataOrder.dataCupomPayment?.cupomType !== "Quantity"
                        ) {
                            await incrementAmountCupom(
                                dataOrder.dataCupomPayment?.cuponCode,
                            );
                        }

                        await updateOrder(dataOrder.idOrder, {
                            ...dataOrder,
                            status: params.status,
                            paymentLog: params,
                            published: true,
                        });

                        dispatch({
                            type: paymentActions.SAVE_ORDER_ACTION,
                            dataOrder: undefined,
                        });

                        if (dataWallet) {
                            await decreaseWallet(
                                dataWallet.walletId,
                                dataWallet.currentValue,
                                dataWallet.currentValue >
                                    configData.pondShrimpValue
                                    ? configData.pondShrimpValue
                                    : dataWallet.currentValue,
                            );

                            dispatch({
                                type: PaymentWalletActions.DELETE_PAYMENT_WALLET,
                            });
                        }

                        await executeInvitationActions(dataUser);

                        setTimeout(() => {
                            setAnimationStatus((data) => ({
                                ...data,
                                duration: 0.5,
                                animation: lottieSaveImage,
                                loop: false,
                            }));
                            setPreparePonds({
                                show: true,
                                status: "success",
                                color: "#4BB543",
                                textColor: "#FFF",
                            });
                            setPrepareImage({
                                show: true,
                                status: "alert",
                                color: "#ffe900",
                                textColor: "#FFF",
                            });

                            setTimeout(() => {
                                setAnimationStatus((data) => ({
                                    ...data,
                                    duration: 1,
                                    animation: lottieSend,
                                    loop: true,
                                }));
                                setPrepareImage({
                                    show: true,
                                    status: "success",
                                    color: "#4BB543",
                                    textColor: "#FFF",
                                });
                                setSendPublication({
                                    show: true,
                                    status: "alert",
                                    color: "#ffe900",
                                    textColor: "#FFF",
                                });

                                setTimeout(() => {
                                    setAnimationStatus((data) => ({
                                        ...data,
                                        duration: 1,
                                        animation: lottieSuccess,
                                        loop: false,
                                    }));
                                    setSendPublication({
                                        show: true,
                                        status: "success",
                                        color: "#4BB543",
                                        textColor: "#FFF",
                                    });
                                    setTimeout(() => {
                                        Toast.show({
                                            type: "success",
                                            text1: "Publicação realizada com sucesso!",
                                        });

                                        navigation.navigate(
                                            dataRoutes.navigation,
                                        );
                                    }, 1500);
                                }, 3000);
                            }, 3000);
                        }, 4000);
                    } else {
                        Toast.show({
                            type: "error",
                            text1: "Não foi possível publicar seu camarão!",
                            text2: "Entre em contato conosco!",
                        });

                        navigation.navigate(dataRoutes.help);
                    }
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não encontramos sua ordem de compra!",
                        text2: "Entre em contato conosco!",
                    });

                    navigation.navigate(dataRoutes.help);
                }
                break;

            case "null":
                if (!hasNavigatedToPayment.current) {
                    hasNavigatedToPayment.current = true;
                    navigation.navigate(dataRoutes.payment);
                }
                break;

            default:
                if (dataOrder.idOrder) {
                    await updateOrder(dataOrder.idOrder, {
                        ...dataOrder,
                        status: params.status,
                        paymentLog: params,
                    });

                    dispatch({
                        type: paymentActions.SAVE_ORDER_ACTION,
                        dataOrder: undefined,
                    });

                    navigation.navigate(dataRoutes.paymentOrders);
                }
                break;
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (params.payment_id !== "null") {
                switch (params.payment_type) {
                    case "account_money":
                        setAnimationStatus(animationTypes[0][params.status]);
                        break;

                    case "credit_card":
                        setAnimationStatus(animationTypes[1][params.status]);
                        break;

                    case "debit_card":
                        setAnimationStatus(animationTypes[1][params.status]);
                        break;

                    case "bank_transfer":
                        setAnimationStatus(animationTypes[0][params.status]);
                        break;

                    default:
                        setAnimationStatus(animationTypes[0][params.status]);
                        break;
                }

                setTimeout(async () => {
                    if (params.status === "approved") {
                        setAnimationStatus((data) => ({
                            ...data,
                            duration: 0.8,
                            animation: lottiePrepare,
                            loop: true,
                        }));
                        setPreparePonds({
                            show: true,
                            status: "alert",
                            color: "#ffe900",
                            textColor: "#FFF",
                        });
                    } else if (
                        params.status === "pending" ||
                        params.status === "inprocess"
                    ) {
                        if (params.payment_type === "bank_transfer") {
                            setAnimationStatus((data) => ({
                                ...data,
                                duration: 0.8,
                                animation: lottiePrepare,
                                loop: true,
                            }));
                            setVerifyPayment({
                                show: true,
                                status: "alert",
                                color: "#ffe900",
                                textColor: "#FFF",
                            });

                            let countVerifyPayment = 0;
                            let stop = false;

                            while (countVerifyPayment < 3 && stop === false) {
                                const resultOrder = await getOrderDetails(
                                    params.payment_id,
                                );

                                if (
                                    resultOrder &&
                                    resultOrder.status === "approved"
                                ) {
                                    stop = true;
                                    countVerifyPayment = 3;

                                    params.status = resultOrder.status;
                                } else {
                                    countVerifyPayment++;
                                }

                                Toast.show({
                                    type: "success",
                                    text1: `Verificando pagamento, tentativa ${countVerifyPayment}/3`,
                                });

                                await new Promise((resolve) => {
                                    setTimeout(resolve, 3000);
                                });
                            }
                        }
                    }

                    actions();
                }, 4000);
            } else {
                if (!hasNavigatedToPayment.current) {
                    hasNavigatedToPayment.current = true;
                    navigation.navigate(dataRoutes.payment);
                }
            }

            return undefined;
        }, []),
    );

    return (
        <Container>
            {animationStatus && (
                <>
                    <LottieView
                        autoPlay
                        ref={animation}
                        style={{
                            width: 350,
                            height: 350,
                        }}
                        loop={animationStatus.loop || false}
                        speed={animationStatus.duration}
                        source={animationStatus.animation}
                    />
                    <ContentInformation
                        style={BoxShadowIos}
                        color={animationStatus.color}
                    >
                        {animationStatus.icon === "alert" ? (
                            <FontAwesome
                                name="info-circle"
                                size={24}
                                color={animationStatus.textColor}
                            />
                        ) : animationStatus.icon === "success" ? (
                            <FontAwesome
                                name="check-circle-o"
                                size={24}
                                color={animationStatus.textColor}
                            />
                        ) : (
                            <FontAwesome
                                name="times-circle-o"
                                size={24}
                                color={animationStatus.textColor}
                            />
                        )}
                        <TextInformation textColor={animationStatus.textColor}>
                            {animationStatus.text}
                        </TextInformation>
                    </ContentInformation>
                    {verifyPayment.show && (
                        <ContentInformation
                            style={BoxShadowIos}
                            color={verifyPayment.color}
                        >
                            {verifyPayment.status === "alert" ? (
                                <FontAwesome
                                    name="clock-o"
                                    size={24}
                                    color={verifyPayment.textColor}
                                />
                            ) : verifyPayment.status === "success" ? (
                                <FontAwesome
                                    name="check-circle-o"
                                    size={24}
                                    color={verifyPayment.textColor}
                                />
                            ) : (
                                <FontAwesome
                                    name="times-circle-o"
                                    size={24}
                                    color={verifyPayment.textColor}
                                />
                            )}
                            <TextInformation
                                textColor={verifyPayment.textColor}
                            >
                                Verificando Pagamento
                            </TextInformation>
                        </ContentInformation>
                    )}
                    {preparePonds.show && (
                        <ContentInformation
                            style={BoxShadowIos}
                            color={preparePonds.color}
                        >
                            {preparePonds.status === "alert" ? (
                                <FontAwesome
                                    name="clock-o"
                                    size={24}
                                    color={preparePonds.textColor}
                                />
                            ) : preparePonds.status === "success" ? (
                                <FontAwesome
                                    name="check-circle-o"
                                    size={24}
                                    color={preparePonds.textColor}
                                />
                            ) : (
                                <FontAwesome
                                    name="times-circle-o"
                                    size={24}
                                    color={preparePonds.textColor}
                                />
                            )}
                            <TextInformation textColor={preparePonds.textColor}>
                                Preparando Viveiros
                            </TextInformation>
                        </ContentInformation>
                    )}
                    {prepareImage.show && (
                        <ContentInformation
                            style={BoxShadowIos}
                            color={prepareImage.color}
                        >
                            {prepareImage.status === "alert" ? (
                                <FontAwesome
                                    name="clock-o"
                                    size={24}
                                    color={prepareImage.textColor}
                                />
                            ) : prepareImage.status === "success" ? (
                                <FontAwesome
                                    name="check-circle-o"
                                    size={24}
                                    color={prepareImage.textColor}
                                />
                            ) : (
                                <FontAwesome
                                    name="times-circle-o"
                                    size={24}
                                    color={prepareImage.textColor}
                                />
                            )}
                            <TextInformation textColor={prepareImage.textColor}>
                                Salvando Imagens
                            </TextInformation>
                        </ContentInformation>
                    )}
                    {sendPublication.show && (
                        <ContentInformation
                            style={BoxShadowIos}
                            color={sendPublication.color}
                        >
                            {sendPublication.status === "alert" ? (
                                <FontAwesome
                                    name="clock-o"
                                    size={24}
                                    color={sendPublication.textColor}
                                />
                            ) : sendPublication.status === "success" ? (
                                <FontAwesome
                                    name="check-circle-o"
                                    size={24}
                                    color={sendPublication.textColor}
                                />
                            ) : (
                                <FontAwesome
                                    name="times-circle-o"
                                    size={24}
                                    color={sendPublication.textColor}
                                />
                            )}
                            <TextInformation
                                textColor={sendPublication.textColor}
                            >
                                Enviando Publicação
                            </TextInformation>
                        </ContentInformation>
                    )}
                </>
            )}
        </Container>
    );
};
