const deriveNextChatSessionState = (previousChatKey, nextChatKey, currentState) => {
    if (previousChatKey === nextChatKey) return currentState;

    return {
        autoSent: false,
        messagesReady: false,
        deliveredMarkedIds: [],
        lastSeenSignature: "",
    };
};

module.exports = { deriveNextChatSessionState };
