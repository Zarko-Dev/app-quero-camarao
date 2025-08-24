import { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";

import { claculatePublicationTimer } from "../../../DiscountCupons/components/TimerCardCupom/controller/calculateTimer";
import { TimerIndicatorText } from "./styles";

export const RegressivePublicationShrimpTimer = ({
    dateValue = "1900-01-01T23:59:59.999Z",
    extensionDate = "",
    sale = false,
}) => {
    const expirationText = "Publicação Expirada";
    const [timeLeft, setTimeLeft] = useState(
        claculatePublicationTimer(dateValue, extensionDate, expirationText),
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = claculatePublicationTimer(
                dateValue,
                extensionDate,
                expirationText,
            );
            setTimeLeft(newTimeLeft);

            if (newTimeLeft === expirationText) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dateValue]);

    return (
        <TimerIndicatorText>
            {sale ? (
                "Vendido"
            ) : (
                <>
                    {timeLeft !== expirationText && (
                        <FontAwesome name="calendar" size={18} color="white" />
                    )}
                    {timeLeft === expirationText ? "" : " Espira em: "}
                    {timeLeft}
                </>
            )}
        </TimerIndicatorText>
    );
};
