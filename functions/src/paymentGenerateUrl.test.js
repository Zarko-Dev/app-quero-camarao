const { buildMercadoPagoPreferencePayload, handlePaymentGenerateUrl } = require("./paymentGenerateUrl");

const order = {
    paymentValue: 120,
    user: { email: "a@b.com", name: "Ana", surname: "Lima", cpf: "12345678900", phone: { ddd: "85", number: "999990000" } },
};
const dbWith = (data) => ({ collection: () => ({ doc: () => ({ get: async () => ({ exists: !!data, data: () => data }) }) }) });
const fetchWith = (ok, body) => async () => ({ ok, status: ok ? 201 : 400, json: async () => body });
const run = async (query, data, fetchImpl) => {
    const out = {};
    const res = { status: (c) => { out.status = c; return res; }, json: (b) => { out.body = b; return res; } };
    await handlePaymentGenerateUrl({ query }, res, dbWith(data), fetchImpl);
    return out;
};

test("payload da preferência carrega valor, payer e external_reference", () => {
    const p = buildMercadoPagoPreferencePayload("ord1", order);
    expect(p.items[0]).toMatchObject({ id: "ord1", unit_price: 120, quantity: 1, currency_id: "BRL" });
    expect(p.payer).toMatchObject({ email: "a@b.com", name: "Ana", identification: { type: "CPF", number: "12345678900" } });
    expect(p.external_reference).toBe("ord1");
});

test("sucesso devolve { error: false, data: { paymentUrl } }", async () => {
    const out = await run({ orderId: "ord1" }, order, fetchWith(true, { init_point: "https://mp/checkout" }));
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ error: false, data: { paymentUrl: "https://mp/checkout" } });
});

test("sem orderId -> 400; pedido inexistente -> 404; valor zero -> 400", async () => {
    expect((await run({}, order, fetchWith(true, {}))).status).toBe(400);
    expect((await run({ orderId: "x" }, null, fetchWith(true, {}))).status).toBe(404);
    expect((await run({ orderId: "x" }, { ...order, paymentValue: 0 }, fetchWith(true, {}))).status).toBe(400);
});

test("recusa do Mercado Pago repassa a mensagem", async () => {
    const out = await run({ orderId: "ord1" }, order, fetchWith(false, { message: "invalid token" }));
    expect(out.status).toBe(400);
    expect(out.body).toEqual({ error: true, message: "invalid token" });
});
