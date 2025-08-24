import { ButtonFilter, Container, TextButton } from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

export const Filter = ({ onPress }) => (
    <Container>
        <ButtonFilter style={BoxShadowIos} onPress={onPress}>
            <TextButton>Filtrar</TextButton>
        </ButtonFilter>
    </Container>
);
