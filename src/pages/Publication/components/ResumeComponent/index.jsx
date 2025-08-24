import { convertToMoney } from "../../../../utils/convertToMoney";

import {
    Container,
    ContentIndicator,
    Divider,
    SubtitleIndicator,
    TitleIndicator,
} from "./styles";

export const ResumeComponent = ({
    subtotal = "0,00",
    discounts = "0,00",
    total = "0,00",
}) => (
    <Container>
        <Divider />
        <ContentIndicator>
            <TitleIndicator>Subtotal:</TitleIndicator>
            <SubtitleIndicator>R$ {convertToMoney(subtotal)}</SubtitleIndicator>
        </ContentIndicator>
        <ContentIndicator>
            <TitleIndicator>Descontos:</TitleIndicator>
            <SubtitleIndicator>
                - R$ {convertToMoney(discounts)}
            </SubtitleIndicator>
        </ContentIndicator>
        <ContentIndicator>
            <TitleIndicator>Total:</TitleIndicator>
            <SubtitleIndicator>R$ {convertToMoney(total)}</SubtitleIndicator>
        </ContentIndicator>
    </Container>
);
