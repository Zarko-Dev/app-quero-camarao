import {
    API_TOKEN_DEVELOP,
    API_TOKEN_PRODUCTION,
    PAYMENT_GENERATE_URL,
    PAYMENT_PIX_URL,
    STATUS_PROJECT,
} from "@env";

const DEFAULT_PAYMENT_GENERATE_URL = "https://paymentgenerateurl-73bqtyvvfq-uc.a.run.app";
const DEFAULT_PAYMENT_PIX_URL = "https://us-central1-api-quero-camarao.cloudfunctions.net/paymentpix";

const trimUrl = (value, fallback) => {
    if (typeof value !== "string") {
        return fallback;
    }

    const trimmed = value.trim().replace(/\/+$/, "");

    return trimmed || fallback;
};

export const paymentConfig = {
    generateUrlService: trimUrl(
        PAYMENT_GENERATE_URL,
        DEFAULT_PAYMENT_GENERATE_URL,
    ),
    pixService: trimUrl(PAYMENT_PIX_URL, DEFAULT_PAYMENT_PIX_URL),
    mercadoPagoAccessToken:
        STATUS_PROJECT === "production"
            ? API_TOKEN_PRODUCTION
            : API_TOKEN_DEVELOP,
};
