const SENSITIVE_KEYS = new Set([
    "email",
    "phone",
    "cpf",
    "cnpj",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "password",
    "secret",
    "apiKey",
    "api_key",
    "cardNumber",
    "cardNumber",
    "cvv",
    "pixKey",
    "pix_token",
    "webhookSecret",
    "dsn",
]);

function maskEmail(email) {
    if (!email || typeof email !== "string") return "***";
    const atIdx = email.indexOf("@");
    if (atIdx <= 0) return "***";
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx + 1);
    const dotIdx = domain.indexOf(".");
    if (dotIdx <= 0) return `${local[0]}***@***`;
    const domainFirst = domain[0];
    const domainRest = domain.slice(dotIdx);
    return `${local[0]}***@${domainFirst}***${domainRest}`;
}

function maskPhone(phone) {
    if (!phone || typeof phone !== "string") return "***";
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 4) return "***";
    return `***${digits.slice(-4)}`;
}

function maskCPF(cpf) {
    if (!cpf || typeof cpf !== "string") return "***";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length < 11) return "***";
    return `***.***.***${digits.slice(-2)}`;
}

function maskToken(token) {
    if (!token || typeof token !== "string") return "***";
    if (token.length <= 8) return "***";
    return `${token.slice(0, 4)}********${token.slice(-4)}`;
}

function maskPaymentValue(value) {
    if (value === undefined || value === null || value === "") return "unknown";
    const num = Number(value);
    if (Number.isNaN(num)) return "unknown";
    if (num === 0) return "0";
    const ranges = [
        [0, 100],
        [100, 500],
        [500, 1000],
        [1000, 5000],
        [5000, 10000],
        [10000, Infinity],
    ];
    for (const [lo, hi] of ranges) {
        if (num >= lo && num < hi) {
            if (hi === Infinity) return `${lo}+`;
            return `${lo}-${hi}`;
        }
    }
    return `${num}`;
}

function removeSensitiveKeys(obj, extraKeys = []) {
    if (!obj || typeof obj !== "object") return obj;
    const keysToRemove = new Set([...SENSITIVE_KEYS, ...extraKeys]);
    const result = {};
    for (const key of Object.keys(obj)) {
        if (keysToRemove.has(key)) continue;
        result[key] = obj[key];
    }
    return result;
}

function sanitizeForObservability(value, options = {}) {
    const { extraSensitiveKeys = [] } = options;
    const keysToRemove = new Set([...SENSITIVE_KEYS, ...extraSensitiveKeys]);

    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeForObservability(item, options));
    }

    if (value && typeof value === "object") {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            if (keysToRemove.has(key)) continue;
            result[key] = sanitizeForObservability(val, options);
        }
        return result;
    }

    return value;
}

module.exports = {
    maskEmail,
    maskPhone,
    maskCPF,
    maskToken,
    maskPaymentValue,
    removeSensitiveKeys,
    sanitizeForObservability,
    SENSITIVE_KEYS,
};