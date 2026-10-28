const buildMercadoPagoPixPayload = (orderData) => {
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
    };
};

const normalizeMercadoPagoPixResult = (payment) => {
    const transactionData = payment?.point_of_interaction?.transaction_data ?? {};
    const qrCode = transactionData?.qr_code ?? null;
    const qrCodeBase64 = transactionData?.qr_code_base64 ?? null;

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
                preference_id: payment?.preference_id ?? null,
                merchant_account_id: payment?.merchant_account_id ?? null,
                message: "Pagamento pix criado com sucesso!",
                payment_type: payment?.payment_type_id ?? "bank_transfer",
                type: "pix payment",
                collection_id: payment?.collection_id ?? null,
                processing_mode: payment?.processing_mode ?? null,
                payment_id: payment.id,
                merchant_order_id: payment?.order?.id ?? null,
                status: payment?.status ?? "pending",
                external_reference: payment?.external_reference ?? null,
                collection_status: payment?.status_detail ?? null,
                site_id: payment?.site_id ?? null,
            },
            dataQrCode: {
                qrCode,
                qrCodeBase64,
                value: payment?.transaction_amount ?? 0,
                expirationDate: transactionData?.expiration_date ?? null,
                ticketUrl: transactionData?.ticket_url ?? null,
            },
        },
    };
};

module.exports = {
    buildMercadoPagoPixPayload,
    normalizeMercadoPagoPixResult,
};
