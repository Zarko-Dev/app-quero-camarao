const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
    NOTIFICATION_TYPES,
    REQUIRED_FIELDS,
    validateNotificationPayload,
    normalizeNotificationPayload,
} = require("../src/contracts/notificationPayload");

const expect = (actual) => ({
    toBe: (expected) => assert.equal(actual, expected),
    toEqual: (expected) => assert.deepEqual(actual, expected),
    toBeNull: () => assert.equal(actual, null),
    toBeUndefined: () => assert.equal(actual, undefined),
});

describe("NOTIFICATION_TYPES enum", () => {
    test("contains chat value", () => {
        expect(NOTIFICATION_TYPES.CHAT).toBe("chat");
    });

    test("contains attention value", () => {
        expect(NOTIFICATION_TYPES.ATTENTION).toBe("attention");
    });

    test("contains publication value", () => {
        expect(NOTIFICATION_TYPES.PUBLICATION).toBe("publication");
    });

    test("contains registerMyAds value", () => {
        expect(NOTIFICATION_TYPES.REGISTER_MY_ADS).toBe("registerMyAds");
    });

    test("values are frozen", () => {
        expect(Object.isFrozen(NOTIFICATION_TYPES)).toBe(true);
    });
});

describe("REQUIRED_FIELDS", () => {
    test("chat requires chatId, publicationId, sellerId, buyerId, sellerName, buyerName", () => {
        expect(REQUIRED_FIELDS[NOTIFICATION_TYPES.CHAT]).toEqual([
            "chatId", "publicationId", "sellerId", "buyerId", "sellerName", "buyerName",
        ]);
    });

    test("attention requires same fields as chat", () => {
        expect(REQUIRED_FIELDS[NOTIFICATION_TYPES.ATTENTION]).toEqual(
            REQUIRED_FIELDS[NOTIFICATION_TYPES.CHAT],
        );
    });

    test("publication requires publicationId", () => {
        expect(REQUIRED_FIELDS[NOTIFICATION_TYPES.PUBLICATION]).toEqual(["publicationId"]);
    });

    test("registerMyAds requires no extra fields", () => {
        expect(REQUIRED_FIELDS[NOTIFICATION_TYPES.REGISTER_MY_ADS]).toEqual([]);
    });
});

describe("validateNotificationPayload", () => {
    test("rejeita payload nulo", () => {
        const result = validateNotificationPayload(null);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("objeto"))).toBe(true);
    });

    test("rejeita payload undefined", () => {
        const result = validateNotificationPayload(undefined);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("objeto"))).toBe(true);
    });

    test("rejeita payload sem type", () => {
        const result = validateNotificationPayload({ chatId: "c1" });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("type"))).toBe(true);
    });

    test("rejeita payload com type não string", () => {
        const result = validateNotificationPayload({ type: 123 });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("type"))).toBe(true);
    });

    test("rejeita payload com type inválido", () => {
        const result = validateNotificationPayload({ type: "unknown" });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("unknown"))).toBe(true);
    });

    describe("chat type", () => {
        const baseChat = {
            type: "chat",
            chatId: "chat-123",
            publicationId: "pub-456",
            sellerId: "seller-1",
            buyerId: "buyer-2",
            sellerName: "João",
            buyerName: "Maria",
        };

        test("valida payload chat completo e válido", () => {
            const result = validateNotificationPayload(baseChat);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        test("rejeita chat sem chatId", () => {
            const data = { ...baseChat, chatId: "" };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("chatId"))).toBe(true);
        });

        test("rejeita chat sem publicationId", () => {
            const data = { ...baseChat, publicationId: null };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("publicationId"))).toBe(true);
        });

        test("rejeita chat sem sellerId", () => {
            const data = { ...baseChat, sellerId: undefined };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("sellerId"))).toBe(true);
        });

        test("rejeita chat sem buyerId", () => {
            const data = { ...baseChat, buyerId: undefined };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("buyerId"))).toBe(true);
        });

        test("rejeita chat sem sellerName", () => {
            const data = { ...baseChat, sellerName: "" };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("sellerName"))).toBe(true);
        });

        test("rejeita chat sem buyerName", () => {
            const data = { ...baseChat, buyerName: "   " };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("buyerName"))).toBe(true);
        });

        test("rejeita chat com chatId como número", () => {
            const data = { ...baseChat, chatId: 123 };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("chatId"))).toBe(true);
        });
    });

    describe("attention type", () => {
        const baseAttention = {
            type: "attention",
            chatId: "chat-123",
            publicationId: "pub-456",
            sellerId: "seller-1",
            buyerId: "buyer-2",
            sellerName: "João",
            buyerName: "Maria",
        };

        test("valida payload attention completo e válido", () => {
            const result = validateNotificationPayload(baseAttention);
            expect(result.valid).toBe(true);
        });

        test("rejeita attention sem chatId", () => {
            const data = { ...baseAttention, chatId: "" };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("chatId"))).toBe(true);
        });

        test("rejeita attention sem publicationId", () => {
            const data = { ...baseAttention, publicationId: null };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("publicationId"))).toBe(true);
        });

        test("rejeita attention sem sellerId", () => {
            const data = { ...baseAttention, sellerId: undefined };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("sellerId"))).toBe(true);
        });

        test("rejeita attention sem buyerId", () => {
            const data = { ...baseAttention, buyerId: undefined };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("buyerId"))).toBe(true);
        });

        test("rejeita attention sem sellerName", () => {
            const data = { ...baseAttention, sellerName: "" };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("sellerName"))).toBe(true);
        });

        test("rejeita attention sem buyerName", () => {
            const data = { ...baseAttention, buyerName: "" };
            const result = validateNotificationPayload(data);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("buyerName"))).toBe(true);
        });
    });

    describe("publication type", () => {
        test("valida payload publication válido", () => {
            const result = validateNotificationPayload({
                type: "publication",
                publicationId: "pub-789",
            });
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        test("rejeita publication sem publicationId", () => {
            const result = validateNotificationPayload({ type: "publication" });
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("publicationId"))).toBe(true);
        });

        test("rejeita publication com publicationId vazio", () => {
            const result = validateNotificationPayload({
                type: "publication",
                publicationId: "",
            });
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("publicationId"))).toBe(true);
        });

        test("rejeita publication com publicationId como número", () => {
            const result = validateNotificationPayload({
                type: "publication",
                publicationId: 42,
            });
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("publicationId"))).toBe(true);
        });
    });

    describe("registerMyAds type", () => {
        test("valida payload registerMyAds válido (sem campos extras)", () => {
            const result = validateNotificationPayload({ type: "registerMyAds" });
            expect(result.valid).toBe(true);
        });

        test("valida payload registerMyAds com campos extras ignorados", () => {
            const result = validateNotificationPayload({
                type: "registerMyAds",
                extraField: "ignored",
            });
            expect(result.valid).toBe(true);
        });
    });
});

