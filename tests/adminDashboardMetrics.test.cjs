const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { toDate, monthKeyOf, isValidOrder, aggregateMonthlyMetrics, sumPaymentValues } = require("../functions/src/adminDashboardMetrics");

const expect = (actual) => ({
    toBe: (expected) => assert.equal(actual, expected),
    toEqual: (expected) => assert.deepEqual(actual, expected),
    toBeDefined: () => assert.notEqual(actual, undefined),
    toBeInstanceOf: (expectedClass) => assert.ok(actual instanceof expectedClass),
    toBeNull: () => assert.equal(actual, null),
    toBeUndefined: () => assert.equal(actual, undefined),
    toBeCloseTo: (expected, precision = 2) => {
        const tolerance = 10 ** -precision / 2;
        assert.ok(Math.abs(actual - expected) < tolerance, `${actual} is not close to ${expected}`);
    },
});

describe("toDate", () => {
    test("converte Date como Date", () => {
        const d = new Date("2025-12-31T20:00:00Z");
        expect(toDate(d)).toBe(d);
    });

    test("converte {seconds} para Date", () => {
        const result = toDate({ seconds: 1704067200 });
        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBe(1704067200000);
    });

    test("converte Timestamp-like (toDate) para Date", () => {
        const ts = { toDate: () => new Date("2025-06-15T10:00:00Z") };
        const result = toDate(ts);
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe("2025-06-15T10:00:00.000Z");
    });

    test("retorna null para valor nulo", () => {
        expect(toDate(null)).toBeNull();
    });

    test("retorna null para valor undefined", () => {
        expect(toDate(undefined)).toBeNull();
    });

    test("retorna null para string inválida", () => {
        expect(toDate("not-a-date")).toBeNull();
    });
});

describe("monthKeyOf — timezone UTC-3 (BRT)", () => {
    test("31/12 23:00 UTC = 31/12 20:00 BRT → mês 12", () => {
        const utcDate = new Date("2025-12-31T23:00:00Z");
        expect(monthKeyOf(utcDate)).toBe("2025-12");
    });

    test("01/01 02:00 UTC = 31/12 23:00 BRT → mês 12 (ano anterior)", () => {
        const utcDate = new Date("2025-01-01T02:00:00Z");
        expect(monthKeyOf(utcDate)).toBe("2024-12");
    });

    test("01/01 00:00 UTC = 31/12 21:00 BRT → mês 12", () => {
        const utcDate = new Date("2025-01-01T00:00:00Z");
        expect(monthKeyOf(utcDate)).toBe("2024-12");
    });

    test("01/01 03:00 UTC = 01/01 00:00 BRT → mês 01", () => {
        const utcDate = new Date("2025-01-01T03:00:00Z");
        expect(monthKeyOf(utcDate)).toBe("2025-01");
    });

    test("meio do mês em UTC permanece no mesmo mês em BRT", () => {
        const utcDate = new Date("2025-06-15T12:00:00Z");
        expect(monthKeyOf(utcDate)).toBe("2025-06");
    });
});

describe("isValidOrder", () => {
    test("aceita paymentValue como number válido", () => {
        expect(isValidOrder({ paymentValue: 100.5 })).toBe(true);
    });

    test("rejeita paymentValue como string", () => {
        expect(isValidOrder({ paymentValue: "100.5" })).toBe(false);
    });

    test("rejeita paymentValue como undefined", () => {
        expect(isValidOrder({ paymentValue: undefined })).toBe(false);
    });

    test("rejeita paymentValue como NaN", () => {
        expect(isValidOrder({ paymentValue: NaN })).toBe(false);
    });

    test("rejeita paymentValue como Infinity", () => {
        expect(isValidOrder({ paymentValue: Infinity })).toBe(false);
    });

    test("rejeita order nulo", () => {
        expect(isValidOrder(null)).toBe(false);
    });

    test("rejeita order undefined", () => {
        expect(isValidOrder(undefined)).toBe(false);
    });

    test("rejeita order que não é objeto", () => {
        expect(isValidOrder("string")).toBe(false);
    });
});

