const shouldSendInitialChatMessage = ({
    autoSend,
    initialMessage,
    myId,
    buyerId,
    chatExists,
    chatHasMessages,
    autoSent,
}) => Boolean(
    autoSend
    && initialMessage
    && myId
    && buyerId
    // Chat criado sem mensagem (lastMessage vazio) ainda precisa do primeiro envio.
    && !(chatExists && chatHasMessages !== false)
    && !autoSent,
);

module.exports = { shouldSendInitialChatMessage };
