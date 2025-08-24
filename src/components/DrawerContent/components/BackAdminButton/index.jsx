import { Feather } from "@expo/vector-icons";

import { dataRoutes } from "../../../../routes/dataRoutes";

import { Container, ExitButton, TextButton } from "./styles";

export const BackAdminButton = ({ navigation }) => {
    const handleBackAction = async () => {
        navigation.navigate(dataRoutes.home);
    };

    return (
        <Container>
            <ExitButton onPress={handleBackAction}>
                <Feather name="log-out" size={24} color="white" />
                <TextButton>Sair do Administrador</TextButton>
            </ExitButton>
        </Container>
    );
};
