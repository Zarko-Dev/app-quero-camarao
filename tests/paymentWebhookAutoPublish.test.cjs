const assert = require("node:assert/strict");
const test = require("node:test");

const {
    publishApprovedOrder,
} = require("../functions/src/paymentWebhook");

const createFakeDb = (state) => ({
    collection(collectionName) {
        return {
            doc(docId) {
                return {
                    async get() {
                        const data = state[collectionName]?.[docId];

                        return {
                            exists: () => Boolean(data),
                            data: () => data,
                        };
                    },
                    async set(data, options) {
                        const current = state[collectionName]?.[docId] || {};
                        const next = options?.merge
                            ? { ...current, ...data }
                            : data;

                        state[collectionName] = {
                            ...(state[collectionName] || {}),
                            [docId]: next,
                        };
                    },
                    async update(data) {
                        const current = state[collectionName]?.[docId] || {};
                        state[collectionName] = {
                            ...(state[collectionName] || {}),
                            [docId]: { ...current, ...data },
                        };
                    },
                };
            },
        };
    },
});

test("publishApprovedOrder publica o viveiro e marca o pedido como publicado", async () => {
    const state = {
        orders: {
            "ord-1": {
                userId: "pedro@example.com",
                published: false,
                status: "approved",
                dataPublication: {
                    id: "pub-1",
                    ponds: 2,
                    location: "Fortaleza/CE",
                    contactNumber: "+5585998653476",
                    shrimps: [
                        { grammage: "10", kilo: "120" },
                        { grammage: "20", kilo: "80" },
                    ],
                },
            },
        },
        shrimpPonds: {},
    };

    const result = await publishApprovedOrder({
        db: createFakeDb(state),
        orderId: "ord-1",
        orderData: state.orders["ord-1"],
        paymentInfo: { status: "approved" },
        now: new Date("2026-07-04T12:00:00.000Z"),
    });

    assert.equal(result.published, true);
    assert.equal(state.shrimpPonds["pub-1"].userId, "pedro@example.com");
    assert.equal(state.shrimpPonds["pub-1"].views, 0);
    assert.equal(state.orders["ord-1"].published, true);
    assert.equal(state.orders["ord-1"].status, "approved");
    assert.equal(
        state.shrimpPonds["pub-1"].expirationDate.getDate()
            - state.shrimpPonds["pub-1"].createdAt.getDate(),
        15,
    );
});

test("publishApprovedOrder nao duplica uma ordem ja publicada", async () => {
    const state = {
        orders: {
            "ord-2": {
                userId: "pedro@example.com",
                published: true,
                status: "approved",
                dataPublication: {
                    id: "pub-2",
                    ponds: 1,
                    location: "Fortaleza/CE",
                    contactNumber: "+5585998653476",
                    shrimps: [{ grammage: "10", kilo: "120" }],
                },
            },
        },
        shrimpPonds: {},
    };

    const result = await publishApprovedOrder({
        db: createFakeDb(state),
        orderId: "ord-2",
        orderData: state.orders["ord-2"],
        paymentInfo: { status: "approved" },
        now: new Date("2026-07-04T12:00:00.000Z"),
    });

    assert.equal(result.alreadyPublished, true);
    assert.equal(state.shrimpPonds["pub-2"], undefined);
    assert.equal(state.orders["ord-2"].published, true);
});
