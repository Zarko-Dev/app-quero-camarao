import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { useDispatch } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { convertToMoney } from "../../utils/convertToMoney";
import { getOrderDetails } from "../../services/MercadoPago/getOrder";
import { saveUserPlan } from "../../controllers/Plans/savePlan";
import { updateOrder } from "../../controllers/Payment/order";
import {
    GetUserStorage,
    SetUserStorage,
} from "../../services/Storage/UserStorage";
import { planActions } from "../MonthlyPlan/planActions";
import { dataRoutes } from "../../routes/dataRoutes";

import {
    ButtonBackHome,
    ButtonCopyPaste,
    ButtonVerify,
    Container,
    QrCodeImage,
    TextButton,
    Title,
    TitleValue,
} from "./styles";

export const PlanQRCodePix = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const { dataQrCode, paymentLog } = route.params;
    const paymentId =
        paymentLog?.id ??
        paymentLog?.payment_id ??
        paymentLog?.data?.id ??
        paymentLog?.paymentId;

    const [copyed, setCopyed] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleCopyPaste = async () => {
        try {
            await Clipboard.setStringAsync(dataQrCode.qrCode);
            setCopyed(true);
            setTimeout(() => setCopyed(false), 10000);
        } catch {
            Toast.show({
                type: "error",
                text1: "Erro ao copiar o código PIX.",
            });
        }
    };

    const activatePlan = async (orderIdToActivate) => {
        const dataUser = await GetUserStorage();
        const resultSavePlan = await saveUserPlan(
            dataUser.email,
            orderIdToActivate,
        );

        if (!resultSavePlan.error) {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);

            await updateOrder(orderIdToActivate, {
                status: "approved",
                planActivated: true,
            });

            await SetUserStorage({
                ...dataUser,
                activePlan: {
                    active: true,
                    planId: "monthly",
                    startDate,
                    endDate,
                    orderId: orderIdToActivate,
                },
            });

            await AsyncStorage.removeItem("@PENDING_PLAN_ORDER");
            dispatch({ type: planActions.PLAN_ACTIVATED });

            Toast.show({
                type: "success",
                text1: "Plano mensal ativado com sucesso!",
            });

            navigation.navigate(dataRoutes.navigation);
        } else {
            Toast.show({
                type: "error",
                text1: "Pagamento confirmado, mas houve um erro ao ativar o plano.",
                text2: "Entre em contato conosco.",
            });
            navigation.navigate(dataRoutes.help);
        }
    };

    const handleVerifyPayment = async () => {
        if (!paymentId) {
            Toast.show({
                type: "error",
                text1: "ID não encontrado.",
                text2: `Chaves: ${Object.keys(paymentLog ?? {}).join(", ")}`,
            });
            return;
        }

        setIsVerifying(true);

        try {
            const result = await getOrderDetails(paymentId);

            if (!result) {
                Toast.show({
                    type: "error",
                    text1: "Sem resposta do Mercado Pago.",
                    text2: "Tente novamente em instantes.",
                });
                return;
            }

            // Mercado Pago retorna status numérico quando há erro na API (ex: 401, 404)
            if (typeof result.status === "number") {
                Toast.show({
                    type: "error",
                    text1: `Erro ao consultar pagamento (${result.status})`,
                    text2: result.message ?? "Verifique as credenciais do Mercado Pago.",
                });
                return;
            }

            if (result.status === "approved") {
                const storedOrderId = await AsyncStorage.getItem(
                    "@PENDING_PLAN_ORDER",
                );
                await activatePlan(storedOrderId);
            } else if (
                result.status === "pending" ||
                result.status === "in_process"
            ) {
                Toast.show({
                    type: "info",
                    text1: "Pagamento ainda não confirmado.",
                    text2: "Aguarde alguns instantes e tente novamente.",
                });
            } else {
                Toast.show({
                    type: "info",
                    text1: `Status recebido: ${result.status}`,
                    text2: "Aguarde alguns instantes e tente novamente.",
                });
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Container>
            <Title>Plano Mensal — R$ {convertToMoney(dataQrCode.value)}</Title>
            <Title>
                Escaneie o QR Code ou copie e cole o PIX para realizar o
                pagamento!
            </Title>
            <QrCodeImage
                source={{
                    uri: `data:image/png;base64,${dataQrCode.qrCodeBase64}`,
                }}
            />
            <Title>Código Copia e Cola PIX!</Title>
            <ButtonCopyPaste onPress={handleCopyPaste} copyed={copyed}>
                <TextButton>
                    {copyed ? "Copiado!" : "PIX Copia e Cola"}
                </TextButton>
            </ButtonCopyPaste>

            <ButtonVerify
                onPress={!isVerifying ? handleVerifyPayment : undefined}
                disabled={isVerifying}
            >
                {isVerifying ? (
                    <ActivityIndicator animating color="white" />
                ) : (
                    <TextButton>Já paguei, verificar pagamento</TextButton>
                )}
            </ButtonVerify>

            <ButtonBackHome
                onPress={() => navigation.navigate(dataRoutes.navigation)}
            >
                <TextButton>Voltar para a tela principal</TextButton>
            </ButtonBackHome>
        </Container>
    );
};
