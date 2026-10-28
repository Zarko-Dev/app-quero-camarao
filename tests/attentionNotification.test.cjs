const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildAttentionNotificationData,
    isPushNotificationAccepted,
} = require("../src/utils/attentionNotification");

test("attention payload keeps the names required to reopen the chat", () => {
    assert.deepEqual(
        buildAttentionNotificationData({
            chatId: "chat-1",
            publicationId: "pub-1",
            sellerId: "seller@example.com",
            buyerId: "buyer@example.com",
            sellerName: "Vendedor",
            buyerName: "Comprador",
        }),
        {
            type: "attention",
            chatId: "chat-1",
            publicationId: "pub-1",
            sellerId: "seller@example.com",
            buyerId: "buyer@example.com",
            sellerName: "Vendedor",
            buyerName: "Comprador",
        },
    );
});

test("attention reports an Expo push rejection instead of treating it as sent", () => {
    assert.equal(
        isPushNotificationAccepted({ data: { status: "error", message: "DeviceNotRegistered" } }),
        false,
    );
    assert.equal(
        isPushNotificationAccepted({ data: { status: "ok", id: "ticket-1" } }),
        true,
    );
    assert.equal(isPushNotificationAccepted({ data: {} }), false);
});
