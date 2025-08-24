/* eslint-disable operator-linebreak */
/* eslint-disable no-case-declarations */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { convertToMoney } from "../../../../utils/convertToMoney";
import { PublicationActions } from "../../../Publication/actions";
import { GetUserStorage } from "../../../../services/Storage/UserStorage";
import { getWalletByUserId } from "../../../../controllers/Wallet/find";

import { verifyIfCupomExists } from "../../../../controllers/Cupons/getCupom";
import { validateCupom } from "./controller/validateCupom";
import { DialogComponent } from "../../../../components/Dialog";
import { CupomModal } from "./CupomModal";

import {
    ButtonCupom,
    Container,
    ContainerInfo,
    ContentInfo,
    Divider,
    TitleInfo,
    TitleInfoTotal,
    TitleResume,
    TitleValue,
    TitleValueTotal,
} from "./styles";
import { PaymentWalletActions } from "./actions";
import { getDefaultCouponCode } from "../../../../controllers/Cupons/defaultCoupon";

export const ResumeCrad = ({ loading, actionLoading }) => {
    const dispatch = useDispatch();

    const { configData } = useSelector((state) => state.configSystem);

    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [dataCupomCode, setDataCupomCode] = useState();
    const [dataCupomType, setDataCupomType] = useState();
    const [dataCupomDurationValue, setDataCupomDurationValue] = useState();
    const [dataCupomUseCount, setDataCupomUseCount] = useState();
    const [walletValue, setWalletValue] = useState();

    const { dataPayment } = useSelector((state) => state.publication);
    const [dataPaymentCopy, setDataPaymentCopy] = useState(dataPayment);

    useEffect(() => {
        if (dataCupomCode) {
            if (dataCupomUseCount !== undefined) {
                dispatch({
                    type: PublicationActions.SET_DATA_PAYMENT_CUPON_CODE_COUNT_ACTION,
                    cuponCode: dataCupomCode,
                    cupomType: dataCupomType,
                    cupomDurationValue: dataCupomDurationValue,
                    cupomUseCount: dataCupomUseCount,
                });
            } else {
                dispatch({
                    type: PublicationActions.SET_DATA_PAYMENT_CUPON_CODE_ACTION,
                    cuponCode: dataCupomCode,
                    cupomType: dataCupomType,
                    cupomDurationValue: dataCupomDurationValue,
                });
            }
        }
    }, [dataCupomCode]);

    useEffect(() => {
        dispatch({
            type: PublicationActions.UPDATE_ALL_DATA_PAYMENT_ACTION,
            dataPayment: dataPaymentCopy,
        });
    }, [dataPaymentCopy]);

    const applyDiscount = (dataCupom) => {
        const { discountType, discountValue } = dataCupom;

        switch (discountType) {
            case "Percentage":
                const discountPercentage =
                    (dataPaymentCopy.resumeConfig.total *
                        Number(discountValue)) /
                    100;
                const newTotalPercentage =
                    dataPaymentCopy.resumeConfig.total - discountPercentage;

                setDataPaymentCopy((data) => ({
                    ...data,
                    resumeConfig: {
                        ...data.resumeConfig,
                        discounts:
                            data.resumeConfig.discounts + discountPercentage,
                        total: newTotalPercentage < 0 ? 0 : newTotalPercentage,
                    },
                }));

                return null;

            case "Value":
                const newTotalValue =
                    dataPaymentCopy.resumeConfig.total - Number(discountValue);

                setDataPaymentCopy((data) => ({
                    ...data,
                    resumeConfig: {
                        ...data.resumeConfig,
                        discounts:
                            data.resumeConfig.discounts + Number(discountValue),
                        total: newTotalValue < 0 ? 0 : newTotalValue,
                    },
                }));

                return null;

            case "QuantityPonds":
                const pondValue = configData.pondShrimpValue;
                let finalValue = 0;

                for (let index = 0; index < discountValue; index++) {
                    if (index < dataPaymentCopy.dataPonds.length) {
                        if (index === 0) {
                            finalValue += pondValue;
                        } else {
                            finalValue += pondValue / 2;
                        }
                    }
                }

                const newTotalQuantityPonds =
                    dataPaymentCopy.resumeConfig.total - finalValue;

                setDataPaymentCopy((data) => ({
                    ...data,
                    resumeConfig: {
                        ...data.resumeConfig,
                        discounts: data.resumeConfig.discounts + finalValue,
                        total:
                            newTotalQuantityPonds < 0
                                ? 0
                                : newTotalQuantityPonds,
                    },
                }));

                return null;

            default:
                return null;
        }
    };

    const handleUseCupomCode = async (cupomCode, isDefault) => {
        const dataCupom = await verifyIfCupomExists(cupomCode);

        if (dataCupom.error) {
            Toast.show({ type: "error", text1: "Cupom Inválido!" });
        } else if (validateCupom(dataCupom.data)) {
            if ("useCount" in dataCupom.data) {
                setDataCupomUseCount(dataCupom.data.useCount);
            }

            applyDiscount(dataCupom.data);
            setDataCupomType(dataCupom.data.durationType);
            setDataCupomDurationValue(dataCupom.data.durationValue);
            setDataCupomCode(cupomCode);
        } else {
            Toast.show({
                type: "error",
                text1: isDefault
                    ? "Cupom principal expirado!"
                    : "Cupom Expirado!",
            });
        }
    };

    useEffect(() => {
        const getDefaultCoupon = async () => {
            Toast.show({
                type: "info",
                text1: "Buscando cupons!",
            });

            const result = await getDefaultCouponCode();

            if (!result.error) {
                await handleUseCupomCode(result.data.cupomCode);

                Toast.show({
                    type: "success",
                    text1: "Cupom aplicado!",
                });
            }
        };

        const walletAction = async () => {
            actionLoading(true);

            const dataUser = await GetUserStorage();

            if (dataUser?.guestData?.wasInvited) {
                const newTotalValue =
                    dataPaymentCopy.resumeConfig.total -
                    configData.invitationDiscount;

                setWalletValue(configData.invitationDiscount);

                setDataPaymentCopy((data) => ({
                    ...data,
                    resumeConfig: {
                        ...data.resumeConfig,
                        discounts:
                            data.resumeConfig.discounts +
                            configData.invitationDiscount,
                        total: newTotalValue < 0 ? 0 : newTotalValue,
                    },
                }));

                Toast.show({
                    type: "success",
                    text1: "Desconto de primeira compra aplicado!",
                });
            } else {
                Toast.show({
                    type: "success",
                    text1: "Buscando créditos na carteira!",
                });

                const resultWallet = await getWalletByUserId(dataUser.email);

                if (!resultWallet.error && resultWallet.data.currentValue > 0) {
                    let dataWalletValue;

                    dispatch({
                        type: PaymentWalletActions.SAVE_PAYMENT_WALLET,
                        dataWallet: {
                            walletId: dataUser.email,
                            acumulatedValue: resultWallet.data.acumulatedValue,
                            currentValue: resultWallet.data.currentValue,
                        },
                    });

                    if (
                        resultWallet.data.currentValue >
                        configData.pondShrimpValue
                    ) {
                        setWalletValue(configData.pondShrimpValue);
                        dataWalletValue = configData.pondShrimpValue;
                    } else {
                        setWalletValue(resultWallet.data.currentValue);
                        dataWalletValue = resultWallet.data.currentValue;
                    }

                    const newTotalValue =
                        dataPaymentCopy.resumeConfig.total - dataWalletValue;

                    setDataPaymentCopy((data) => ({
                        ...data,
                        resumeConfig: {
                            ...data.resumeConfig,
                            discounts:
                                data.resumeConfig.discounts + dataWalletValue,
                            total: newTotalValue < 0 ? 0 : newTotalValue,
                        },
                    }));

                    Toast.show({
                        type: "success",
                        text1: "Crédito da carteira aplicado com sucesso!",
                    });
                } else {
                    await getDefaultCoupon();
                }
            }

            actionLoading(false);
        };

        walletAction();
    }, []);

    const handleOpenCupomModal = () => {
        if (dataCupomCode) {
            setShowAlertVisible(true);
        } else {
            setModalVisible(true);
        }
    };

    const handleActionButtonDialogNewCupom = () => {
        const discounts =
            dataPayment.dataPonds.length > 1
                ? (dataPayment.dataPonds.length - 1) * 60
                : 0;

        const newDataPayment = {
            ...dataPayment,
            resumeConfig: {
                discounts,
                subtotal: dataPayment.resumeConfig.subtotal,
                total: dataPayment.resumeConfig.subtotal - discounts,
            },
        };

        setDataPaymentCopy(newDataPayment);
        setDataCupomType();
        setDataCupomDurationValue();
        setDataCupomCode();
        setShowAlertVisible(false);
        setModalVisible(true);
    };

    return (
        <Container>
            <TitleResume>Resumo</TitleResume>
            <Divider />
            <ContainerInfo>
                <ContentInfo>
                    <TitleInfo>Subtotal</TitleInfo>
                    <TitleValue>
                        R${" "}
                        {convertToMoney(dataPaymentCopy.resumeConfig.subtotal)}
                    </TitleValue>
                </ContentInfo>
                {!walletValue && !loading && (
                    <ContentInfo>
                        <TitleInfo>Cupom de desconto</TitleInfo>
                        <ButtonCupom onPress={handleOpenCupomModal}>
                            {dataCupomCode ? (
                                <>
                                    <TitleValue>{dataCupomCode}</TitleValue>
                                    <Feather
                                        name="chevron-right"
                                        size={15}
                                        color="black"
                                    />
                                </>
                            ) : (
                                <>
                                    <TitleValue>
                                        Digite o código aqui{" "}
                                    </TitleValue>
                                    <Feather
                                        name="chevron-right"
                                        size={15}
                                        color="black"
                                    />
                                </>
                            )}
                        </ButtonCupom>
                    </ContentInfo>
                )}
                <ContentInfo>
                    <TitleInfo>Desconto</TitleInfo>
                    <TitleValue>
                        - R${" "}
                        {convertToMoney(dataPaymentCopy.resumeConfig.discounts)}
                    </TitleValue>
                </ContentInfo>
                <ContentInfo>
                    <TitleInfoTotal>Total</TitleInfoTotal>
                    <TitleValueTotal>
                        R$ {convertToMoney(dataPaymentCopy.resumeConfig.total)}
                    </TitleValueTotal>
                </ContentInfo>
            </ContainerInfo>
            <CupomModal
                modalVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                action={handleUseCupomCode}
            />
            <DialogComponent
                visible={showAlertVisible}
                title="Adicionar outro cupom?"
                text="O cupom atual será excluído!"
                textActionButton="Adicionar"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => handleActionButtonDialogNewCupom()}
                dismissable={false}
            />
        </Container>
    );
};
