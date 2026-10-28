const admin = require("firebase-admin");
const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

const MERCADO_PAGO_PAYMENTS_URL = "https://api.mercadopago.com/v1/payments";
const discordAlerts = createDiscordFunctionAlertReporter();

const getRequestPath = (req) => req.originalUrl || req.path || req.url || "unknown";

const getOrderUser = (orderData = {}, req = {}) => ({
    userId: orderData.userId || orderData.user?.userId || req.query?.userId || req.body?.userId || "unknown",
    email: orderData.user?.email || "unknown",
    phone: orderData.user?.phone || "unknown",
});

const buildMercadoPagoPixPayload = (orderId, orderData) => {
    const payer = {
        email: orderData?.user?.email,
    };

    if (orderData?.user?.name) {
        payer.first_name = orderData.user.name;
    }

    if (orderData?.user?.surname) {
        payer.last_name = orderData.user.surname;
    }

    if (orderData?.user?.cpf) {
        payer.identification = {
            type: "CPF",
            number: orderData.user.cpf,
        };
    }

    if (orderData?.user?.address) {
        payer.address = orderData.user.address;
    }

    return {
        transaction_amount: Number(orderData?.paymentValue || 0),
        description: "Publicação para venda de camarões no aplicativo Quero Camarão",
        payment_method_id: "pix",
        payer,
        notification_url: process.env.WEBHOOK_URL,
        external_reference: orderId,
    };
};

const normalizeMercadoPagoPixResult = (payment) => {
    const transactionData = payment?.point_of_interaction?.transaction_data || {};
    const qrCode = transactionData?.qr_code || null;
    const qrCodeBase64 = transactionData?.qr_code_base64 || null;

    if (!payment?.id || !qrCode || !qrCodeBase64) {
        return {
            error: true,
            data: null,
            message: "Mercado Pago não retornou o QR Code Pix.",
        };
    }

    return {
        error: false,
        data: {
            paymentLog: {
                preference_id: payment?.preference_id || null,
                merchant_account_id: payment?.merchant_account_id || null,
                message: "Pagamento pix criado com sucesso!",
                payment_type: payment?.payment_type_id || "bank_transfer",
                type: "pix payment",
                collection_id: payment?.collection_id || null,
                processing_mode: payment?.processing_mode || null,
                payment_id: payment.id,
                merchant_order_id: payment?.order?.id || null,
                status: payment?.status || "pending",
                external_reference: payment?.external_reference || null,
                collection_status: payment?.status_detail || null,
                site_id: payment?.site_id || null,
            },
            dataQrCode: {
                qrCode,
                qrCodeBase64,
                value: payment?.transaction_amount || 0,
                expirationDate: transactionData?.expiration_date || null,
                ticketUrl: transactionData?.ticket_url || null,
            },
        },
    };
};

const handlePaymentPix = async (req, res) => {
    let orderId = req.query?.orderId || req.body?.orderId;
    let orderData;

    try {
        if (!orderId) {
            return res.status(400).json({
                error: true,
                message: "O parâmetro orderId é obrigatório.",
            });
        }

        const db = admin.firestore();
        const orderSnapshot = await db.collection("orders").doc(orderId).get();

        if (!orderSnapshot.exists) {
            return res.status(404).json({
                error: true,
                message: "Ordem de pagamento não encontrada.",
            });
        }

        orderData = orderSnapshot.data();

        const payload = buildMercadoPagoPixPayload(orderId, orderData);

        const response = await fetch(MERCADO_PAGO_PAYMENTS_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": orderId,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = "Mercado Pago recusou a geração do Pix.";
            try {
                const data = await response.json();
                errorMessage = data?.message || data?.error_description || data?.cause?.[0]?.description || errorMessage;
            } catch (e) {
                // ignore error parsing JSON
            }
            const user = getOrderUser(orderData, req);
            void discordAlerts.reportDiscordFunctionError({
                functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
                functionName: "paymentpix",
                userId: user.userId,
                email: user.email,
                phone: user.phone,
                requestPath: getRequestPath(req),
                eventId: orderId || "unknown",
                error: new Error(errorMessage),
                extra: { orderId: orderId || "unknown", mercadoPagoStatus: response.status },
            });
            return res.status(400).json({
                error: true,
                message: errorMessage,
            });
        }

        const payment = await response.json();
        const result = normalizeMercadoPagoPixResult(payment);

        return res.status(200).json(result);
    } catch (error) {
        console.error("paymentPix error:", error);
        const user = getOrderUser(orderData, req);
        void discordAlerts.reportDiscordFunctionError({
            functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
            functionName: "paymentpix",
            userId: user.userId,
            email: user.email,
            phone: user.phone,
            requestPath: getRequestPath(req),
            eventId: orderId || "unknown",
            error,
            extra: { orderId: orderId || "unknown" },
        });
        return res.status(500).json({
            error: true,
            message: "Erro interno ao processar o PIX.",
        });
    }
};

module.exports = {
    handlePaymentPix,
};
