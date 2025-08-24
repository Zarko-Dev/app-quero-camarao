import { Container, ContentWebView } from "./styles";

export const PaymentWeb = ({ route }) => {
    const { params } = route;

    return (
        <Container>
            <ContentWebView source={{ uri: params.url }} />
        </Container>
    );
};
