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
                    <UnlimitedIndicatorText>Não Expira</UnlimitedIndicatorText>
                </UnlimitedIndicator>
            </ContentUnlimited>
            <ContentQuantity>
                <TextQuantity>Quantidade Utilizada</TextQuantity>
                <QuantityIndicator>
                    <QuantityIndicatorText>{useCount}</QuantityIndicatorText>
                </QuantityIndicator>
            </ContentQuantity>
        </ContentUnlimitedInfo>
        <DiscountIndicator
            discountType={discountType}
            discountValue={discountValue}
        />
    </Container>
);
