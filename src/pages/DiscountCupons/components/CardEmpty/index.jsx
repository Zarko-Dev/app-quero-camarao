import { MaterialIcons } from "@expo/vector-icons";

import { Container, TitleEmpty } from "./styles";

export const CardEmpty = () => (
    <Container>
        <TitleEmpty>Não há cupons cadastrados!</TitleEmpty>
        <MaterialIcons name="block" size={25} color="black" />
    </Container>
);
