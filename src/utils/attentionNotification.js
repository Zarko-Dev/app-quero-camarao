export const buildAttentionNotificationData = ({
    chatId,
    publicationId,
    sellerId,
    buyerId,
    sellerName,
    buyerName,
}) => ({
    type: "attention",
    chatId,
    publicationId,
    sellerId,
    buyerId,
    sellerName,
    buyerName,
});

export const isPushNotificationAccepted = (result) => {
    const tickets = Array.isArray(result?.data) ? result.data : [result?.data];
    return tickets.length > 0 && tickets.every((ticket) => ticket?.status === "ok");
};
