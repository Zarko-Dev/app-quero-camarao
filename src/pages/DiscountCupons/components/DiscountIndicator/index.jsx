import { convertToMoney } from "../../../../utils/convertToMoney";
import { Container, DiscountIndicatorText } from "./styles";

export const DiscountIndicator = ({ discountType, discountValue }) => {
    const showDiscount = () => {
        switch (discountType) {
            case "Percentage":
                return `${discountValue}%`;

            case "Value":
                return `- R$ ${convertToMoney(Number(discountValue))}`;

            case "QuantityPonds":
                return `${discountValue} ${
                    discountValue === 1 ? "Viveiro" : "Viveiros"
                }`;

            default:
                return "Sem Desconto";
        }
    };

    return (
        <Container>
            <DiscountIndicatorText>{showDiscount()}</DiscountIndicatorText>
        </Container>
    );
};
