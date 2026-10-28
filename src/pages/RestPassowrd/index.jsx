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
    MethodTab,
    MethodTabs,
    MethodTabText,
    TextButton,
    TextButtonRegister,
    TextRegister,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

const dateBirthRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

export const RestPassowrd = ({ navigation, route }) => {
    const [method, setMethod] = useState("email"); // "email" | "cpf"
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [textAlert, setTextAlert] = useState({ title: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(route.params?.email || "");
    const [identifier, setIdentifier] = useState("");
    const [dateBirth, setDateBirth] = useState("");

    const handleRedirectRegister = () => {
        navigation.navigate(dataRoutes.register);
    };

    const handleResetByEmail = async () => {
        setIsLoading(true);

        if (email.trim() !== "" && isValidEmail(email.trim())) {
            const result = await resetUserPassword(email.trim().toLowerCase());

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

    const handleResetByCpf = () => {
        const cleaned = identifier.replace(/\D/g, "");
        const normalizedDateBirth = dateBirth.trim();

        if (cleaned.length < 8) {
            Toast.show({ type: "error", text1: "Informe um CPF ou telefone válido" });
            return;
        }

        if (!dateBirthRegex.test(normalizedDateBirth)) {
            Toast.show({
                type: "error",
                text1: "Informe a data de nascimento no formato DD/MM/AAAA",
            });
            return;
        }

        navigation.navigate(dataRoutes.createNewPassword, {
            identifier: cleaned,
            dateBirth: normalizedDateBirth,
        });
    };

    return (
        <Container>
            <LogoImage source={originalLogo} />

            <MethodTabs>
                <MethodTab active={method === "email"} onPress={() => setMethod("email")}>
                    <MethodTabText active={method === "email"}>Email</MethodTabText>
                </MethodTab>
                <MethodTab active={method === "cpf"} onPress={() => setMethod("cpf")}>
                    <MethodTabText active={method === "cpf"}>CPF / Telefone</MethodTabText>
                </MethodTab>
            </MethodTabs>

            <ContentFormLogin>
                {method === "email" ? (
                    <Input
                        label="Informe seu Email"
                        icon="at-sign"
                        keyboardType="email-address"
                        value={email}
                        onChange={setEmail}
                    />
                ) : (
                    <>
                        <Input
                            label="Informe seu CPF ou Telefone"
                            icon="user"
                            keyboardType="numeric"
                            value={identifier}
                            onChange={setIdentifier}
                        />
                        <Input
                            label="Data de Nascimento"
                            icon="calendar"
                            keyboardType="numeric"
                            mask="99/99/9999"
                            value={dateBirth}
                            onChange={setDateBirth}
                        />
                    </>
                )}
            </ContentFormLogin>

            <Footer>
                <ButtonLogin
                    style={BoxShadowIos}
                    onPress={method === "email" ? handleResetByEmail : handleResetByCpf}
                >
                    {!isLoading ? (
                        <TextButton>
                            {method === "email" ? "Solicitar Recuperação de Senha" : "Continuar"}
                        </TextButton>
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
