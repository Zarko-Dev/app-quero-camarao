import { DiscountIndicator } from "../DiscountIndicator";
import { RegressiveTimer } from "./components/RegressiveTImer";

import {
    Container,
    ContentTimer,
    ContentTimerInfo,
    TimerIndicator,
    TextTimer,
    ContentQuantity,
    TextQuantity,
    QuantityIndicator,
    QuantityIndicatorText,
} from "./styles";

export const TimerCardCupom = ({
    discountType,
    discountValue = "Sem Desconto",
    durationValue,
    useCount,
}) => (
    <Container>
        <ContentTimerInfo>
            <ContentTimer>
                <TextTimer>Expira em</TextTimer>
                <TimerIndicator>
                    <RegressiveTimer dateValue={durationValue} />
                </TimerIndicator>
            </ContentTimer>
            <ContentQuantity>
                <TextQuantity>Quantidade utilizada</TextQuantity>
                <QuantityIndicator>
                    <QuantityIndicatorText>{useCount}</QuantityIndicatorText>
                </QuantityIndicator>
            </ContentQuantity>
        </ContentTimerInfo>
        <DiscountIndicator discountType={discountType} discountValue={discountValue} />
    </Container>
);
