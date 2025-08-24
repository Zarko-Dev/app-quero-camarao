import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { convertToMoney } from "../../utils/convertToMoney";

import {
    ButtonBackHome,
    ButtonCopyPaste,
    Container,
    QrCodeImage,
    TextButton,
    Title,
    TitleValue,
} from "./styles";
import { dataRoutes } from "../../routes/dataRoutes";

export const QRCodePix = ({ route, navigation }) => {
    const { dataQrCode } = route.params;

    const [copyed, setCopyed] = useState(false);

    const handleCopyPaste = async () => {
        try {
            await Clipboard.setStringAsync(dataQrCode.qrCode);
            setCopyed(true);

            setTimeout(() => {
                setCopyed(false);
            }, 10000);
        } catch (error) {
            console.error(
                "Erro ao copiar para a área de transferência:",
                error,
            );
        }
    };

    return (
        <Container>
            <Title>Valor da publicação do Camarão!</Title>
            <TitleValue>R$ {convertToMoney(dataQrCode.value)}</TitleValue>
            <Title>
                Escaneie o QR Code ou copie e cole o PIX para realizar o
                pagamento!
            </Title>
            <QrCodeImage
                source={{
                    uri: `data:image/png;base64,${dataQrCode.qrCodeBase64}`,
                }}
            />
            <Title>Código Copia e cola PIX!</Title>
            <ButtonCopyPaste onPress={handleCopyPaste} copyed={copyed}>
                <TextButton>
                    {copyed ? "Copiado!" : "PIX Copia e Cola"}
                </TextButton>
            </ButtonCopyPaste>
            <ButtonBackHome
                onPress={() => navigation.navigate(dataRoutes.navigation)}
            >
                <TextButton>Voltar para a tela principal!</TextButton>
            </ButtonBackHome>
        </Container>
    );
};
