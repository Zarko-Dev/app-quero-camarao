import { Container, InputSerach } from "./styles";

export const SearchBarSelect = ({ value, action = () => {}, decrease }) => (
    <Container decrease={decrease}>
        <InputSerach
            mode="outlined"
            label="Buscar..."
            value={value}
            onChangeText={action}
        />
    </Container>
);
