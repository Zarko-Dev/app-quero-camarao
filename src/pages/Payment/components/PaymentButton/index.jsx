/* eslint-disable operator-linebreak */
/* eslint-disable no-await-in-loop */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";

import {
    GetUserStorage,
    SetUserStorage,
} from "../../../../services/Storage/UserStorage";
import { formatphone } from "../../../../utils/formatPhone";
import { dataRoutes } from "../../../../routes/dataRoutes";
import { savePondsImages } from "../../../../controllers/Publication/savePondsImages";
import {
    deleteOrder,
    getPaymentPix,
    getPaymentUrl,
    savePaymentOrder,
    savePublicationPaymentOrder,
    savePublicationPaymentPixOrder,
    updateOrder,
} from "../../../../controllers/Payment/order";
import { paymentActions } from "../../actions";
import { saveShrimpPonds } from "../../../../controllers/Publication/saveShrimpPonds";
import { decreaseAmountCupom } from "../../../../controllers/Cupons/decreaseAmountCupom";
import {
    decreaseWallet,
    updateWallet,
} from "../../../../controllers/Wallet/update";
import { incrementAmountCupom } from "../../../../controllers/Cupons/incrementAmountCupom";
import { DialogComponent } from "../../../../components/Dialog";
import { getDataUser } from "../../../../controllers/User/authentication";
import { getWalletByUserId } from "../../../../controllers/Wallet/find";
import { updateInvitationMoreAccepted } from "../../../../controllers/Invitations/update";
import { VerifyIfUserInvitationExists } from "../../../../controllers/Invitations/find";
import {
    updateUserInvitationGuestStatus,
    updateUserWasInvitedStatus,
} from "../../../../controllers/User/update";
import { PaymentWalletActions } from "../ResumeCrad/actions";

import { Container, TitleButton } from "./styles";
import { BoxShadowIos } from "../../../../styles/IosShadow";
import { SelectPaymentFormModal } from "../SelectPaymentoFormModal";