describe("normalizeNotificationPayload", () => {
    test("retorna null para payload nulo", () => {
        expect(normalizeNotificationPayload(null)).toBeNull();
    });

    test("retorna null para payload undefined", () => {
        expect(normalizeNotificationPayload(undefined)).toBeNull();
    });

    test("retorna null para payload sem type", () => {
        expect(normalizeNotificationPayload({ chatId: "c1" })).toBeNull();
    });

    test("retorna null para type inválido", () => {
        expect(normalizeNotificationPayload({ type: "unknown" })).toBeNull();
    });

    test("normaliza payload chat com strings espaçadas", () => {
        const result = normalizeNotificationPayload({
            type: "chat",
            chatId: "  chat-123  ",
            publicationId: "pub-456",
            sellerId: "seller-1",
            buyerId: "buyer-2",
            sellerName: "  João  ",
            buyerName: "Maria  ",
        });
        expect(result).toEqual({
            type: "chat",
            chatId: "chat-123",
            publicationId: "pub-456",
            sellerId: "seller-1",
            buyerId: "buyer-2",
            sellerName: "João",
            buyerName: "Maria",
        });
    });

    test("normaliza payload attention", () => {
        const result = normalizeNotificationPayload({
            type: "attention",
            chatId: "chat-1",
            publicationId: "pub-1",
            sellerId: "s1",
            buyerId: "b1",
            sellerName: "Ana",
            buyerName: "Beto",
        });
        expect(result).toEqual({
            type: "attention",
            chatId: "chat-1",
            publicationId: "pub-1",
            sellerId: "s1",
            buyerId: "b1",
            sellerName: "Ana",
            buyerName: "Beto",
        });
    });

    test("normaliza payload publication", () => {
        const result = normalizeNotificationPayload({
            type: "publication",
            publicationId: "  pub-789  ",
        });
        expect(result).toEqual({
            type: "publication",
            publicationId: "pub-789",
        });
    });

    test("normaliza payload registerMyAds", () => {
        const result = normalizeNotificationPayload({
            type: "registerMyAds",
        });
        expect(result).toEqual({
            type: "registerMyAds",
        });
    });

    test("remove campos desconhecidos do payload", () => {
        const result = normalizeNotificationPayload({
            type: "chat",
            chatId: "chat-1",
            publicationId: "pub-1",
            sellerId: "s1",
            buyerId: "b1",
            sellerName: "Ana",
            buyerName: "Beto",
            unknownField: "should-be-removed",
        });
        expect(result.unknownField).toBeUndefined();
    });

    test("retorna null para type com espaços em branco apenas", () => {
        expect(normalizeNotificationPayload({ type: "   " })).toBeNull();
    });
});
