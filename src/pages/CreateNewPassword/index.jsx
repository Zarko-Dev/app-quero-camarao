import { useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { dataRoutes } from "../../routes/dataRoutes";
import { resetPasswordByIdentifier } from "../../controllers/User/resetPasswordByIdentifier";
import { Input } from "../../components/Input";
import { BoxShadowIos } from "../../styles/IosShadow";

import originalLogo from "../../assets/images/originalLogo.png";

import {
    ButtonSave,
    Container,
    ContentForm,
    LogoImage,
    Subtitle,
    TextButton,
    Title,
} from "./styles";

export const CreateNewPassword = ({ route, navigation }) => {
    const { identifier } = route.params;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (password.length < 6) {
            Toast.show({ type: "error", text1: "Senha deve ter pelo menos 6 caracteres" });
            return;
        }
        if (password !== confirmPassword) {
            Toast.show({ type: "error", text1: "As senhas não coincidem" });
            return;
        }

        setIsLoading(true);
        const result = await resetPasswordByIdentifier(identifier, password);
        setIsLoading(false);

        if (result.error) {
            Toast.show({ type: "error", text1: "Erro ao salvar senha", text2: result.message });
        } else {
            Toast.show({ type: "success", text1: "Senha criada com sucesso!", text2: "Faça login com a nova senha." });
            navigation.navigate(dataRoutes.login);
        }
    };

    return (
        <Container>
            <LogoImage source={originalLogo} />

            <Title>Criar nova senha</Title>
            <Subtitle>Escolha uma senha segura para sua conta</Subtitle>

            <ContentForm>
                <Input
                    label="Nova senha"
                    icon="lock"
                    security
                    value={password}
                    onChange={setPassword}
                />
                <Input
                    label="Confirmar nova senha"
                    icon="lock"
                    security
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                />
            </ContentForm>

            <ButtonSave style={BoxShadowIos} onPress={handleSave}>
                {!isLoading ? (
                    <TextButton>Salvar nova senha</TextButton>
                ) : (
                    <ActivityIndicator animating color="white" />
                )}
            </ButtonSave>
        </Container>
    );
};
