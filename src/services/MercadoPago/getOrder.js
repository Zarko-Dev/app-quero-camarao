import * as Sentry from "@sentry/react-native";
import {
    API_TOKEN_DEVELOP,
    API_TOKEN_PRODUCTION,
    STATUS_PROJECT,
} from "@env";

export const getOrderDetails = async (orderId) => {
    try {
        const token =
            STATUS_PROJECT === "production"
                ? API_TOKEN_PRODUCTION
                : API_TOKEN_DEVELOP;

        const resultDetails = await (
            await fetch(`https://api.mercadopago.com/v1/payments/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        ).json();

        return resultDetails;
    } catch (error) {
        Sentry.captureException(error);

        return null;
    }
};
