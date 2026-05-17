import { DiscountIndicator } from "../DiscountIndicator";
import {
    Container,
    ContentUnlimited,
    ContentUnlimitedInfo,
    UnlimitedIndicator,
    TextUnlimited,
    UnlimitedIndicatorText,
    ContentQuantity,
    TextQuantity,
    QuantityIndicator,
    QuantityIndicatorText,
} from "./styles";

export const UnlimitedCardCupom = ({
    discountType,
    discountValue = "Sem Desconto",
    useCount,
}) => (
    <Container>
        <ContentUnlimitedInfo>
            <ContentUnlimited>
                <TextUnlimited>Expira em</TextUnlimited>
                <UnlimitedIndicator>
                    <UnlimitedIndicatorText>Nao expira</UnlimitedIndicatorText>
                </UnlimitedIndicator>
            </ContentUnlimited>
            <ContentQuantity>
                <TextQuantity>Quantidade utilizada</TextQuantity>
                <QuantityIndicator>
                    <QuantityIndicatorText>{useCount}</QuantityIndicatorText>
                </QuantityIndicator>
            </ContentQuantity>
        </ContentUnlimitedInfo>
        <DiscountIndicator discountType={discountType} discountValue={discountValue} />
    </Container>
);
