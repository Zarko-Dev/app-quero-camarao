const assert = require("node:assert/strict");
const test = require("node:test");

const {
    buildMercadoPagoPixPayload,
    normalizeMercadoPagoPixResult,
} = require("../src/utils/mercadoPagoPix");

test("buildMercadoPagoPixPayload creates pix payload from order data", () => {
    assert.deepEqual(
        buildMercadoPagoPixPayload({
            paymentValue: 120,
            user: {
                email: "pedro@example.com",
                name: "Pedro",
                surname: "Roger",
                cpf: "12345678901",
                address: {
                    zip_code: "60873652",
                    street_name: "Rua A",
                    street_number: 123,
                },
            },
        }),
        {
            transaction_amount: 120,
            description:
                "Publicação para venda de camarões no aplicativo Quero Camarão",
            payment_method_id: "pix",
            payer: {
                email: "pedro@example.com",
                first_name: "Pedro",
                last_name: "Roger",
                identification: {
                    type: "CPF",
                    number: "12345678901",
                },
                address: {
                    zip_code: "60873652",
                    street_name: "Rua A",
                    street_number: 123,
                },
            },
        },
    );
});

test("normalizeMercadoPagoPixResult returns QR code data", () => {
    const result = normalizeMercadoPagoPixResult({
        id: 123,
        payment_type_id: "bank_transfer",
        transaction_amount: 120,
        status: "pending",
        status_detail: "pending_waiting_transfer",
        point_of_interaction: {
            transaction_data: {
                qr_code: "pix-code",
                qr_code_base64: "base64-image",
                ticket_url: "https://ticket",
            },
        },
    });

    assert.equal(result.error, false);
    assert.equal(result.data.paymentLog.payment_id, 123);
    assert.equal(result.data.dataQrCode.qrCode, "pix-code");
    assert.equal(result.data.dataQrCode.qrCodeBase64, "base64-image");
});
