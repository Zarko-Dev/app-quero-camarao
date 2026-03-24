import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
    ButtonAction,
    Container,
    ContainerSelect,
    ContentTitle,
    TextButtonAction,
    Title,
} from "./styles";
import { dataRoutes } from "../../../routes/dataRoutes";

export const DrawPrizeSelect = ({ navigation }) => {
    const handleNavigateToDrawPrize = (type) => {
        if (type === "geral") {
            navigation.navigate(dataRoutes.admin.drawPrizeNew);
        } else {
            navigation.navigate(dataRoutes.admin.drawPrizeLive);
        }
    };

    return (
        <Container>
            <ContentTitle>
                <Title>Selecione o tipo de sorteio</Title>
            </ContentTitle>
            <ContainerSelect>
                <ButtonAction
                    onPress={() => handleNavigateToDrawPrize("geral")}
                >
                    <Feather name="gift" size={40} color="white" />
                    <TextButtonAction>Sorteio Geral</TextButtonAction>
                </ButtonAction>
                <ButtonAction onPress={() => handleNavigateToDrawPrize("live")}>
                    <MaterialIcons name="live-tv" size={40} color="white" />
                    <TextButtonAction>Sorteio ao Vivo</TextButtonAction>
                </ButtonAction>
            </ContainerSelect>
        </Container>
    );
};
