import * as Sentry from "@sentry/react-native";

export const getOrderDetails = async (orderId) => {
    console.log(process.env.STATUS_PROJECT);

    try {
        const resultDetails = await (
            await fetch(`https://api.mercadopago.com/v1/payments/${orderId}`, {
                headers: {
                    Authorization:
                        "Bearer APP_USR-1645444665521091-120716-9ab0eaf4ae095086c86770cbb8c00b06-296792033",
                },
            })
        ).json();

        return resultDetails;
    } catch (error) {
        Sentry.captureException(error);

        return null;
    }
};
