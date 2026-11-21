const admin = require("firebase-admin");
const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

// Recria a function `paymentgenerateurl` (Checkout Pro do Mercado Pago) que o
// app chama em getPaymentUrl(orderId) e que foi removida no deploy de 28/10/2026.
// Contrato de resposta: { error: false, data: { paymentUrl } } | { error: true, message }.
const MERCADO_PAGO_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";
const discordAlerts = createDiscordFunctionAlertReporter();

const getRequestPath = (req) => req.originalUrl || req.path || req.url || "unknown";

const getOrderUser = (orderData = {}, req = {}) => ({
    userId: orderData.userId || orderData.user?.userId || req.query?.userId || req.body?.userId || "unknown",
    email: orderData.user?.email || "unknown",
    phone: orderData.user?.phone || "unknown",
});

const buildMercadoPagoPreferencePayload = (orderId, orderData) => {
    const user = orderData?.user || {};
    const payer = { email: user.email };

    if (user.name) payer.name = user.name;
    if (user.surname) payer.surname = user.surname;
    if (user.cpf) payer.identification = { type: "CPF", number: user.cpf };
    if (user.phone?.ddd && user.phone?.number) {
        payer.phone = { area_code: user.phone.ddd, number: user.phone.number };
    }

    return {
        items: [
            {
                id: orderId,
                title: "Publicação para venda de camarões no aplicativo Quero Camarão",
                quantity: 1,
                unit_price: Math.round(Number(orderData?.paymentValue || 0) * 100) / 100,
                currency_id: "BRL",
            },
        ],
        payer,
        // O webhook resolve o pedido por external_reference (ver paymentWebhook.js).
        external_reference: orderId,
        notification_url: process.env.WEBHOOK_URL,
    };
};

const reportError = (req, orderId, orderData, error, extra = {}) => {
    const user = getOrderUser(orderData, req);
    void discordAlerts.reportDiscordFunctionError({
        functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
        functionName: "paymentgenerateurl",
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        requestPath: getRequestPath(req),
        eventId: orderId || "unknown",
        error,
        extra: { orderId: orderId || "unknown", ...extra },
    });
};

const handlePaymentGenerateUrl = async (req, res, db = admin.firestore(), fetchImpl = fetch) => {
    const orderId = req.query?.orderId || req.body?.orderId;
    let orderData;

    try {
        if (!orderId) {
            return res.status(400).json({ error: true, message: "O parâmetro orderId é obrigatório." });
        }

        const orderSnapshot = await db.collection("orders").doc(orderId).get();

        if (!orderSnapshot.exists) {
            return res.status(404).json({ error: true, message: "Ordem de pagamento não encontrada." });
        }

        orderData = orderSnapshot.data();
        const payload = buildMercadoPagoPreferencePayload(orderId, orderData);

        if (!(payload.items[0].unit_price > 0)) {
            return res.status(400).json({ error: true, message: "Valor do pedido inválido." });
        }

        const response = await fetchImpl(MERCADO_PAGO_PREFERENCES_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": orderId,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = "Mercado Pago recusou a geração do link de pagamento.";
            try {
                const data = await response.json();
                errorMessage = data?.message || data?.error_description || data?.cause?.[0]?.description || errorMessage;
            } catch (e) {
                // ignore error parsing JSON
            }
            reportError(req, orderId, orderData, new Error(errorMessage), { mercadoPagoStatus: response.status });
            return res.status(400).json({ error: true, message: errorMessage });
        }

        const preference = await response.json();

        if (!preference?.init_point) {
            reportError(req, orderId, orderData, new Error("Mercado Pago não retornou init_point."));
            return res.status(400).json({ error: true, message: "Mercado Pago não retornou o link de pagamento." });
        }

        return res.status(200).json({ error: false, data: { paymentUrl: preference.init_point } });
    } catch (error) {
        console.error("paymentGenerateUrl error:", error);
        reportError(req, orderId, orderData, error);
        return res.status(500).json({ error: true, message: "Erro interno ao gerar o link de pagamento." });
    }
};

module.exports = {
    buildMercadoPagoPreferencePayload,
    handlePaymentGenerateUrl,
};
