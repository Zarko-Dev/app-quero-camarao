import * as Sentry from "@sentry/react-native";
import { reportDiscordError } from "../DiscordAlerts/context";

import { paymentConfig } from "../Payment/config";
import {
    buildMercadoPagoPixPayload,
    normalizeMercadoPagoPixResult,
} from "../../utils/mercadoPagoPix";

const MERCADO_PAGO_PAYMENTS_URL = "https://api.mercadopago.com/v1/payments";

const parseMercadoPagoError = async (response) => {
    try {
        const data = await response.json();
        return (
            data?.message
            || data?.error_description
            || data?.cause?.[0]?.description
            || null
        );
    } catch (error) {
        return null;
    }
};

export const createPixPayment = async (orderId, orderData) => {
    try {
        const rawResponse = await fetch(MERCADO_PAGO_PAYMENTS_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${paymentConfig.mercadoPagoAccessToken}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": orderId,
            },
            body: JSON.stringify(buildMercadoPagoPixPayload(orderData)),
        });

        if (!rawResponse.ok) {
            void reportDiscordError({
                source: "mercadopago.pix",
                error: new Error("Mercado Pago rejected Pix payment"),
                feature: "payments",
                action: "create-pix",
                extra: { orderId, status: rawResponse.status },
            });
            const mercadoPagoMessage = await parseMercadoPagoError(rawResponse);

            return {
                error: true,
                data: null,
                message:
                    mercadoPagoMessage
                    || "Mercado Pago recusou a geracao do Pix.",
            };
        }

        const payment = await rawResponse.json();
        return normalizeMercadoPagoPixResult(payment);
    } catch (error) {
        Sentry.captureException(error);
        void reportDiscordError({
            source: "mercadopago.pix",
            error,
            feature: "payments",
            action: "create-pix",
            extra: { orderId },
        });
        console.log("createPixPayment error:", error?.message);

        return {
            error: true,
            data: null,
            message: "Não foi possível conectar ao Mercado Pago.",
        };
    }
};
