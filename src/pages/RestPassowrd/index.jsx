import { useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { dataRoutes } from "../../routes/dataRoutes";
import { resetUserPassword } from "../../controllers/User/resetPassword";
import { isValidEmail } from "../../utils/ValidationEmail";

import { Input } from "../../components/Input";
import { DialogComponent } from "../../components/Dialog";

import originalLogo from "../../assets/images/originalLogo.png";

import {
    ButtonLogin,
    ButtonRegister,
    Container,
    ContentFormLogin,
    ContentTextRegister,
    Footer,
    LogoImage,
    TextButton,
    TextButtonRegister,
    TextRegister,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

export const RestPassowrd = ({ navigation, route }) => {
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [textAlert, setTextAlert] = useState({ title: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(route.params?.email || "");

    const handleRedirectRegister = () => {
        navigation.navigate(dataRoutes.register);
    };

    const handleResetPassword = async () => {
        setIsLoading(true);

        if (email !== "" && isValidEmail(email)) {
            const result = await resetUserPassword(email.toLowerCase());

            setShowAlertVisible(true);

            if (result) {
                setTextAlert({
                    title: "Solicitação de senha enviada!",
                    text: "Verifique sua caixa de email, caso não encontre, verifique sua caixa de span!",
                });

                navigation.navigate(dataRoutes.login);
            } else {
                setTextAlert({
                    title: "Ops, algo deu errado",
                    text: "Tente novamente mais tarde!",
                });
            }
        } else {
            Toast.show({ type: "error", text1: "Email inválido" });
        }

        setIsLoading(false);
    };

    return (
        <Container>
            <LogoImage source={originalLogo} />

            <ContentFormLogin>
                <Input
                    label="Informe seu Email"
                    icon="at-sign"
                    keyboardType="email-address"
                    value={email}
                    onChange={setEmail}
                />
            </ContentFormLogin>

            <Footer>
                <ButtonLogin style={BoxShadowIos} onPress={handleResetPassword}>
                    {!isLoading ? (
                        <TextButton>Solicitar Recuperação de Senha</TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonLogin>

                <ContentTextRegister>
                    <TextRegister>Não tem uma conta? </TextRegister>
                    <ButtonRegister>
                        <TextButtonRegister onPress={handleRedirectRegister}>
                            Criar conta
                        </TextButtonRegister>
                    </ButtonRegister>
                </ContentTextRegister>
            </Footer>
            <DialogComponent
                visible={showAlertVisible}
                title={textAlert.title}
                text={textAlert.text}
                textActionButton="Ok"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => setShowAlertVisible(false)}
                dismissable={false}
                showCancelButton={false}
            />
        </Container>
    );
};
