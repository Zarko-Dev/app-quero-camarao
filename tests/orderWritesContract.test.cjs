// Testes de PAGAMENTO/PUBLICAR (ÁREA 2):
//   R5/P2: escritas de order roteiam por validateOrder (gate) + regra create
//          validando shape; updateOrderStatus valida contra ORDER_STATUS.
//   1a: export quebrado getAllApprovedOrders removido do controller.
//   1b: ajuste de fuso -3h (BRT) restaurado nas leituras de orders de Admin.
//   R7: ramo morto if/else removido e campo message no erro do fetch.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readSource = (rel) =>
    fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

// ---- 1b: modelagem do ajuste BRT (-3h) sobre a borda de mês/ano -------------
// Mesmo raciocínio do monthKeyOf de functions/src/adminDashboardMetrics (UTC-3).
const shiftBrt = (iso) => {
    const d = new Date(iso);
    d.setHours(d.getHours() - 3);
    return d;
};

describe("Ajuste de fuso UTC-3 (BRT) nas métricas/admin", () => {
    test("31/12 23:00 UTC vira 20:00 BRT ainda em 2025 (mês 12)", () => {
        const d = shiftBrt("2025-12-31T23:00:00Z");
        assert.equal(d.getFullYear(), 2025);
        assert.equal(d.getMonth(), 11); // dezembro
    });

    test("01/01 02:00 UTC vira 31/12 23:00 BRT do ano anterior", () => {
        const d = shiftBrt("2026-01-01T02:00:00Z");
        assert.equal(d.getFullYear(), 2025);
        assert.equal(d.getMonth(), 11); // dezembro (não janeiro)
    });

    test("OrdersReader aplica utcMinus3 nas leituras consumidas por Admin", () => {
        const src = readSource("src/repositories/OrdersReader.js");
        // getApprovedOrdersByYear e getAllOrdersByYear devem deslocar -3h.
        const approvedMatches = src.match(
            /getApprovedOrdersByYear[\s\S]*?normalizeOrder\(order, \{ utcMinus3: true \}\)/,
        );
        const allMatches = src.match(
            /getAllOrdersByYear[\s\S]*?normalizeOrder\(order, \{ utcMinus3: true \}\)/,
        );
        assert.ok(approvedMatches, "approved-by-year deve aplicar utcMinus3");
        assert.ok(allMatches, "all-orders-by-year deve aplicar utcMinus3");
    });

    test("getAllUserOrders NÃO desloca (datas do usuário sem BRT shift)", () => {
        const src = readSource("src/repositories/OrdersReader.js");
        const userBlock = src.match(
            /getAllUserOrders[\s\S]*?\.map\(normalizeOrder\)/,
        );
        assert.ok(userBlock, "getAllUserOrders mantém normalize sem shift");
    });
});

describe("Contrato de escrita de order (validateOrder)", () => {
    test("savePaymentOrder valida antes do setDoc", () => {
        const src = readSource("src/controllers/Payment/order.js");
        const block = src.match(/savePaymentOrder[\s\S]*?validateOrder\(dataOrder\)/);
        assert.ok(block, "savePaymentOrder deve chamar validateOrder");
        assert.match(src, /normalizeOrder\(dataOrder\)/);
    });
    test("updateOrder valida os campos gravados (status/published/paymentLog)", () => {
        const src = readSource("src/controllers/Payment/order.js");
        const block = src.match(/updateOrder[\s\S]*?allowedFields = \["status"/);
        assert.ok(block, "updateOrder deve validar antes do setDoc");
        assert.match(src, /paymentLog deve ser objeto ou null/);
        assert.match(src, /published deve ser boolean/);
    });
    test("updateOrderStatus valida status contra ORDER_STATUS", () => {
        const src = readSource("src/controllers/Payment/order.js");
        assert.match(src, /Object\.values\(ORDER_STATUS\)/);
        assert.match(src, /updateOrderStatus[\s\S]*?validStatuses\.includes\(status\)/);
    });
    test("import morto de OrdersWriter removido", () => {
        const src = readSource("src/controllers/Payment/order.js");
        assert.doesNotMatch(src, /repositories\/OrdersWriter/);
    });
    test("export quebrado getAllApprovedOrders removido", () => {
        const src = readSource("src/controllers/Payment/order.js");
        assert.doesNotMatch(src, /getAllApprovedOrders = async/);
    });
    test("getPaymentUrl/getPaymentPix sem ramo morto e com campo message", () => {
        const src = readSource("src/controllers/Payment/order.js");
        assert.doesNotMatch(src, /if \(!response\.error\)/);
        assert.match(src, /message: error\?\.message \|\| /);
    });
});

describe("Regra Firestore orders.create (shape válido)", () => {
    // shape estrito vive em firestore.rules.strict (firestore.rules ativa mantém orders do HEAD p/ app antigo, expand/contract)
    const rules = readSource("firestore.rules.strict");
    test("valida userId do auth", () => {
        assert.match(rules, /myEmail\(\) == request\.resource\.data\.userId/);
    });
    test("valida idOrder == orderId", () => {
        assert.match(rules, /request\.resource\.data\.idOrder == orderId/);
    });
    test("valida paymentValue numérico, status string e user presente", () => {
        assert.match(rules, /request\.resource\.data\.paymentValue is number/);
        assert.match(rules, /request\.resource\.data\.status is string/);
        assert.match(rules, /request\.resource\.data\.user is map/);
    });
});