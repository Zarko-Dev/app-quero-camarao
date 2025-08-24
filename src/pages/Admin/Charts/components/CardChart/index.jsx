import { Container, TitleCardChart } from "./styles";

export const CardChart = ({ children, title }) => (
    <Container horizontal>
        <TitleCardChart>{title}</TitleCardChart>
        {children}
    </Container>
);
