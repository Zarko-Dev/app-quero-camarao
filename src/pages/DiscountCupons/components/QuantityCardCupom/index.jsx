import { DiscountIndicator } from "../DiscountIndicator";
import {
    Container,
    ContentQuantity,
    ContentQuantityInfo,
    QuantityIndicator,
    QuantityIndicatorText,
    TextQuantity,
} from "./styles";

export const QuantityCardCupom = ({
    durationInitialValue = 0,
    durationValue = 0,
    discountType,
    discountValue = "Sem Desconto",
}) => {
    const getDifferentialValue = () => durationInitialValue - durationValue;

    return (
        <Container>
            <ContentQuantityInfo>
                <ContentQuantity>
                    <TextQuantity>Quantidade Disponível</TextQuantity>
                    <QuantityIndicator>
                        <QuantityIndicatorText>
                            {durationInitialValue}
                        </QuantityIndicatorText>
                    </QuantityIndicator>
                </ContentQuantity>
                <ContentQuantity>
                    <TextQuantity>Quantidade Utilizada</TextQuantity>
                    <QuantityIndicator>
                        <QuantityIndicatorText>
                            {getDifferentialValue()}
                        </QuantityIndicatorText>
                    </QuantityIndicator>
                </ContentQuantity>
            </ContentQuantityInfo>
            <DiscountIndicator
                discountType={discountType}
                discountValue={discountValue}
            />
        </Container>
    );
};
