const admin = require("firebase-admin");
const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

const MERCADO_PAGO_PAYMENTS_URL = "https://api.mercadopago.com/v1/payments";
const discordAlerts = createDiscordFunctionAlertReporter();

const getRequestPath = (req) => req.originalUrl || req.path || req.url || "unknown";

const buildPublicationData = (orderData, now = new Date()) => {
    const dataPublication = orderData?.dataPublication;

    if (!dataPublication?.id) {
        return null;
    }

    const currentDate = new Date(now);
    const expirationDate = new Date(currentDate);

    expirationDate.setDate(currentDate.getDate() + 15);

    return {
        ...dataPublication,
        userId: orderData?.userId || null,
        views: 0,
        expirationDate,
        createdAt: currentDate,
        updatedAt: currentDate,
    };
};

const publishApprovedOrder = async ({
    db,
    orderId,
    orderData,
    paymentInfo,
    now = new Date(),
}) => {
    if (paymentInfo?.status !== "approved") {
        return {
            published: false,
            skipped: true,
        };
    }

    if (!orderId || !orderData) {
        return {
            published: false,
            skipped: true,
        };
    }

    const orderRef = db.collection("orders").doc(orderId);

    if (orderData.published) {
        await orderRef.set(
            {
                status: "approved",
                updatedAt: new Date(now),
            },
            { merge: true },
        );

        return {
            published: false,
            alreadyPublished: true,
        };
    }

    const publicationData = buildPublicationData(orderData, now);

    if (!publicationData) {
        return {
            published: false,
            error: true,
            message: "Pedido aprovado sem dados de publicação.",
        };
    }

    const shrimpPondsRef = db.collection("shrimpPonds").doc(publicationData.id);

    await shrimpPondsRef.set(publicationData);
    await orderRef.set(
        {
            status: "approved",
            published: true,
            updatedAt: new Date(now),
        },
        { merge: true },
    );

    return {
        published: true,
    };
};

const handlePaymentWebhook = async (req, res) => {
    let type;
    let action;
    let paymentId;

    try {
        // Mercado Pago sends the type of event and data id
        // Example: { "type": "payment", "data": { "id": "123456" } }
        ({ type, action } = req.body || {});
        paymentId = req.body?.data?.id;

        // "payment.created" or "payment.updated" can come as action or type depending on MP version, 
        // but 'type' is usually "payment"
        if ((type === "payment" || action?.startsWith("payment")) && paymentId) {
            
            // Verificamos o status do pagamento na API do Mercado Pago
            const response = await fetch(`${MERCADO_PAGO_PAYMENTS_URL}/${paymentId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                },
            });

            if (response.ok) {
                const paymentInfo = await response.json();
                
                // O 'external_reference' deve conter o orderId que enviamos na geração do PIX
                const orderId = paymentInfo.external_reference;
                const status = paymentInfo.status;

                if (orderId && status === "approved") {
                    const db = admin.firestore();
                    const orderRef = db.collection("orders").doc(orderId);
                    
                    const orderSnapshot = await orderRef.get();
                    
                    if (orderSnapshot.exists) {
                        const orderData = orderSnapshot.data();

                        const result = await publishApprovedOrder({
                            db,
                            orderId,
                            orderData,
                            paymentInfo,
                        });

                        if (result.published) {
                            console.log(`Pedido ${orderId} publicado e aprovado via Webhook!`);
                        } else if (result.alreadyPublished) {
                            console.log(`Pedido ${orderId} já estava publicado; status sincronizado via Webhook.`);
                        } else if (result.error) {
                            console.log(`Pedido ${orderId}: ${result.message}`);
                        }
                    } else {
                        console.log(`Pedido ${orderId} não encontrado no Firestore.`);
                    }
                }
            }
        }

        // MP exige retorno 200 rápido para não reenviar as notificações
        return res.status(200).send("OK");
    } catch (error) {
        console.error("paymentWebhook error:", error);
        void discordAlerts.reportDiscordFunctionError({
            functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
            functionName: "paymentwebhook",
            requestPath: getRequestPath(req),
            eventId: paymentId || "unknown",
            error,
            extra: {
                eventType: type || "unknown",
                action: action || "unknown",
                paymentId: paymentId || "unknown",
            },
        });
        // Retornamos 500 para o Mercado Pago tentar novamente em caso de falha interna crítica
        return res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    handlePaymentWebhook,
    publishApprovedOrder,
};
