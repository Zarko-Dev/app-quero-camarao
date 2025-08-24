import { useState } from "react";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch } from "react-redux";

import { isValidEmail } from "../../utils/ValidationEmail";
import { dataRoutes } from "../../routes/dataRoutes";
import { UserAuthentication } from "../../controllers/User/authentication";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { LoginActions } from "./actions";
import { InvitationActions } from "../ValidateInvitation/actions";

import { Input } from "../../components/Input";

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

import originalLogo from "../../assets/images/originalLogo.png";

export const Login = ({ navigation }) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const ValidateEmailPassword = () => {
        if (email === "" || password === "") {
            return false;
        }

        return true;
    };

    const HandleLogin = async () => {
        if (!isLoading) {
            setIsLoading(true);

            if (ValidateEmailPassword() && isValidEmail(email)) {
                if (await UserAuthentication(email.toLowerCase(), password)) {
                    dispatch({
                        type: InvitationActions.DELETE_INVITATION_CODE_ACTION,
                    });

                    const dataUser = await GetUserStorage();

                    Toast.show({
                        type: "success",
                        text1: `Boas Vindas, ${dataUser.name}`,
                    });

                    dispatch({ type: LoginActions.ISAUTHENTICATED_ACTION });

                    setEmail("");
                    setPassword("");

                    navigation.navigate(dataRoutes.navigation);
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: "Dados Inválidos",
                    text2: "Verifique se o Email ou Senha estão corrretos!",
                });
            }

            setIsLoading(false);
        }
    };

    const handleRedirectRegister = () => {
        navigation.navigate(dataRoutes.register);
    };

    const handleRedirectResetPassword = () => {
        navigation.navigate(dataRoutes.resetPassword, { email });
    };

    return (
        <Container>
            <LogoImage source={originalLogo} />

            <ContentFormLogin>
                <Input
                    label="Email"
                    icon="at-sign"
                    keyboardType="email-address"
                    value={email}
                    onChange={setEmail}
                />
                <Input
                    label="Senha"
                    icon="lock"
                    security
                    value={password}
                    onChange={setPassword}
                />
                <ContentTextRegister>
                    <TextRegister>Esqueceu a senha? </TextRegister>
                    <ButtonRegister onPress={handleRedirectResetPassword}>
                        <TextButtonRegister>Recuperar </TextButtonRegister>
                    </ButtonRegister>
                </ContentTextRegister>
            </ContentFormLogin>

            <Footer>
                <ButtonLogin style={BoxShadowIos} onPress={HandleLogin}>
                    {!isLoading ? (
                        <TextButton>Entrar</TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonLogin>

                <ContentTextRegister>
                    <TextRegister>Não tem uma conta? </TextRegister>
                    <ButtonRegister>
                        <TextButtonRegister onPress={handleRedirectRegister}>
                            CADASTRAR-SE
                        </TextButtonRegister>
                    </ButtonRegister>
                </ContentTextRegister>
            </Footer>
        </Container>
    );
};
