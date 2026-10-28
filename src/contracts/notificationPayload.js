const NOTIFICATION_TYPES = Object.freeze({
    CHAT: "chat",
    ATTENTION: "attention",
    PUBLICATION: "publication",
    REGISTER_MY_ADS: "registerMyAds",
});

const REQUIRED_FIELDS = {
    [NOTIFICATION_TYPES.CHAT]: ["chatId", "publicationId", "sellerId", "buyerId", "sellerName", "buyerName"],
    [NOTIFICATION_TYPES.ATTENTION]: ["chatId", "publicationId", "sellerId", "buyerId", "sellerName", "buyerName"],
    [NOTIFICATION_TYPES.PUBLICATION]: ["publicationId"],
    [NOTIFICATION_TYPES.REGISTER_MY_ADS]: [],
};

const ALLOWED_FIELDS = {
    [NOTIFICATION_TYPES.CHAT]: ["type", "chatId", "publicationId", "sellerId", "buyerId", "sellerName", "buyerName"],
    [NOTIFICATION_TYPES.ATTENTION]: ["type", "chatId", "publicationId", "sellerId", "buyerId", "sellerName", "buyerName"],
    [NOTIFICATION_TYPES.PUBLICATION]: ["type", "publicationId"],
    [NOTIFICATION_TYPES.REGISTER_MY_ADS]: ["type"],
};

const isValidString = (value) => typeof value === "string" && value.trim() !== "";

const validateNotificationPayload = (data) => {
    const errors = [];

    if (!data || typeof data !== "object") {
        return { valid: false, errors: ["Payload deve ser um objeto."] };
    }

    if (!data.type || typeof data.type !== "string") {
        return { valid: false, errors: ["type é obrigatório e deve ser uma string."] };
    }

    const trimmedType = data.type.trim();
    const validTypes = Object.values(NOTIFICATION_TYPES);
    if (!validTypes.includes(trimmedType)) {
        return {
            valid: false,
            errors: [`type "${trimmedType}" não é um tipo de notificação válido.`],
        };
    }

    const required = REQUIRED_FIELDS[trimmedType];
    for (const field of required) {
        if (data[field] === undefined || data[field] === null) {
            errors.push(`${field} é obrigatório para o tipo "${trimmedType}".`);
        } else if (!isValidString(data[field])) {
            errors.push(`${field} deve ser uma string não vazia para o tipo "${trimmedType}".`);
        }
    }

    return { valid: errors.length === 0, errors };
};

const normalizeNotificationPayload = (data) => {
    if (!data || typeof data !== "object") {
        return null;
    }

    const type = typeof data.type === "string" ? data.type.trim() : "";
    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
        return null;
    }

    const allowed = ALLOWED_FIELDS[type];
    const normalized = { type };

    for (const field of allowed) {
        if (field === "type") continue;
        const value = data[field];
        if (value !== undefined && value !== null && typeof value === "string") {
            normalized[field] = value.trim();
        } else if (value !== undefined && value !== null) {
            normalized[field] = value;
        }
    }

    return normalized;
};

module.exports = {
    NOTIFICATION_TYPES,
    REQUIRED_FIELDS,
    validateNotificationPayload,
    normalizeNotificationPayload,
};
module.exports.default = {
    NOTIFICATION_TYPES,
    REQUIRED_FIELDS,
    validateNotificationPayload,
    normalizeNotificationPayload,
};
