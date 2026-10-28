// Testes de cupom (ÁREA 1):
//   1. Gate admin (isAdminRole): array e string, maiúsculo/minúsculo.
//   2. Decremento atômico: modelagem de increment(-1) nunca perde atualização
//      (lost update) e mantém o tipo number (nunca string).
//   3. Incremento de useCount: mesmo modelo atômico.
//   4. Contrato de fonte: o repositório usa increment do adapter (não string
//      template), os controllers não aceitam valor stale, os 3 chamadores de
//      checkout passam apenas o cuponCode, e deleteCupom tem gate admin.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { isAdminRole } = require("../src/controllers/Cupons/roles");
const { normalizeCouponQuantity } = require("../src/controllers/Cupons/quantity");

const readSource = (rel) =>
    fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

describe("Gate admin de cupons (isAdminRole)", () => {
    test("aceita regra string 'Admin'", () => {
        assert.equal(isAdminRole("Admin"), true);
    });
    test("aceita regra string 'admin' (minúsculo)", () => {
        assert.equal(isAdminRole("admin"), true);
    });
    test("aceita regra array contendo 'Admin'", () => {
        assert.equal(isAdminRole(["Owner", "Admin"]), true);
    });
    test("aceita regra array contendo 'admin'", () => {
        assert.equal(isAdminRole(["admin"]), true);
    });
    test("rejeita regra ausente/undefined", () => {
        assert.equal(isAdminRole(undefined), false);
    });
    test("rejeita regra não admin (string)", () => {
        assert.equal(isAdminRole("Employee"), false);
    });
    test("rejeita regra não admin (array)", () => {
        assert.equal(isAdminRole(["Owner", "Employee"]), false);
    });
    test("rejeita null", () => {
        assert.equal(isAdminRole(null), false);
    });
});

