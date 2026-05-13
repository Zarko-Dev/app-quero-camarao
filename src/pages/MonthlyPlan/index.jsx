import { useState } from "react";
import { useDispatch } from "react-redux";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { dataRoutes } from "../../routes/dataRoutes";
import {
    deleteOrder,
    getPaymentPix,
    savePaymentOrder,
    updateOrder,
} from "../../controllers/Payment/order";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { DialogComponent } from "../../components/Dialog";
import { planActions } from "./planActions";

import {
    BackButton,
    BackButtonText,
    BenefitIconWrapper,
    BenefitRow,
    BenefitText,
    BenefitsTitle,
    ButtonText,
    Container,
    DisclaimerText,
    Divider,
    PlanBadge,
    PlanBadgeText,
    PlanCard,
    PlanPrice,
    PlanPriceLabel,
    PlanTitle,
    ScrollContent,
    SubscribeButton,
} from "./styles";

const PLAN_VALUE = 98;

const benefits = [
    "Publicação de até 5 viveiros",
    "Programa de gestão com inteligência artificial",
];

export const MonthlyPlan = ({ navigation }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [showNoCpfDialog, setShowNoCpfDialog] = useState(false);

    const handleSubscribePix = async () => {
        if (process.env.STATUS_PROJECT !== "production") {
            Toast.show({
                type: "info",
                text1: "Ambiente de TESTE!",
                text2: "Pagamento desabilitado fora do ambiente de produção.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const dataUser = await GetUserStorage();

            if (!dataUser.cpf) {
                setShowNoCpfDialog(true);
                return;
            }

            const cpf = dataUser.cpf.replace(/[^0-9]/g, "");
            const rawPhone = (dataUser.phone ?? "").replace(/[^0-9]/g, "");

            const idOrder = `ord-${Math.floor(Date.now() / 1000)}`;

            const dataOrder = {
                idOrder,
                userId: dataUser.email,
                paymentValue: PLAN_VALUE,
                orderType: "monthlyPlan",
                user: {
                    name: dataUser.name.split(" ")[0],
                    surname: dataUser.name.split(" ").slice(1).join(" "),
                    cpf,
                    phone: {
                        ddd: rawPhone.substring(0, 2),
                        number: rawPhone.substring(2),
                    },
                    email: dataUser.email,
                    address: {
                        zip_code:
                            dataUser.address?.cep?.replace("-", "") ?? "",
                        street_name: dataUser.address?.street ?? "",
                        street_number: Number(
                            dataUser.address?.number?.replace(
                                /[^0-9]/g,
                                "",
                            ) ?? 0,
                        ),
                    },
                },
                status: "waiting",
            };

            const resultCreateOrder = await savePaymentOrder(dataOrder);

            if (!resultCreateOrder) {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível criar a ordem de pagamento!",
                    text2: "Tente novamente em instantes!",
                });
                return;
            }

            const resultDataPix = await getPaymentPix(idOrder);

            if (resultDataPix.error) {
                await deleteOrder(idOrder);
                Toast.show({
                    type: "error",
                    text1: resultDataPix.message ?? "Erro ao gerar PIX!",
                    text2: "Tente novamente em instantes!",
                });
                return;
            }

            await updateOrder(idOrder, {
                paymentLog: resultDataPix.data.paymentLog,
            });

            dispatch({
                type: planActions.PLAN_ORDER_PENDING,
                orderId: idOrder,
            });

            await AsyncStorage.setItem("@PENDING_PLAN_ORDER", idOrder);

            navigation.navigate(dataRoutes.planQrCodePix, {
                dataQrCode: resultDataPix.data.dataQrCode,
                paymentLog: resultDataPix.data.paymentLog,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <ScrollContent>
                <BackButton onPress={() => navigation.navigate(dataRoutes.home)}>
                    <Feather name="arrow-left" size={22} color="#F05829" />
                    <BackButtonText>Voltar</BackButtonText>
                </BackButton>
                <PlanCard>
                    <PlanBadge>
                        <PlanBadgeText>MENSAL</PlanBadgeText>
                    </PlanBadge>

                    <PlanTitle>Plano Quero Camarão</PlanTitle>
                    <PlanPrice>R$ 98,00</PlanPrice>
                    <PlanPriceLabel>por mês</PlanPriceLabel>

                    <Divider />

                    <BenefitsTitle>O que está incluso</BenefitsTitle>

                    {benefits.map((benefit) => (
                        <BenefitRow key={benefit}>
                            <BenefitIconWrapper>
                                <FontAwesome
                                    name="check-circle"
                                    size={22}
                                    color="#F05829"
                                />
                            </BenefitIconWrapper>
                            <BenefitText>{benefit}</BenefitText>
                        </BenefitRow>
                    ))}
                </PlanCard>

                <SubscribeButton
                    onPress={!isLoading ? handleSubscribePix : undefined}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator animating color="white" />
                    ) : (
                        <ButtonText>Assinar com PIX</ButtonText>
                    )}
                </SubscribeButton>

                <DisclaimerText>
                    Pagamento único mensal via PIX. Plano válido por 30 dias
                    após a confirmação do pagamento.
                </DisclaimerText>
            </ScrollContent>

            <DialogComponent
                visible={showNoCpfDialog}
                title="CPF não cadastrado!"
                text="Para assinar o plano via PIX, é necessário cadastrar seu CPF nos dados pessoais."
                textActionButton="Ir para dados pessoais"
                hideDialog={() => setShowNoCpfDialog(false)}
                actionButton={() => {
                    setShowNoCpfDialog(false);
                    navigation.navigate(dataRoutes.personalData);
                }}
                dismissable={false}
            />
        </Container>
    );
};
