/* eslint-disable no-await-in-loop */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable react/no-array-index-key */

import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";

import { TextSkeleton } from "../../../../components/Skeleton/CardOrderSkeleton";

import { convertToMoney } from "../../../../utils/convertToMoney";
import { convertDate } from "../../../../utils/convertDate";
import { getOrderDetails } from "../../../../services/MercadoPago/getOrder";
import {
    deleteOrder,
    updateOrder,
} from "../../../../controllers/Payment/order";
import { convertSecondsToDate } from "../../../../utils/convertSecondsToDate";
import { dataRoutes } from "../../../../routes/dataRoutes";
import { saveShrimpPonds } from "../../../../controllers/Publication/saveShrimpPonds";
import { decreaseAmountCupom } from "../../../../controllers/Cupons/decreaseAmountCupom";
import { deletePublicationImages } from "../../../../controllers/Publication/delete";
import { incrementAmountCupom } from "../../../../controllers/Cupons/incrementAmountCupom";
import { getWalletByUserId } from "../../../../controllers/Wallet/find";
import { updateWallet } from "../../../../controllers/Wallet/update";
import { updateInvitationMoreAccepted } from "../../../../controllers/Invitations/update";
import { getDataUser } from "../../../../controllers/User/authentication";
import { VerifyIfUserInvitationExists } from "../../../../controllers/Invitations/find";
import {
    updateUserInvitationGuestStatus,
    updateUserWasInvitedStatus,
} from "../../../../controllers/User/update";
import {
    GetUserStorage,
    SetUserStorage,
} from "../../../../services/Storage/UserStorage";

import shrimpIcon from "../../../../assets/images/shrimpIcon.png";

import {
    Body,
    Container,
    ContainerActionsButton,
    ContentActionsButton,
    ContentAlertIndicator,
    ContentDateOrder,
    ContentInfoOrderValue,
    ContentOrderValue,
    ContentShrimp,
    ContentTextOrderNumber,
    ContentTextpaymentType,
    ContentTextShrimp,
    DeleteButton,
    Divider,
    Footer,
    Header,
    PaymentPostButton,
    PostButton,
    ShrimpIcon,
    TextAlert,
    TextButton,
    TextButtonDelete,
    TextDateOrder,
    TextMoney,
    TextOrderNumber,
    TextOrderValue,
    TextShrimp,
    TitleOrderNumber,
    TitleOrderValue,
    TitlePaymentType,
} from "./styles";
import { theme } from "../../../../styles/Theme";