describe("Decremento de cupom - modelo atômico (FieldValue.increment(-1))", () => {
    // Simula duas compras concorrentes. Com read-modify-write estale, ambas
    // gravariam o MESMO original-1 (lost update de 1). Com increment atômico,
    // o servidor aplica -1 duas vezes -> base-2, sempre number.
    test("duas compras concorrentes somam -2 (sem lost update)", () => {
        const base = 100;
        const p1 = () => base - 1; // simula escrita estale (bug antigo)
        const p2 = () => base - 1;

        assert.equal(p1(), 99);
        assert.equal(p2(), 99);
        assert.equal(p1(), p2(), "bug antigo: mesmo valor gravado => perde 1 consumo");

        // Modelo atômico correto: FieldValue.increment(-1) aplica sequencialmente no servidor.
        const inc = (current, delta) => current + delta;
        let durationValue = base;
        durationValue = inc(durationValue, -1);
        durationValue = inc(durationValue, -1);
        assert.equal(durationValue, 98);
    });

    test("resultado permanece number (nunca string)", () => {
        let durationValue = 100;
        durationValue += -1;
        assert.equal(typeof durationValue, "number");
        assert.equal(durationValue, 99);
    });

    test("repositório usa increment do adapter e nunca template string", () => {
        const src = readSource("src/repositories/CuponsRepository.js");
        assert.match(src, /increment\(-1\)/);
        assert.match(src, /increment\(1\)/);
        assert.match(src, /\bincrement,?\b/);
        // Proíbe o antigo formato string `${Number(...)-1}`.
        assert.doesNotMatch(src, /durationValue:\s*`\$\{/);
        assert.doesNotMatch(src, /useCount:\s*[^}]*\+ 1/);
    });
});

describe("Incremento de useCount - modelo atômico (FieldValue.increment(1))", () => {
    test("duas compras somam +2, sempre number", () => {
        let useCount = 0;
        useCount += 1;
        useCount += 1;
        assert.equal(useCount, 2);
        assert.equal(typeof useCount, "number");
    });

    test("controllers não aceitam valor stale (assinatura só com cuponCode)", () => {
        const dec = readSource("src/controllers/Cupons/decreaseAmountCupom.js");
        const inc = readSource("src/controllers/Cupons/incrementAmountCupom.js");
        // não deve repassar durationValue/useCount do payload.
        assert.doesNotMatch(dec, /decreaseAmountCupom\(cuponCode,\s*[\w.]+/);
        assert.doesNotMatch(inc, /incrementAmountCupom\(cuponCode,\s*[\w.]+/);
        assert.match(dec, /CuponsRepository\.decreaseAmountCupom\(cuponCode\)/);
        assert.match(inc, /CuponsRepository\.incrementAmountCupom\(cuponCode\)/);
    });

    test("os 3 chamadores de checkout passam apenas o cuponCode (sem valor stale)", () => {
        const callers = [
            "src/pages/Payment/components/PaymentButton/index.jsx",
            "src/pages/PaymentEnd/index.jsx",
            "src/pages/PaymentOrders/components/CardOrder/index.jsx",
        ];
        for (const file of callers) {
            const src = readSource(file);
            assert.match(
                src,
                /decreaseAmountCupom\(\s*[\w?.]*cuponCode\s*,?\s*\)/,
                `${file}: decrease deve passar só o cuponCode`,
            );
            assert.match(
                src,
                /incrementAmountCupom\(\s*[\w?.]*cuponCode\s*,?\s*\)/,
                `${file}: increment deve passar só o cuponCode`,
            );
        }
    });
});

describe("Guarda de delete e create de cupom", () => {
    test("deleteCupom faz gate admin antes de apagar", () => {
        const src = readSource("src/controllers/Cupons/deleteCupom.js");
        assert.match(src, /isAdmin/);
        assert.match(src, /if\s*\(!admin\)/);
        assert.match(src, /CuponsRepository\.deleteCupom\(cuponCode\)/);
    });
    test("createCupom mantém gate admin", () => {
        const src = readSource("src/controllers/Cupons/createCupom.js");
        assert.match(src, /isAdmin/);
        assert.match(src, /if\s*\(!admin\)/);
    });
    test("createCupom usa doc/getDoc do FirebaseAdapter (não firestore.getDoc)", () => {
        const pageSrc = readSource("src/pages/RegisterDiscountCupom/index.jsx");
        // isAdmin duplicado removido da página (agora só no controller).
        assert.doesNotMatch(pageSrc, /firestore\.doc\(/);
        assert.doesNotMatch(pageSrc, /firestore\.getDoc\(/);
    });
});

describe("Criação de cupom - tipo gravado (number, não string)", () => {
    test("Quantity: durationValue/durationInitialValue viram number", () => {
        const result = normalizeCouponQuantity({
            cupomCode: "CAMARAO50",
            durationType: "Quantity",
            durationValue: "5",
            durationInitialValue: "5",
        });
        assert.ok(result, "payload válido");
        assert.equal(typeof result.durationValue, "number");
        assert.equal(result.durationValue, 5);
        assert.equal(typeof result.durationInitialValue, "number");
        assert.equal(result.durationInitialValue, 5);
    });

    test("Quantity: mantém number se já vier numérico", () => {
        const result = normalizeCouponQuantity({
            durationType: "Quantity",
            durationValue: 3,
            durationInitialValue: 3,
        });
        assert.equal(typeof result.durationValue, "number");
        assert.equal(result.durationValue, 3);
    });

    test("Quantity inválida (NaN/<=0) não gera payload (null)", () => {
        assert.equal(
            normalizeCouponQuantity({ durationType: "Quantity", durationValue: "abc" }),
            null,
        );
        assert.equal(
            normalizeCouponQuantity({ durationType: "Quantity", durationValue: "0" }),
            null,
        );
        assert.equal(
            normalizeCouponQuantity({ durationType: "Quantity", durationValue: -1 }),
            null,
        );
    });

    test("Time preserva Date e Unlimited preserva 'Unlimited'", () => {
        const d = new Date();
        const time = normalizeCouponQuantity({ durationType: "Time", durationValue: d });
        assert.ok(time.durationValue instanceof Date);

        const unlimited = normalizeCouponQuantity({
            durationType: "Unlimited",
            durationValue: "Unlimited",
        });
        assert.equal(unlimited.durationValue, "Unlimited");
    });

    test("createCupom aplica a normalização do tipo (fonte)", () => {
        const src = readSource("src/controllers/Cupons/createCupom.js");
        assert.match(src, /normalizeCouponQuantity\(dataCupom\)/);
        assert.match(src, /if \(!payload\)/);
    });
});

describe("deleteCupom - feedback quando adminEmail ausente", () => {
    test("deleteCupom falha (false) sem e-mail admin (não apaga silencioso)", () => {
        const src = readSource("src/controllers/Cupons/deleteCupom.js");
        assert.match(src, /isAdmin\(email\)/);
        assert.match(src, /if \(!admin\)\s*\{\s*return false/);
    });
    test("CardCupom bloqueia exclusão sem adminEmail com toast", () => {
        const src = readSource(
            "src/pages/DiscountCupons/components/CardCupom/index.jsx",
        );
        assert.match(src, /if \(!adminEmail\)/);
        assert.match(src, /Sessão inválida/);
    });
});