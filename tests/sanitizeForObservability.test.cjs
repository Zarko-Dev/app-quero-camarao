const test = require("node:test");
const assert = require("node:assert/strict");

const {
    maskEmail,
    maskPhone,
    maskCPF,
    maskToken,
    maskPaymentValue,
    removeSensitiveKeys,
    sanitizeForObservability,
} = require("../src/utils/sanitizeForObservability");

test("maskEmail - masks standard email", () => {
    assert.equal(maskEmail("pedro@example.com"), "p***@e***.com");
});

test("maskEmail - masks email with subdomain", () => {
    assert.equal(maskEmail("user@mail.company.com"), "u***@m***.company.com");
});

test("maskEmail - returns *** for empty string", () => {
    assert.equal(maskEmail(""), "***");
});

test("maskEmail - returns *** for null", () => {
    assert.equal(maskEmail(null), "***");
});

test("maskEmail - returns *** for undefined", () => {
    assert.equal(maskEmail(undefined), "***");
});

test("maskEmail - handles email without @", () => {
    assert.equal(maskEmail("no-at-sign"), "***");
});

test("maskPhone - masks phone showing last 4 digits", () => {
    assert.equal(maskPhone("+5511987654321"), "***4321");
});

test("maskPhone - masks phone with dashes", () => {
    assert.equal(maskPhone("(11) 98765-4321"), "***4321");
});

test("maskPhone - returns *** for empty string", () => {
    assert.equal(maskPhone(""), "***");
});

test("maskPhone - returns *** for null", () => {
    assert.equal(maskPhone(null), "***");
});

test("maskPhone - returns *** for short digits", () => {
    assert.equal(maskPhone("123"), "***");
});

test("maskCPF - masks CPF showing last 2 digits", () => {
    assert.equal(maskCPF("123.456.789-00"), "***.***.***00");
});

test("maskCPF - masks CPF without formatting", () => {
    assert.equal(maskCPF("12345678900"), "***.***.***00");
});

test("maskCPF - returns *** for empty string", () => {
    assert.equal(maskCPF(""), "***");
});

test("maskCPF - returns *** for null", () => {
    assert.equal(maskCPF(null), "***");
});

test("maskCPF - returns *** for short CPF", () => {
    assert.equal(maskCPF("123"), "***");
});

test("maskToken - masks token showing first 4 and last 4 chars", () => {
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature";
    const masked = maskToken(token);
    assert.ok(masked.startsWith("eyJh"));
    assert.ok(masked.endsWith("ture"));
    assert.ok(masked.includes("********"));
});

test("maskToken - returns *** for empty string", () => {
    assert.equal(maskToken(""), "***");
});

test("maskToken - returns *** for null", () => {
    assert.equal(maskToken(null), "***");
});

test("maskToken - returns *** for short token", () => {
    assert.equal(maskToken("abc"), "***");
});

test("maskPaymentValue - returns range for value in 0-100", () => {
    assert.equal(maskPaymentValue(50), "0-100");
});

test("maskPaymentValue - returns range for value in 100-500", () => {
    assert.equal(maskPaymentValue(100), "100-500");
    assert.equal(maskPaymentValue(300), "100-500");
});

test("maskPaymentValue - returns range for value in 500-1000", () => {
    assert.equal(maskPaymentValue(500), "500-1000");
    assert.equal(maskPaymentValue(750), "500-1000");
});

test("maskPaymentValue - returns range for value in 1000-5000", () => {
    assert.equal(maskPaymentValue(1000), "1000-5000");
    assert.equal(maskPaymentValue(3000), "1000-5000");
});

test("maskPaymentValue - returns range for value in 5000-10000", () => {
    assert.equal(maskPaymentValue(5000), "5000-10000");
});

test("maskPaymentValue - returns range for value >= 10000", () => {
    assert.equal(maskPaymentValue(10000), "10000+");
    assert.equal(maskPaymentValue(99999), "10000+");
});

test("maskPaymentValue - returns 0 for zero value", () => {
    assert.equal(maskPaymentValue(0), "0");
});

test("maskPaymentValue - returns unknown for null", () => {
    assert.equal(maskPaymentValue(null), "unknown");
});

test("maskPaymentValue - returns unknown for undefined", () => {
    assert.equal(maskPaymentValue(undefined), "unknown");
});

test("maskPaymentValue - returns unknown for empty string", () => {
    assert.equal(maskPaymentValue(""), "unknown");
});

test("removeSensitiveKeys - removes email, phone, cpf from object", () => {
    const input = { name: "Joao", email: "joao@test.com", phone: "11987654321", cpf: "12345678900", safe: "value" };
    const result = removeSensitiveKeys(input);
    assert.equal(result.name, "Joao");
    assert.equal(result.safe, "value");
    assert.equal(result.email, undefined);
    assert.equal(result.phone, undefined);
    assert.equal(result.cpf, undefined);
});

test("removeSensitiveKeys - removes token and password", () => {
    const input = { token: "abc123", password: "secret", username: "user1" };
    const result = removeSensitiveKeys(input);
    assert.equal(result.token, undefined);
    assert.equal(result.password, undefined);
    assert.equal(result.username, "user1");
});

test("removeSensitiveKeys - supports extra keys to remove", () => {
    const input = { name: "Joao", internalId: "12345", safe: "value" };
    const result = removeSensitiveKeys(input, ["internalId"]);
    assert.equal(result.internalId, undefined);
    assert.equal(result.name, "Joao");
});

test("removeSensitiveKeys - returns non-object values as-is", () => {
    assert.equal(removeSensitiveKeys("string"), "string");
    assert.equal(removeSensitiveKeys(42), 42);
    assert.equal(removeSensitiveKeys(null), null);
});

test("sanitizeForObservability - removes sensitive keys from object", () => {
    const input = { name: "Joao", email: "joao@test.com", phone: "11987654321", safe: "value" };
    const result = sanitizeForObservability(input);
    assert.equal(result.email, undefined);
    assert.equal(result.phone, undefined);
    assert.equal(result.name, "Joao");
    assert.equal(result.safe, "value");
});

test("sanitizeForObservability - handles arrays", () => {
    const input = [{ email: "a@b.com" }, { name: "safe" }];
    const result = sanitizeForObservability(input);
    assert.equal(result[0].email, undefined);
    assert.equal(result[1].name, "safe");
});

test("sanitizeForObservability - returns primitives as-is", () => {
    assert.equal(sanitizeForObservability("string"), "string");
    assert.equal(sanitizeForObservability(42), 42);
    assert.equal(sanitizeForObservability(true), true);
});

test("sanitizeForObservability - supports extraSensitiveKeys option", () => {
    const input = { name: "Joao", internalId: "123", safe: "value" };
    const result = sanitizeForObservability(input, { extraSensitiveKeys: ["internalId"] });
    assert.equal(result.internalId, undefined);
    assert.equal(result.name, "Joao");
});

test("sanitizeForObservability - handles null input", () => {
    assert.equal(sanitizeForObservability(null), null);
});