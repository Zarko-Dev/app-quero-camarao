import { useEffect, useState } from "react";

import { claculateTimer } from "../../controller/calculateTimer";

import { TimerIndicatorText } from "../../styles";

export const RegressiveTimer = ({ dateValue = "1900-01-01T23:59:59.999Z" }) => {
    const [timeLeft, setTimeLeft] = useState(claculateTimer(dateValue));

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = claculateTimer(dateValue);
            setTimeLeft(newTimeLeft);

            if (newTimeLeft === "Data Expirada") {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dateValue]);

    return <TimerIndicatorText>{timeLeft}</TimerIndicatorText>;
};
