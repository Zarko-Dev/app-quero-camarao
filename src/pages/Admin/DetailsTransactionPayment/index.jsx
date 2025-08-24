/* eslint-disable react/no-array-index-key */
/* eslint-disable indent */
import { convertDate } from "../../../utils/convertDate";
import { convertToMoney } from "../../../utils/convertToMoney";
import { formatKilo } from "../../../utils/formatKilo";

import {
    Container,
    ContainerPonds,
    ContainerTitleDivider,
    ContentInfo,
    Divider,
    ImageShrimp,
    InputStyle,
    SubtitleShrimp,
    Title,
    TitleShrimp,
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";

import imageEmpty from "../../../assets/images/imageEmpty.png";

export const DetailsTransactionPayment = ({ route }) => {
    const { dataTransaction } = route.params;

    const getPaymentType = (paymentType) => {
        switch (paymentType) {
            case "account_money":
                return "Saldo Mercado Pago";

            case "credit_card":
                return "Cartão de Crédito";

            case "debit_card":
                return "Cartão de Débito";

            case "bank_transfer":
                return "PIX";

            default:
                return "Não Identificado";
        }
    };

    return (
        <Container>
            <ContainerTitleDivider>
                <Title>Informações do Cliente</Title>
                <Divider />
            </ContainerTitleDivider>
            <InputStyle
                label="Ident. Pagamento Quero Camarão"
                value={dataTransaction.idOrder}
                disable
            />
            <InputStyle
                label="Responsável"
                value={`${dataTransaction.user.name} ${dataTransaction.user.surname}`}
                disable
            />
            <InputStyle
                label="E-mail"
                value={dataTransaction.user.email}
                disable
            />
            <InputStyle
                label="Contato"
                value={dataTransaction.dataPublication.contactNumber.replace(
                    "+55",
                    "",
                )}
                disable
            />
            <ContainerTitleDivider>
                <Title>Informações do Pagamento</Title>
                <Divider />
            </ContainerTitleDivider>
            <InputStyle
                label="Valor Pago"
                value={`R$ ${convertToMoney(dataTransaction.paymentValue)}`}
                disable
            />
            <InputStyle
                label="Cupom utilizado"
                value={
                    dataTransaction.dataCupomPayment
                        ? dataTransaction.dataCupomPayment.cuponCode
                        : "Nenhum cupom utilizado"
                }
                disable
            />
            <InputStyle
                label="Tipo de Pagamento"
                value={
                    dataTransaction.paymentLog?.type
                        ? "Pagamento Gratuíto"
                        : getPaymentType(
                              dataTransaction.paymentLog.payment_type,
                          )
                }
                disable
            />
            <InputStyle
                label="Situação do Pagamento"
                value="Aprovado"
                disable
            />
            <InputStyle
                label="Ident. Pagamento Mercado Pago"
                value={
                    dataTransaction.paymentLog?.type
                        ? "Pagamento Gratuíto"
                        : dataTransaction.paymentLog.payment_id
                }
                disable
            />
            <InputStyle
                label="Data do Pagamento"
                value={convertDate(dataTransaction.updatedAt)}
                disable
            />
            <ContainerTitleDivider>
                <Title>Informações da Publicação</Title>
                <Divider />
            </ContainerTitleDivider>
            <InputStyle
                label="Local dos Viveiros"
                value={dataTransaction.dataPublication.location}
                disable
            />
            <InputStyle
                label="Quantidade de Viveiros"
                value={`${dataTransaction.dataPublication.ponds}`}
                disable
            />
            {dataTransaction.dataPublication.shrimps.map((shrimp, index) => (
                <ContainerPonds style={BoxShadowIos} key={index}>
                    <ImageShrimp
                        source={
                            shrimp.imageShrimpUri
                                ? {
                                      uri: shrimp.imageShrimpUri,
                                  }
                                : imageEmpty
                        }
                    />
                    <ContentInfo>
                        <TitleShrimp>{shrimp.grammage}g</TitleShrimp>
                        <SubtitleShrimp>
                            {formatKilo(shrimp.kilo)}kg
                        </SubtitleShrimp>
                    </ContentInfo>
                </ContainerPonds>
            ))}
        </Container>
    );
};
