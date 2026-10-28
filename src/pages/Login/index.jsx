import { useState } from "react";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch } from "react-redux";
import { TouchableOpacity, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { isValidEmail } from "../../utils/ValidationEmail";
import { dataRoutes } from "../../routes/dataRoutes";
import { takePendingPublication } from "../../utils/pendingPublication";
import { UserAuthentication } from "../../controllers/User/authentication";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { LoginActions } from "./actions";
import { InvitationActions } from "../ValidateInvitation/actions";

import {
    Container,
    ScrollContainer,
    Header,
    BrandCard,
    LogoImage,
    WelcomeTitle,
    WelcomeSubtitle,
    ContentFormLogin,
    ForgotPasswordRow,
    Footer,
    ButtonLogin,
    TextButton,
    ButtonRegisterBox,
    TextRegister,
    TextButtonRegister,
    IconContainerRight,
    CustomInputWrap,
    CustomIconBox,
    CustomInputText,
    BadgesRow,
    BadgeCol,
    BadgeText,
} from "./styles";

import originalLogo from "../../assets/images/originalLogo.png";

export const Login = ({ navigation }) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const ValidateEmailPassword = () => {
        if (email === "" || password === "") {
            return false;
        }
        return true;
    };

    const HandleLogin = async () => {
        if (!isLoading) {
            setIsLoading(true);

            const normalizedEmail = email.trim().toLowerCase();

            if (ValidateEmailPassword() && isValidEmail(normalizedEmail)) {
                if (await UserAuthentication(normalizedEmail, password)) {
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
                    const pendingId = takePendingPublication();
                    if (pendingId) {
                        navigation.navigate(dataRoutes.publicationDetail, {
                            publicationId: pendingId,
                        });
                    }
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: "Dados Inválidos",
                    text2: "Verifique se o Email ou Senha estão corretos!",
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
            <ScrollContainer keyboardShouldPersistTaps="handled">
                <Header>
                    <BrandCard>
                        <LogoImage source={originalLogo} resizeMode="contain" />
                        <WelcomeTitle>Bem-vindo de volta!</WelcomeTitle>
                        <WelcomeSubtitle>
                            Entre para continuar no Quero Camarão
                        </WelcomeSubtitle>
                    </BrandCard>
                </Header>

                <ContentFormLogin>
                    <CustomInputWrap>
                        <CustomIconBox>
                            <Feather name="mail" size={20} color="#f55b1f" />
                        </CustomIconBox>
                        <CustomInputText
                            placeholder="E-mail"
                            placeholderTextColor="#a0aab2"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </CustomInputWrap>

                    <CustomInputWrap>
                        <CustomIconBox>
                            <Feather name="lock" size={20} color="#f55b1f" />
                        </CustomIconBox>
                        <CustomInputText
                            placeholder="Senha"
                            placeholderTextColor="#a0aab2"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: 16 }}
                        >
                            <Feather
                                name={showPassword ? "eye" : "eye-off"}
                                size={20}
                                color="#5c6c7b"
                            />
                        </TouchableOpacity>
                    </CustomInputWrap>

                    <ForgotPasswordRow>
                        <TextRegister>Esqueceu a senha? </TextRegister>
                        <TouchableOpacity onPress={handleRedirectResetPassword}>
                            <TextButtonRegister style={{ textDecorationLine: "underline" }}>Recuperar</TextButtonRegister>
                        </TouchableOpacity>
                    </ForgotPasswordRow>
                </ContentFormLogin>

                <Footer>
                    <ButtonLogin onPress={HandleLogin} activeOpacity={0.8}>
                        {!isLoading ? (
                            <>
                                <Feather name="log-in" size={24} color="#ffffff" />
                                <TextButton>Entrar</TextButton>
                            </>
                        ) : (
                            <ActivityIndicator animating color="white" />
                        )}
                    </ButtonLogin>

                    <ButtonRegisterBox onPress={handleRedirectRegister} activeOpacity={0.8}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Feather name="user-plus" size={20} color="#f55b1f" />
                            <TextRegister style={{ marginLeft: 12 }}>Não tem uma conta?</TextRegister>
                            <TextButtonRegister>CADASTRAR-SE</TextButtonRegister>
                        </View>
                        <IconContainerRight>
                            <Feather name="chevron-right" size={20} color="#f55b1f" />
                        </IconContainerRight>
                    </ButtonRegisterBox>
                </Footer>

                <BadgesRow>
                    <BadgeCol>
                        <MaterialCommunityIcons name="shield-check-outline" size={28} color="#f55b1f" />
                        <BadgeText>Seguro e{"\n"}confiável</BadgeText>
                    </BadgeCol>
                    <BadgeCol>
                        <Feather name="lock" size={28} color="#f55b1f" />
                        <BadgeText>Seus dados{"\n"}protegidos</BadgeText>
                    </BadgeCol>
                    <BadgeCol>
                        <Feather name="headphones" size={28} color="#f55b1f" />
                        <BadgeText>Suporte{"\n"}dedicado</BadgeText>
                    </BadgeCol>
                </BadgesRow>
            </ScrollContainer>
        </Container>
    );
};
