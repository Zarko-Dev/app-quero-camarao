const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { ORDER_STATUS, validateOrder, normalizeOrder } = require("../src/contracts/orders");

const expect = (actual) => ({
    toBe: (expected) => assert.equal(actual, expected),
    toEqual: (expected) => assert.deepEqual(actual, expected),
    toBeGreaterThan: (expected) => assert.ok(actual > expected, `${actual} is not greater than ${expected}`),
    toBeInstanceOf: (expectedClass) => assert.ok(actual instanceof expectedClass),
    toBeNull: () => assert.equal(actual, null),
    toBeUndefined: () => assert.equal(actual, undefined),
});

describe("ORDER_STATUS enum", () => {
    test("contains pending value", () => {
        expect(ORDER_STATUS.PENDING).toBe("pending");
    });

    test("contains approved value", () => {
        expect(ORDER_STATUS.APPROVED).toBe("approved");
    });

    test("contains cancelled value", () => {
        expect(ORDER_STATUS.CANCELLED).toBe("cancelled");
    });

    test("values match those used in the codebase", () => {
        expect(ORDER_STATUS.APPROVED).toBe("approved");
    });
});

describe("validateOrder", () => {
    const baseValidOrder = {
        idOrder: "order-123",
        userId: "buyer@example.com",
        paymentValue: 150.5,
        status: ORDER_STATUS.PENDING,
        published: false,
        dataPublication: {
            id: "pub-456",
            shrimps: ["shrimp-1", "shrimp-2"],
        },
        dataCupomPayment: { cupomId: "cup-789", discount: 10 },
        paymentUrl: "https://pay.example.com/order-123",
        paymentLog: { preference_id: "pref-001", status: "pending" },
        createdAt: new Date("2025-01-15T10:00:00Z"),
        updatedAt: new Date("2025-01-15T10:00:00Z"),
    };

    test("valida um pedido completo e válido", () => {
        const result = validateOrder(baseValidOrder);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    test("rejeita pedido sem idOrder", () => {
        const order = { ...baseValidOrder, idOrder: "" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("idOrder"))).toBe(true);
    });

    test("rejeita pedido com idOrder não string", () => {
        const order = { ...baseValidOrder, idOrder: 123 };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("idOrder"))).toBe(true);
    });

    test("rejeita pedido sem userId", () => {
        const order = { ...baseValidOrder, userId: "" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("userId"))).toBe(true);
    });

    test("rejeita pedido com userId que não é email válido", () => {
        const order = { ...baseValidOrder, userId: "not-an-email" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("userId"))).toBe(true);
    });

    test("rejeita pedido sem paymentValue", () => {
        const order = { ...baseValidOrder, paymentValue: "150.5" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("paymentValue"))).toBe(true);
    });

    test("rejeita pedido com paymentValue NaN", () => {
        const order = { ...baseValidOrder, paymentValue: NaN };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("paymentValue"))).toBe(true);
    });

    test("aceita status como string qualquer", () => {
        const order = { ...baseValidOrder, status: "any-status" };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("status"))).toBe(false);
    });

    test("rejeita status que não é string", () => {
        const order = { ...baseValidOrder, status: 123 };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("status"))).toBe(true);
    });

    test("aceita published como boolean", () => {
        const order = { ...baseValidOrder, published: true };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("published"))).toBe(false);
    });

    test("rejeita published que não é boolean", () => {
        const order = { ...baseValidOrder, published: "true" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("published"))).toBe(true);
    });

    test("aceita dataPublication com id e shrimps array", () => {
        const result = validateOrder(baseValidOrder);
        expect(result.valid).toBe(true);
    });

    test("rejeita dataPublication sem id", () => {
        const order = {
            ...baseValidOrder,
            dataPublication: { shrimps: ["shrimp-1"] },
        };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("dataPublication.id"))).toBe(true);
    });

    test("rejeita dataPublication com shrimps que não é array", () => {
        const order = {
            ...baseValidOrder,
            dataPublication: { id: "pub-456", shrimps: "not-an-array" },
        };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("shrimps"))).toBe(true);
    });

    test("rejeita dataPublication que não é objeto", () => {
        const order = { ...baseValidOrder, dataPublication: "invalid" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("dataPublication"))).toBe(true);
    });

    test("aceita dataCupomPayment como null", () => {
        const order = { ...baseValidOrder, dataCupomPayment: null };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("dataCupomPayment"))).toBe(false);
    });

    test("rejeita dataCupomPayment que não é objeto nem null", () => {
        const order = { ...baseValidOrder, dataCupomPayment: "invalid" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("dataCupomPayment"))).toBe(true);
    });

    test("aceita paymentUrl como string", () => {
        const order = { ...baseValidOrder, paymentUrl: "https://example.com" };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("paymentUrl"))).toBe(false);
    });

    test("aceita paymentUrl como null", () => {
        const order = { ...baseValidOrder, paymentUrl: null };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("paymentUrl"))).toBe(false);
    });

    test("rejeita paymentUrl que não é string nem null", () => {
        const order = { ...baseValidOrder, paymentUrl: 123 };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("paymentUrl"))).toBe(true);
    });

    test("aceita paymentLog como objeto", () => {
        const order = { ...baseValidOrder, paymentLog: { preference_id: "pref-001" } };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("paymentLog"))).toBe(false);
    });

    test("aceita paymentLog como null", () => {
        const order = { ...baseValidOrder, paymentLog: null };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("paymentLog"))).toBe(false);
    });

    test("rejeita paymentLog que não é objeto nem null", () => {
        const order = { ...baseValidOrder, paymentLog: "invalid" };
        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("paymentLog"))).toBe(true);
    });

    test("aceita createdAt como Date", () => {
        const order = { ...baseValidOrder, createdAt: new Date() };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("createdAt"))).toBe(false);
    });

    test("aceita createdAt como string ISO", () => {
        const order = { ...baseValidOrder, createdAt: "2025-01-15T10:00:00Z" };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("createdAt"))).toBe(false);
    });

    test("aceita updatedAt como string ISO", () => {
        const order = { ...baseValidOrder, updatedAt: "2025-01-15T10:00:00Z" };
        const result = validateOrder(order);
        expect(result.errors.some((e) => e.includes("updatedAt"))).toBe(false);
    });

    test("rejeita pedido que não é objeto", () => {
        const result = validateOrder(null);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    test("rejeita pedido que é undefined", () => {
        const result = validateOrder(undefined);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    test("pedido mínimo válido com apenas campos obrigatórios", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
        };
        const result = validateOrder(order);
        expect(result.valid).toBe(true);
    });
});