describe("aggregateMonthlyMetrics", () => {
    test("agregação mensal com datas UTC-3 — 31/12 23:00 UTC conta no mês 12", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-12-31T23:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-12"]).toBeDefined();
        expect(result["2025-12"].total).toBe(100);
        expect(result["2025-12"].count).toBe(1);
    });

    test("agregação mensal com datas UTC-3 — 01/01 02:00 UTC conta no mês 12 do ano anterior", () => {
        const orders = [
            { paymentValue: 200, createdAt: new Date("2025-01-01T02:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2024-12"]).toBeDefined();
        expect(result["2024-12"].total).toBe(200);
        expect(result["2024-12"].count).toBe(1);
        expect(result["2025-01"]).toBeUndefined();
    });

    test("borda de ano — pedidos de dezembro e janeiro em BRT", () => {
        const orders = [
            { paymentValue: 150, createdAt: new Date("2025-12-31T23:00:00Z") },
            { paymentValue: 250, createdAt: new Date("2025-01-01T02:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-12"]).toBeDefined();
        expect(result["2025-12"].total).toBe(150);
        expect(result["2025-12"].count).toBe(1);
        expect(result["2024-12"]).toBeDefined();
        expect(result["2024-12"].total).toBe(250);
        expect(result["2024-12"].count).toBe(1);
    });

    test("createdAt como Date", () => {
        const orders = [
            { paymentValue: 50, createdAt: new Date("2025-03-10T15:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"]).toBeDefined();
        expect(result["2025-03"].total).toBe(50);
    });

    test("createdAt como {seconds}", () => {
        const orders = [
            { paymentValue: 75, createdAt: { seconds: 1741507200 } },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"]).toBeDefined();
        expect(result["2025-03"].total).toBe(75);
    });

    test("createdAt como Timestamp-like (toDate)", () => {
        const orders = [
            { paymentValue: 90, createdAt: { toDate: () => new Date("2025-03-10T15:00:00Z") } },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"]).toBeDefined();
        expect(result["2025-03"].total).toBe(90);
    });

    test("orders inválidas ignoradas — paymentValue string", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: "invalid", createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"].total).toBe(100);
        expect(result["2025-03"].count).toBe(1);
    });

    test("orders inválidas ignoradas — paymentValue undefined", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: undefined, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"].total).toBe(100);
        expect(result["2025-03"].count).toBe(1);
    });

    test("orders inválidas ignoradas — paymentValue NaN", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: NaN, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"].total).toBe(100);
        expect(result["2025-03"].count).toBe(1);
    });

    test("soma float precisa — 0.1 + 0.2 usa Math.round em centavos", () => {
        const orders = [
            { paymentValue: 0.1, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 0.2, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"].total).toBe(0.3);
    });

    test("retorna objeto vazio para array vazio", () => {
        expect(aggregateMonthlyMetrics([])).toEqual({});
    });

    test("retorna objeto vazio para undefined", () => {
        expect(aggregateMonthlyMetrics(undefined)).toEqual({});
    });

    test("agrega múltiplos pedidos no mesmo mês corretamente", () => {
        const orders = [
            { paymentValue: 10.1, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 20.2, createdAt: new Date("2025-03-11T15:00:00Z") },
            { paymentValue: 30.3, createdAt: new Date("2025-03-12T15:00:00Z") },
        ];
        const result = aggregateMonthlyMetrics(orders);
        expect(result["2025-03"].total).toBe(60.6);
        expect(result["2025-03"].count).toBe(3);
        expect(result["2025-03"].avg).toBeCloseTo(20.2, 2);
    });
});

describe("sumPaymentValues", () => {
    test("soma float precisa — 0.1 + 0.2 = 0.3 com Math.round em centavos", () => {
        const orders = [
            { paymentValue: 0.1, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 0.2, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(0.3);
    });

    test("soma múltiplos valores com centavo arredondado", () => {
        const orders = [
            { paymentValue: 10.01, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: 20.02, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(30.03);
    });

    test("ignora orders com paymentValue string", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: "50", createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });

    test("ignora orders com paymentValue undefined", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: undefined, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });

    test("ignora orders com paymentValue NaN", () => {
        const orders = [
            { paymentValue: 100, createdAt: new Date("2025-03-10T15:00:00Z") },
            { paymentValue: NaN, createdAt: new Date("2025-03-10T16:00:00Z") },
        ];
        expect(sumPaymentValues(orders)).toBe(100);
    });

    test("retorna 0 para array vazio", () => {
        expect(sumPaymentValues([])).toBe(0);
    });

    test("retorna 0 para undefined", () => {
        expect(sumPaymentValues(undefined)).toBe(0);
    });
});
