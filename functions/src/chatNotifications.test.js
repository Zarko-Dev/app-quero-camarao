const {
    buildPreview,
    countUnreadChats,
    handleChatMessageCreated,
} = require("./chatNotifications");

describe("buildPreview", () => {
    test("audio message", () => {
        expect(buildPreview({ audioUrl: "x" })).toBe("🎵 Áudio");
    });

    test("image message", () => {
        expect(buildPreview({ imageUrl: "x" })).toBe("📷 Foto");
    });

    test("file message", () => {
        expect(buildPreview({ fileUrl: "x" })).toBe("📎 Documento");
    });

    test("truncates long text", () => {
        const text = "a".repeat(100);
        expect(buildPreview({ text })).toBe(`${"a".repeat(77)}...`);
    });

    test("short text unchanged", () => {
        expect(buildPreview({ text: " oi " })).toBe("oi");
    });
});

const timestamp = (ms) => ({ toMillis: () => ms });

const fakeChatsCollection = (chats) => ({
    where: (field, _op, value) => ({
        get: async () => ({
            docs: chats
                .filter((c) => c[field] === value)
                .map((c) => ({ id: c.id, data: () => c })),
        }),
    }),
});

const dbWithChats = (chats) => ({
    collection: (name) => {
        if (name === "chats") return fakeChatsCollection(chats);
        throw new Error(`unexpected collection ${name}`);
    },
});

describe("countUnreadChats", () => {
    test("counts chat with no lastSeenAt as unread", async () => {
        const db = dbWithChats([
            { id: "c1", buyerId: "buyer@a.com", sellerId: "seller@a.com", lastMessage: "oi", lastMessageAt: timestamp(100), lastSeenAt: {} },
        ]);
        expect(await countUnreadChats(db, "buyer@a.com")).toBe(1);
    });

    test("does not double count chats matching both buyer and seller queries", async () => {
        const db = dbWithChats([
            { id: "c1", buyerId: "me@a.com", sellerId: "me@a.com", lastMessage: "oi", lastMessageAt: timestamp(100), lastSeenAt: {} },
        ]);
        expect(await countUnreadChats(db, "me@a.com")).toBe(1);
    });

    test("skips closed chats", async () => {
        const db = dbWithChats([
            { id: "c1", buyerId: "buyer@a.com", sellerId: "seller@a.com", status: "closed", lastMessage: "oi", lastMessageAt: timestamp(100), lastSeenAt: {} },
        ]);
        expect(await countUnreadChats(db, "buyer@a.com")).toBe(0);
    });

    test("skips chats already seen after the last message", async () => {
        const safeId = "buyer_a_com";
        const db = dbWithChats([
            {
                id: "c1",
                buyerId: "buyer@a.com",
                sellerId: "seller@a.com",
                lastMessage: "oi",
                lastMessageAt: timestamp(100),
                lastSeenAt: { [safeId]: timestamp(200) },
            },
        ]);
        expect(await countUnreadChats(db, "buyer@a.com")).toBe(0);
    });
});

describe("handleChatMessageCreated", () => {
    const buildEvent = (msg) => ({
        data: { data: () => msg },
        params: { chatId: "c1" },
    });

    const buildDb = ({ chat, recipientToken }) => ({
        collection: (name) => {
            if (name === "chats") {
                if (chat === null) {
                    return {
                        doc: () => ({ get: async () => ({ exists: false }) }),
                        where: () => ({ get: async () => ({ docs: [] }) }),
                    };
                }
                return {
                    doc: () => ({ get: async () => ({ exists: true, data: () => chat }) }),
                    where: () => ({ get: async () => ({ docs: [] }) }),
                };
            }
            if (name === "users") {
                return {
                    doc: () => ({
                        get: async () => ({ data: () => (recipientToken ? { notification: { token: recipientToken } } : {}) }),
                    }),
                };
            }
            throw new Error(`unexpected collection ${name}`);
        },
    });

    beforeEach(() => {
        global.fetch = jest.fn(async () => ({ json: async () => ({ ok: true }) }));
    });

    test("sends a push to the buyer when the seller messages", async () => {
        const chat = {
            sellerId: "seller@a.com",
            buyerId: "buyer@a.com",
            sellerName: "Seller",
            buyerName: "Buyer",
            publicationId: "pub1",
        };
        const db = buildDb({ chat, recipientToken: "ExponentPushToken[xyz]" });
        const event = buildEvent({ senderId: "seller@a.com", text: "oi" });

        await handleChatMessageCreated(event, db);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [, options] = global.fetch.mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.to).toBe("ExponentPushToken[xyz]");
        expect(body.title).toBe("Seller");
        expect(body.data).toMatchObject({ type: "chat", chatId: "c1", publicationId: "pub1" });
    });

    test("sends a push to the seller when the buyer messages", async () => {
        const chat = {
            sellerId: "seller@a.com",
            buyerId: "buyer@a.com",
            sellerName: "Seller",
            buyerName: "Buyer",
            publicationId: "pub1",
        };
        const db = buildDb({ chat, recipientToken: "ExponentPushToken[abc]" });
        const event = buildEvent({ senderId: "buyer@a.com", text: "oi" });

        await handleChatMessageCreated(event, db);

        const [, options] = global.fetch.mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.title).toBe("Buyer");
    });

    test("does nothing for isAutoMessage=true", async () => {
        const chat = {
            sellerId: "seller@a.com",
            buyerId: "buyer@a.com",
            sellerName: "Seller",
            buyerName: "Buyer",
            publicationId: "pub1",
        };
        const db = buildDb({ chat, recipientToken: "ExponentPushToken[xyz]" });
        const event = buildEvent({ senderId: "seller@a.com", text: "Olá! Tenho interesse.", isAutoMessage: true });

        const result = await handleChatMessageCreated(event, db);

        expect(result).toBeNull();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("does nothing when the chat doc doesn't exist", async () => {
        const db = buildDb({ chat: null });
        const event = buildEvent({ senderId: "seller@a.com", text: "oi" });

        await handleChatMessageCreated(event, db);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("does nothing when the recipient has no push token", async () => {
        const chat = {
            sellerId: "seller@a.com",
            buyerId: "buyer@a.com",
            sellerName: "Seller",
            buyerName: "Buyer",
            publicationId: "pub1",
        };
        const db = buildDb({ chat, recipientToken: null });
        const event = buildEvent({ senderId: "seller@a.com", text: "oi" });

        await handleChatMessageCreated(event, db);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("sends '🎵 Áudio' in push body for audio message", async () => {
        const chat = {
            sellerId: "seller@a.com",
            buyerId: "buyer@a.com",
            sellerName: "Vendedor",
            buyerName: "Comprador",
            publicationId: "pub1",
        };
        const db = buildDb({ chat, recipientToken: "ExponentPushToken[xyz]" });
        const event = buildEvent({
            senderId: "seller@a.com",
            audioUrl: "https://storage.googleapis.com/bucket/chats/c1/audio/123.m4a",
        });

        await handleChatMessageCreated(event, db);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [, options] = global.fetch.mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.body).toBe("🎵 Áudio");
        expect(body.title).toBe("Vendedor");
    });
});
