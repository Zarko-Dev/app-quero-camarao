const LAST_MESSAGE_FIELDS = ["lastMessage", "lastMessageAt", "lastMessageSenderId", "updatedAt"];

const pick = (source, keys) => keys.reduce((result, key) => (
    key in source ? { ...result, [key]: source[key] } : result
), {});

const omit = (source, keys) => Object.fromEntries(
    Object.entries(source).filter(([key]) => !keys.includes(key)),
);

// Chat novo: as rules de prod (messages create) exigem o doc do chat já gravado,
// então grava em dois passos: (1) doc do chat sem lastMessage, (2) batch atômico
// com a mensagem + lastMessage. O passo 2 é tudo-ou-nada (sem mensagem duplicada)
// e é tentado de novo uma vez; se falhar, o chat fica vazio e o próximo envio
// cai no caminho de "chat existente".
const commitChatWrites = async ({
    firestore,
    chatRef,
    messageRef,
    chatExists,
    chatData,
    messageData,
    writeBatch,
}) => {
    if (chatExists) {
        const batch = writeBatch(firestore);
        batch.update(chatRef, chatData);
        batch.set(messageRef, messageData);
        await batch.commit();
        return;
    }

    const createBatch = writeBatch(firestore);
    createBatch.set(chatRef, { ...omit(chatData, LAST_MESSAGE_FIELDS), lastMessage: "" });
    await createBatch.commit();

    const commitMessage = async () => {
        const batch = writeBatch(firestore);
        batch.update(chatRef, pick(chatData, LAST_MESSAGE_FIELDS));
        batch.set(messageRef, messageData);
        await batch.commit();
    };

    try {
        await commitMessage();
    } catch (firstError) {
        await commitMessage();
    }
};

module.exports = { commitChatWrites };