describe("normalizeOrder", () => {
    test("normaliza um pedido válido completo", () => {
        const order = {
            idOrder: "  order-123  ",
            userId: "  buyer@example.com  ",
            paymentValue: 150.5,
            status: ORDER_STATUS.PENDING,
            published: true,
            dataPublication: {
                id: "  pub-456  ",
                shrimps: ["shrimp-1"],
            },
            dataCupomPayment: { cupomId: "cup-789" },
            paymentUrl: "https://pay.example.com",
            paymentLog: { status: "pending" },
            createdAt: new Date("2025-01-15T10:00:00Z"),
            updatedAt: new Date("2025-01-15T10:00:00Z"),
        };
        const result = normalizeOrder(order);
        expect(result.valid).toBe(true);
        expect(result.order.idOrder).toBe("order-123");
        expect(result.order.userId).toBe("buyer@example.com");
        expect(result.order.paymentValue).toBe(150.5);
        expect(result.order.status).toBe("pending");
        expect(result.order.published).toBe(true);
        expect(result.order.dataPublication.id).toBe("pub-456");
        expect(result.order.dataPublication.shrimps).toEqual(["shrimp-1"]);
        expect(result.order.dataCupomPayment).toEqual({ cupomId: "cup-789" });
        expect(result.order.paymentUrl).toBe("https://pay.example.com");
        expect(result.order.paymentLog).toEqual({ status: "pending" });
        expect(result.order.createdAt).toBeInstanceOf(Date);
        expect(result.order.updatedAt).toBeInstanceOf(Date);
    });

    test("normaliza campos faltantes com valores padrão", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
        };
        const result = normalizeOrder(order);
        expect(result.valid).toBe(true);
        expect(result.order.status).toBeNull();
        expect(result.order.published).toBe(false);
        expect(result.order.dataPublication).toBeNull();
        expect(result.order.dataCupomPayment).toBeNull();
        expect(result.order.paymentUrl).toBeNull();
        expect(result.order.paymentLog).toBeNull();
        expect(result.order.createdAt).toBeNull();
        expect(result.order.updatedAt).toBeNull();
    });

    test("normaliza dataPublication com shrimps faltante para array vazio", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
            dataPublication: { id: "pub-456" },
        };
        const result = normalizeOrder(order);
        expect(result.valid).toBe(true);
        expect(result.order.dataPublication.shrimps).toEqual([]);
    });

    test("normaliza dataPublication com shrimps não-array para array vazio", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
            dataPublication: { id: "pub-456", shrimps: "not-array" },
        };
        const result = normalizeOrder(order);
        expect(result.order.dataPublication.shrimps).toEqual([]);
    });

    test("retorna erros ao receber null", () => {
        const result = normalizeOrder(null);
        expect(result.valid).toBe(false);
        expect(result.order).toBeNull();
    });

    test("trata paymentValue NaN como 0", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: NaN,
        };
        const result = normalizeOrder(order);
        expect(result.order.paymentValue).toBe(0);
    });

    test("trata createdAt/updatedAt não-Date como null (números) ou os parseia (strings ISO)", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
            createdAt: "2025-01-15",
            updatedAt: 1234567890,
        };
        const result = normalizeOrder(order);
        expect(result.order.createdAt).toBeInstanceOf(Date);
        expect(result.order.updatedAt).toBeNull();
    });

    test("dataCupomPayment null é preservado como null", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
            dataCupomPayment: null,
        };
        const result = normalizeOrder(order);
        expect(result.order.dataCupomPayment).toBeNull();
    });

    test("paymentUrl null é preservado como null", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
            paymentUrl: null,
        };
        const result = normalizeOrder(order);
        expect(result.order.paymentUrl).toBeNull();
    });

    test("paymentLog null é preservado como null", () => {
        const order = {
            idOrder: "order-123",
            userId: "buyer@example.com",
            paymentValue: 100,
            paymentLog: null,
        };
        const result = normalizeOrder(order);
        expect(result.order.paymentLog).toBeNull();
    });
});