export const PaymentButton = ({ loading }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { dataPayment } = useSelector((state) => state.publication);
    const { dataOrder } = useSelector((state) => state.payment);
    const { dataWallet } = useSelector((state) => state.paymentWallet);
    const { configData } = useSelector((state) => state.configSystem);

    const [isLoading, setIsLoading] = useState(false);
    const [showAlertPaymentDevelop, setAlertPaymentdevelop] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const hadleRedirectAddress = async () => {
        const dataUser = await GetUserStorage();

        setDialogVisible(false);

        navigation.navigate(dataRoutes.address, {
            dataUser,
        });
    };

    const generateDataPublication = async (dataUser) => {
        const dataUrlImage = [];

        const ponds = dataPayment?.dataPonds ?? [];
        for (let index = 0; index < ponds.length; index++) {
            if (ponds[index].imageShrimpUri) {
                const urlImage = await savePondsImages(
                    ponds[index].imageShrimpUri,
                );
                dataUrlImage.push(urlImage.urlImage);
            } else {
                dataUrlImage.push("");
            }
        }

        const newDataPonds = {
            id: v4(),
            ponds: dataPayment?.dataPonds?.length ?? 0,
            location: `${dataPayment.city}/${dataPayment.state}`,
            contactNumber: `+55${formatphone(dataUser.phone)}`,
            shrimps: (dataPayment?.dataPonds ?? []).map((pond, index) => ({
                imageShrimpUri: dataUrlImage[index],
                grammage: pond.grammage,
                kilo: pond.kilo,
            })),
        };

        return newDataPonds;
    };

    const generateDataCupomPayment = () => {
        if (dataPayment?.cuponCode) {
            if (dataPayment.cupomType === "Quantity") {
                return {
                    cupomDurationValue: dataPayment.cupomDurationValue,
                    cupomType: dataPayment.cupomType,
                    cuponCode: dataPayment.cuponCode,
                };
            }

            return {
                cupomDurationValue: dataPayment.cupomDurationValue,
                cupomType: dataPayment.cupomType,
                cuponCode: dataPayment.cuponCode,
                cupomUseCount: dataPayment.cupomUseCount,
            };
        }

        return null;
    };

    const createOrder = async (dataUser) => {
        const idOrder = `ord-${Math.floor(Date.now() / 1000)}`;

        const dataConfigureOrder = {
            idOrder,
            userId: dataUser.email,
            paymentValue: dataPayment.resumeConfig.total,
            user: {
                name: dataUser.name.split(" ")[0],
                surname: dataUser.name.split(" ").slice(1).join(" "),
                email: dataUser.email,
                address: {
                    zip_code: dataUser.address?.cep.replace("-", "") ?? "",
                    street_name: dataUser.address?.street ?? "",
                    street_number: Number(
                        dataUser.address?.number.replace(/[^0-9]/g, "") ?? 0,
                    ),
                },
            },
            status: "waiting",
        };

        const resultCreateOrder = await savePaymentOrder(dataConfigureOrder);

        return { resultCreateOrder, idOrder, dataConfigureOrder };
    };

    const createPixOrder = async (dataUser) => {
        const idOrder = `ord-${Math.floor(Date.now() / 1000)}`;

        const dataConfigureOrder = {
            idOrder,
            userId: dataUser.email,
            paymentValue: dataPayment.resumeConfig.total,
            user: {
                name: dataUser.name.split(" ")[0],
                surname: dataUser.name.split(" ").slice(1).join(" "),
                cpf: dataUser.cpf,
                phone: dataUser.phone,
                email: dataUser.email,
                address: {
                    zip_code: dataUser.address?.cep.replace("-", "") ?? "",
                    street_name: dataUser.address?.street ?? "",
                    street_number: Number(
                        dataUser.address?.number.replace(/[^0-9]/g, "") ?? 0,
                    ),
                },
            },
            status: "waiting",
        };

        const resultCreateOrder = await savePaymentOrder(dataConfigureOrder);

        return { resultCreateOrder, idOrder, dataConfigureOrder };
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

    const publicationPondsShrimp = async (dataUser, dataValidOrder) => {
        const resultSavePond = await saveShrimpPonds(
            dataValidOrder.dataPublication,
            dataUser.email,
        );

        if (resultSavePond) {
            if (
                dataValidOrder.dataCupomPayment?.cuponCode &&
                dataValidOrder.dataCupomPayment?.cupomType === "Quantity"
            ) {
                await decreaseAmountCupom(
                    dataValidOrder.dataCupomPayment?.cuponCode,
                    dataValidOrder.dataCupomPayment?.cupomDurationValue,
                );
            } else if (
                dataValidOrder.dataCupomPayment?.cuponCode &&
                dataValidOrder.dataCupomPayment?.cupomType !== "Quantity"
            ) {
                await incrementAmountCupom(
                    dataValidOrder.dataCupomPayment?.cuponCode,
                    dataValidOrder.dataCupomPayment?.cupomUseCount,
                );
            }

            await updateOrder(dataValidOrder.idOrder, {
                ...dataValidOrder,
                status: "approved",
                paymentLog: {
                    type: "No payment",
                    status: "approved",
                    message: "Pagamento gratuíto",
                },
            });

            if (dataWallet) {
                await decreaseWallet(
                    dataWallet.walletId,
                    dataWallet.currentValue,
                    dataWallet.currentValue > configData.pondShrimpValue
                        ? configData.pondShrimpValue
                        : dataWallet.currentValue,
                );

                dispatch({ type: PaymentWalletActions.DELETE_PAYMENT_WALLET });
            }

            await executeInvitationActions(dataUser);

            dispatch({
                type: paymentActions.SAVE_ORDER_ACTION,
                dataOrder: undefined,
            });

            Toast.show({
                type: "success",
                text1: "Publicação realizada com sucesso!",
            });

            navigation.navigate(dataRoutes.navigation);
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível publicar seu camarão!",
                text2: "Entre em contato conosco!",
            });

            navigation.navigate(dataRoutes.help);
        }
    };

    const handleExecutePayment = async () => {
        if (process.env.STATUS_PROJECT !== "production") {
            setAlertPaymentdevelop(true);
        } else {
            setIsLoading(true);

            const dataUser = await GetUserStorage();

            if (dataUser.address) {
                if (dataPayment.resumeConfig.total === 0) {
                    const { resultCreateOrder, idOrder, dataConfigureOrder } =
                        await createOrder(dataUser);

                    if (resultCreateOrder) {
                        const dataPublication =
                            await generateDataPublication(dataUser);

                        const resultSavePublicationOrder =
                            await savePublicationPaymentOrder(
                                idOrder,
                                null,
                                dataPublication,
                                generateDataCupomPayment(),
                            );

                        if (resultSavePublicationOrder) {
                            const dataValidOrder = {
                                ...dataConfigureOrder,
                                paymentUrl: null,
                                dataCupomPayment: generateDataCupomPayment(),
                                dataPublication,
                            };

                            dispatch({
                                type: paymentActions.SAVE_ORDER_ACTION,
                                dataOrder: dataValidOrder,
                            });

                            await publicationPondsShrimp(
                                dataUser,
                                dataValidOrder,
                            );
                        } else {
                            Toast.show({
                                type: "error",
                                text1: "Não foi possível savar sua publicação na ordem de pagamento",
                                text2: "Tente novamente em instantes!",
                            });
                            deleteOrder(idOrder);
                        }
                    } else {
                        Toast.show({
                            type: "error",
                            text1: "Não foi possível criar a ordem de pagamento!",
                            text2: "Tente novamente em instantes!",
                        });
                    }
                } else if (dataOrder) {
                    navigation.navigate(dataRoutes.paymentWeb, {
                        url: dataOrder.paymentUrl,
                    });
                } else {
                    const { resultCreateOrder, idOrder, dataConfigureOrder } =
                        await createOrder(dataUser);

                    if (resultCreateOrder) {
                        const resultUrl = await getPaymentUrl(idOrder);

                        if (!resultUrl.error) {
                            const dataPublication =
                                await generateDataPublication(dataUser);

                            const resultSavePublicationOrder =
                                await savePublicationPaymentOrder(
                                    idOrder,
                                    resultUrl.data.paymentUrl,
                                    dataPublication,
                                    generateDataCupomPayment(),
                                );

                            if (resultSavePublicationOrder) {
                                dispatch({
                                    type: paymentActions.SAVE_ORDER_ACTION,
                                    dataOrder: {
                                        ...dataConfigureOrder,
                                        paymentUrl: resultUrl.data.paymentUrl,
                                        dataCupomPayment:
                                            generateDataCupomPayment(),
                                        dataPublication,
                                    },
                                });

                                navigation.navigate(dataRoutes.paymentWeb, {
                                    url: resultUrl.data.paymentUrl,
                                });
                            } else {
                                Toast.show({
                                    type: "error",
                                    text1: "Não foi possível savar sua publicação na ordem de pagamento",
                                    text2: "Tente novamente em instantes!",
                                });
                                deleteOrder(idOrder);
                            }
                        } else {
                            Toast.show({
                                type: "error",
                                text1: resultUrl.message,
                                text2: "Tente novamente em instantes!",
                            });
                            deleteOrder(idOrder);
                        }
                    } else {
                        Toast.show({
                            type: "error",
                            text1: "Não foi possível criar a ordem de pagamento!",
                            text2: "Tente novamente em instantes!",
                        });
                    }
                }
            } else {
                setDialogVisible(true);
            }

            setIsLoading(false);
        }
    };

    const showModalPayment = () => {
        if (dataPayment.resumeConfig.total === 0) {
            handleExecutePayment();
        } else {
            setModalVisible(true);
        }
    };

    const handlePaymentPix = async () => {
        setIsLoading(true);

        const dataUser = await GetUserStorage();

        const cpf = dataUser.cpf.replace(/[^0-9]/g, "");
        const phone = dataUser.phone.replace(/[^0-9]/g, "");

        const { resultCreateOrder, idOrder, dataConfigureOrder } =
            await createPixOrder({
                ...dataUser,
                cpf,
                phone: {
                    ddd: phone.substring(0, 2),
                    number: phone.substring(2, phone.length),
                },
            });

        if (resultCreateOrder) {
            const resultDataPix = await getPaymentPix(idOrder);

            if (!resultDataPix.error) {
                const dataPublication = await generateDataPublication(dataUser);

                const resultSavePublicationOrder =
                    await savePublicationPaymentPixOrder(
                        idOrder,
                        resultDataPix.data.paymentLog,
                        dataPublication,
                        generateDataCupomPayment(),
                    );

                if (resultSavePublicationOrder) {
                    dispatch({
                        type: paymentActions.SAVE_ORDER_ACTION,
                        dataOrder: {
                            ...dataConfigureOrder,
                            paymentLog: resultDataPix.data.paymentLog,
                            dataCupomPayment: generateDataCupomPayment(),
                            dataPublication,
                        },
                    });

                    navigation.navigate(dataRoutes.qrCodePix, {
                        dataQrCode: resultDataPix.data.dataQrCode,
                    });
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível savar sua publicação na ordem de pagamento",
                        text2: "Tente novamente em instantes!",
                    });
                    deleteOrder(idOrder);
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: resultDataPix.message,
                    text2: "Tente novamente em instantes!",
                });
                deleteOrder(idOrder);
            }
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível criar a ordem de pagamento!",
                text2: "Tente novamente em instantes!",
            });
        }

        setIsLoading(false);
    };

    return (
        <Container
            style={BoxShadowIos}
            onPress={!isLoading && !loading ? showModalPayment : () => {}}
        >
            {!isLoading && !loading ? (
                <TitleButton>Realizar Pagamento</TitleButton>
            ) : (
                <ActivityIndicator animating color="white" />
            )}
            <DialogComponent
                visible={showAlertPaymentDevelop}
                title="Ambiente de TESTE!"
                text="Para a segurança dos dados o pagamento foi DESABILITADO para o ambiente de TESTE, em breve será habilitado!"
                textActionButton="Ok"
                hideDialog={() => setAlertPaymentdevelop(false)}
                actionButton={() => setAlertPaymentdevelop(false)}
                dismissable={false}
                showCancelButton={false}
            />
            <DialogComponent
                visible={dialogVisible}
                title="Endereço não cadastrado!"
                text="É necessário realizar o cadastro do endereço para continuar?"
                textActionButton="Cadastrar"
                hideDialog={() => setDialogVisible(false)}
                actionButton={hadleRedirectAddress}
                dismissable={false}
            />
            <SelectPaymentFormModal
                modalVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                pixAction={handlePaymentPix}
                otherPaymentAction={handleExecutePayment}
            />
        </Container>
    );
};