export const CardOrder = ({ data, reload, reloadAction }) => {
    const navigation = useNavigation();

    const { configData } = useSelector((state) => state.configSystem);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPublication, setIsLoadingPublication] = useState(false);
    const [isLoadingDeleteOrder, setIsLoadingDeleteOrder] = useState(false);
    const [statusOrder, setStatusOrder] = useState({
        status: null,
        icon: null,
        color: null,
        textColor: "#fff",
        textSuccessButton: null,
    });
    const [paymentTypeOrder, setPaymentTypeOrder] = useState({
        text: null,
        icon: null,
    });
    const [showActionButtonLoad, setShowActionButtonLoad] = useState(false);
    const [showActionButtonPublish, setShowActionButtonPublish] =
        useState(false);

    const {
        idOrder,
        status,
        paymentValue,
        dataPublication: rawDataPublication,
        dataCupomPayment,
        paymentLog,
        updatedAt,
        paymentUrl,
        userId,
    } = data;

    const dataPublication = {
        ...(rawDataPublication || {}),
        shrimps: Array.isArray(rawDataPublication?.shrimps)
            ? rawDataPublication.shrimps
            : [],
    };

    const verifyIsPendingOrder = async () => {
        if (status === "pending" || status === "inprocess") {
            const resultOrder = await getOrderDetails(paymentLog.payment_id);

            if (resultOrder && resultOrder.status === "approved") {
                if (!data?.published) {
                    setStatusOrder({
                        status: "Aguardando Publicação",
                        icon: "clock-o",
                        color: theme.colors.blue,
                        textSuccessButton: null,
                    });

                    setShowActionButtonPublish(true);

                    return true;
                }

                await updateOrder(idOrder, { status: "approved" });

                setStatusOrder({
                    status: "Aprovado",
                    icon: "check-circle-o",
                    color: theme.colors.green,
                    textSuccessButton: null,
                });

                return true;
            }

            return false;
        }

        return false;
    };

    const getStatusOrder = async () => {
        const result = await verifyIsPendingOrder();

        if (!result) {
            switch (status) {
                case "pending":
                    setStatusOrder({
                        status: "Em Análise",
                        icon: "clock-o",
                        color: theme.colors.yellow,
                        textSuccessButton: null,
                    });
                    break;

                case "approved":
                    setStatusOrder({
                        status: "Aprovado",
                        icon: "check-circle-o",
                        color: theme.colors.green,
                        textSuccessButton: null,
                    });
                    break;

                case "inprocess":
                    setStatusOrder({
                        status: "Em Análise",
                        icon: "clock-o",
                        color: theme.colors.yellow,
                        textSuccessButton: null,
                    });
                    break;

                case "rejected":
                    setStatusOrder({
                        status: "Pagamento Rejeitado",
                        icon: "times-circle-o",
                        color: theme.colors.red,
                        textSuccessButton: "Pagar Novamente",
                    });
                    setShowActionButtonLoad(true);
                    break;

                case "cancelled":
                    setStatusOrder({
                        status: "Pagamento Cancelado",
                        icon: "times-circle-o",
                        color: theme.colors.red,
                        textSuccessButton: "Pagar Novamente",
                    });
                    setShowActionButtonLoad(true);
                    break;

                case "waiting":
                    setStatusOrder({
                        status: "Aguardando Pagamento",
                        icon: "hourglass-half",
                        color: "#f59e0b",
                        textColor: "#1c1917",
                        textSuccessButton: "Finalizar Pagamento",
                    });
                    setShowActionButtonLoad(true);
                    break;

                default:
                    setStatusOrder({
                        status: null,
                        icon: null,
                        color: null,
                    });
                    break;
            }
        }
    };

    const getPaymentTypeOrder = () => {
        if (paymentLog?.type) {
            setPaymentTypeOrder({
                text: "Pagamento Gratuíto",
                icon: "dollar",
            });
        } else if (paymentLog) {
            const { payment_type } = paymentLog;

            switch (payment_type) {
                case "account_money":
                    setPaymentTypeOrder({
                        text: "Carteira Digital",
                        icon: "dollar",
                    });
                    break;

                case "credit_card":
                    setPaymentTypeOrder({
                        text: "Cartão de Crédito",
                        icon: "credit-card-alt",
                    });
                    break;

                case "debit_card":
                    setPaymentTypeOrder({
                        text: "Cartão de Débito",
                        icon: "credit-card-alt",
                    });
                    break;

                case "bank_transfer":
                    setPaymentTypeOrder({
                        text: "Pix",
                        icon: "money",
                    });
                    break;

                default:
                    setPaymentTypeOrder({
                        text: null,
                        icon: null,
                    });
                    break;
            }
        }
    };

    const handleRedoPayment = () => {
        if (paymentUrl) {
            navigation.navigate(dataRoutes.paymentWeb, {
                url: paymentUrl,
            });
        }
    };

    const updateInvitation = async (dataUser, resultInvitation, value) => {
        const resultWallet = await getWalletByUserId(
            dataUser?.guestData?.indicatorId,
        );

        await updateWallet(dataUser?.guestData?.indicatorId, {
            acumulatedValue: resultWallet.data.acumulatedValue + value,
            currentValue: resultWallet.data.currentValue + value,
        });

        await updateInvitationMoreAccepted(
            resultWallet.data.currentValue,
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

    const handlePublishShrimps = async () => {
        setIsLoadingPublication(true);

        const resultSavePond = await saveShrimpPonds(dataPublication, userId);

        if (resultSavePond) {
            if (
                dataCupomPayment?.cuponCode &&
                dataCupomPayment?.cupomType === "Quantity"
            ) {
                await decreaseAmountCupom(
                    dataCupomPayment?.cuponCode,
                    dataCupomPayment?.cupomDurationValue,
                );
            } else if (
                dataCupomPayment.dataCupomPayment?.cuponCode &&
                dataCupomPayment.dataCupomPayment?.cupomType !== "Quantity"
            ) {
                await incrementAmountCupom(
                    dataCupomPayment.dataCupomPayment?.cuponCode,
                    dataCupomPayment.dataCupomPayment?.cupomUseCount,
                );
            }

            await updateOrder(idOrder, {
                status: "approved",
                published: true,
            });

            const dataUser = await GetUserStorage();

            await executeInvitationActions(dataUser);

            Toast.show({
                type: "success",
                text1: "Publicação realizada com sucesso!",
            });

            navigation.navigate(dataRoutes.home);
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível publicar seu camarão!",
                text2: "Entre em contato conosco!",
            });

            navigation.navigate(dataRoutes.help);
        }

        setIsLoadingPublication(false);
    };

    const handleDeleteOrder = async () => {
        setIsLoadingDeleteOrder(true);

        const logImages = [];

        dataPublication.shrimps.map((shrimp) => {
            if (shrimp.imageShrimpUri !== "") {
                logImages.push(shrimp.imageShrimpUri);
            }

            return null;
        });

        if (logImages.length > 0) {
            const logImagesName = [];

            logImages.map((image) => {
                logImagesName.push(
                    image.split("Shrimp%2F")[1].split("?alt=")[0],
                );

                return null;
            });

            if (logImagesName.length > 0) {
                for (let index = 0; index < logImagesName.length; index++) {
                    await deletePublicationImages(logImagesName[index]);
                }
            }
        }

        const resultDelete = await deleteOrder(idOrder);

        if (resultDelete) {
            Toast.show({
                type: "success",
                text1: "Ordem excluída com sucesso!",
            });

            setIsLoadingDeleteOrder(false);

            reloadAction(!reload);
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível excluir esta ordem!",
                text2: "Tente novamente em instantes!",
            });

            setIsLoadingDeleteOrder(false);
        }
    };

    useEffect(() => {
        const statusAction = async () => {
            setIsLoading(true);

            await getStatusOrder();

            getPaymentTypeOrder();

            setTimeout(() => {
                setIsLoading(false);
            }, 200);
        };

        statusAction();
    }, []);

    return (
        <>
            <Container>
                <Header>
                    <ContentTextOrderNumber>
                        <TitleOrderNumber>NÂº: </TitleOrderNumber>
                        {isLoading ? (
                            <TextSkeleton />
                        ) : (
                            <TextOrderNumber>{idOrder}</TextOrderNumber>
                        )}
                    </ContentTextOrderNumber>
                    <ContentAlertIndicator color={statusOrder.color}>
                        {isLoading ? (
                            <TextSkeleton />
                        ) : (
                            <FontAwesome
                                name={statusOrder.icon || "close"}
                                size={16}
                                color={statusOrder.textColor || "#fff"}
                            />
                        )}
                        <TextAlert textColor={statusOrder.textColor}>{statusOrder.status}</TextAlert>
                    </ContentAlertIndicator>
                </Header>
                <Body>
                    <ContentOrderValue>
                        <TitleOrderValue>Valor Pago</TitleOrderValue>
                        {isLoading ? (
                            <TextSkeleton />
                        ) : (
                            <ContentInfoOrderValue>
                                <TextMoney>R$</TextMoney>
                                <TextOrderValue>
                                    {convertToMoney(paymentValue)}
                                </TextOrderValue>
                            </ContentInfoOrderValue>
                        )}
                    </ContentOrderValue>
                    <Divider />
                    <ContentShrimp count={dataPublication.shrimps.length}>
                        {dataPublication.shrimps.map((shrimp, index) =>
                            isLoading ? (
                                <TextSkeleton key={index} />
                            ) : (
                                <ContentTextShrimp key={index}>
                                    <ShrimpIcon source={shrimpIcon} />
                                    <TextShrimp
                                        count={dataPublication.shrimps.length}
                                    >
                                        {shrimp.grammage}g/{shrimp.kilo}kg
                                    </TextShrimp>
                                </ContentTextShrimp>
                            ),
                        )}
                    </ContentShrimp>
                </Body>
                <Footer>
                    {isLoading ? (
                        <TextSkeleton />
                    ) : (
                        <ContentTextpaymentType>
                            <FontAwesome
                                name={paymentTypeOrder.icon}
                                size={20}
                                color="black"
                            />
                            <TitlePaymentType>
                                {paymentTypeOrder.text}
                            </TitlePaymentType>
                        </ContentTextpaymentType>
                    )}
                    {isLoading ? (
                        <TextSkeleton />
                    ) : (
                        <ContentDateOrder>
                            <TextDateOrder>
                                {convertDate(
                                    convertSecondsToDate(updatedAt.seconds),
                                )}
                            </TextDateOrder>
                        </ContentDateOrder>
                    )}
                </Footer>
            </Container>
            <ContainerActionsButton>
                {showActionButtonLoad && (
                    <ContentActionsButton>
                        <DeleteButton onPress={handleDeleteOrder}>
                            {!isLoadingDeleteOrder ? (
                                <TextButtonDelete>Excluir Ordem</TextButtonDelete>
                            ) : (
                                <ActivityIndicator animating color="#c0392b" />
                            )}
                        </DeleteButton>
                        <PaymentPostButton onPress={handleRedoPayment}>
                            <TextButton>
                                {statusOrder.textSuccessButton}
                            </TextButton>
                        </PaymentPostButton>
                    </ContentActionsButton>
                )}
                {showActionButtonPublish && (
                    <PostButton onPress={handlePublishShrimps}>
                        {!isLoadingPublication ? (
                            <TextButton>Publicar Viveiro</TextButton>
                        ) : (
                            <ActivityIndicator animating color="white" />
                        )}
                    </PostButton>
                )}
            </ContainerActionsButton>
        </>
    );
};
