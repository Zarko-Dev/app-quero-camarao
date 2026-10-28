const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const expect = (actual) => ({
    toBe: (expected) => assert.equal(actual, expected),
    toEqual: (expected) => assert.deepEqual(actual, expected),
    toHaveLength: (expected) => assert.equal(actual.length, expected),
});

function toDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value.toDate === "function") return value.toDate();
    if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isValidPaymentValue(pv) {
    return typeof pv === "number" && Number.isFinite(pv);
}

function sumPaymentValues(orders) {
    let totalCents = 0;
    (orders || []).forEach((order) => {
        if (!order || !isValidPaymentValue(order.paymentValue)) return;
        totalCents += Math.round(order.paymentValue * 100);
    });
    return Math.round(totalCents) / 100;
}

function filterValidOrders(orders) {
    return (orders || []).filter((order) => order && isValidPaymentValue(order.paymentValue));
}

function averagePaymentValue(orders) {
    const valid = filterValidOrders(orders);
    if (valid.length === 0) return 0;
    const total = sumPaymentValues(valid);
    return Math.round((total / valid.length) * 100) / 100;
}

describe("ordersFinancial — validação de paymentValue", () => {
    test("paymentValue string é inválido", () => {
        expect(isValidPaymentValue("100")).toBe(false);
    });

    test("paymentValue undefined é inválido", () => {
        expect(isValidPaymentValue(undefined)).toBe(false);
    });

    test("paymentValue NaN é inválido", () => {
        expect(isValidPaymentValue(NaN)).toBe(false);
    });

    test("paymentValue Infinity é inválido", () => {
        expect(isValidPaymentValue(Infinity)).toBe(false);
    });

    test("paymentValue número finito é válido", () => {
        expect(isValidPaymentValue(100)).toBe(true);
        expect(isValidPaymentValue(0.01)).toBe(true);
        expect(isValidPaymentValue(-50)).toBe(true);
    });
});

describe("ordersFinancial — soma float precisa", () => {
    test("0.1 + 0.2 = 0.3 com Math.round em centavos", () => {
        const orders = [
            { paymentValue: 0.1, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 0.2, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(0.3);
    });

    test("soma com centavos que exigem arredondamento", () => {
        const orders = [
            { paymentValue: 0.01, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 0.02, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(0.03);
    });

    test("soma de valores grandes com precisão de centavos", () => {
        const orders = [
            { paymentValue: 1234.56, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 789.12, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(2023.68);
    });

    test("soma com três parcelas de 0.1", () => {
        const orders = [
            { paymentValue: 0.1, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 0.1, createdAt: new Date("2025-03-10T16:00:00Z") },
            { paymentValue: 0.1, createdAt: new Date("2025-03-10T17:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(0.3);
    });
});

describe("ordersFinancial — orders inválidas ignoradas na soma", () => {
    test("paymentValue string ignorado na soma", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: "50", createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });

    test("paymentValue undefined ignorado na soma", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: undefined, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });

    test("paymentValue NaN ignorado na soma", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: NaN, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });

    test("todas as orders inválidas retorna 0", () => {
        const orders = [
            { paymentValue: "100", createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: undefined, createdAt: new Date("2025-03-10T16:00:00Z") },
            { paymentValue: NaN, createdAt: new Date("2025-03-10T17:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(0);
    });

    test("order nulo/undefined ignorado", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            null,
            undefined,
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });
});

describe("ordersFinancial — filterValidOrders", () => {
    test("filtra apenas orders com paymentValue válido", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: "50", createdAt: new Date("2025-03-10T16:00:00Z") },
            { paymentValue: 200, createdAt: new Date("2025-03-10T17:00:00Z") },
            { paymentValue: undefined, createdAt: new Date("2025-03-10T18:00:00Z") },
        ];
        const valid = filterValidOrders(orders);
        expect(valid).toHaveLength(2);
        expect(valid[0].paymentValue).toBe(100);
        expect(valid[1].paymentValue).toBe(200);
    });

    test("retorna array vazio para array vazio", () => {
        expect(filterValidOrders([])).toEqual([]);
    });

    test("retorna array vazio para undefined", () => {
        expect(filterValidOrders(undefined)).toEqual([]);
    });
});

describe("ordersFinancial — averagePaymentValue", () => {
    test("calcula média de paymentValues válidos", () => {
        const orders = [
            { paymentValue: 10, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 20, createdAt: new Date("2025-03-10T16:00:00Z") },
            { paymentValue: 30, createdAt: new Date("2025-03-10T17:00:00Z") },
        ];
        expect(averagePaymentValue(orders)).toBe(20);
    });

    test("média com 0.1 + 0.2 + 0.3 usa centavos arredondados", () => {
        const orders = [
            { paymentValue: 0.1, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 0.2, createdAt: new Date("2025-03-10T16:00:00Z") },
            { paymentValue: 0.3, createdAt: new Date("2025-03-10T17:00:00Z") },
        ];
        expect(averagePaymentValue(orders)).toBe(0.2);
    });

    test("retorna 0 quando não há orders válidos", () => {
        expect(averagePaymentValue([])).toBe(0);
        expect(averagePaymentValue(undefined)).toBe(0);
    });

    test("ignora orders inválidas no cálculo da média", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: "50", createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(averagePaymentValue(orders)).toBe(100);
    });
});

describe("ordersFinancial — createdAt como Date, {seconds}, Timestamp-like", () => {
    test("createdAt como Date é processado corretamente", () => {
        const orders = [
            { paymentValue: 50, createdAt: new Date("2025-06-15T10:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(50);
    });

    test("createdAt como {seconds} é processado corretamente", () => {
        const orders = [
            { paymentValue: 75, createdAt: { seconds: 1750000000 } },
        ];
        expect(sumPaymentValues(orders)).toBe(75);
    });

    test("createdAt como Timestamp-like (toDate) é processado corretamente", () => {
        const orders = [
            { paymentValue: 90, createdAt: { toDate: () => new Date("2025-06-15T10:00:00Z") } },
        ];
        expect(sumPaymentValues(orders)).toBe(90);
    });

    test("createdAt inválido (null) não quebra a soma", () => {
        const orders = [
            { paymentValue: 100, createdAt: null },
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });
});
