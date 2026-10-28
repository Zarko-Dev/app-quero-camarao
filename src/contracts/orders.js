const ORDER_STATUS = Object.freeze({
    PENDING: "pending",
    APPROVED: "approved",
    CANCELLED: "cancelled",
});

const isValidEmail = (value) =>
    typeof value === "string" && value.includes("@") && value.includes(".");

const normalizeFirestoreDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value?.toDate === "function") return value.toDate();
    if (typeof value?.seconds === "number") {
        return new Date(value.seconds * 1000);
    }
    if (typeof value === "string") {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
};

const validateOrder = (order) => {
    const errors = [];

    if (!order || typeof order !== "object") {
        return { valid: false, errors: ["Order deve ser um objeto."] };
    }

    if (typeof order.idOrder !== "string" || order.idOrder.trim() === "") {
        errors.push("idOrder é obrigatório e deve ser uma string não vazia.");
    }

    if (typeof order.userId !== "string" || !isValidEmail(order.userId)) {
        errors.push("userId é obrigatório e deve ser um email válido.");
    }

    if (typeof order.paymentValue !== "number" || Number.isNaN(order.paymentValue)) {
        errors.push("paymentValue é obrigatório e deve ser um número.");
    }

    if (order.status !== undefined && order.status !== null && typeof order.status !== "string") {
        errors.push("status deve ser uma string.");
    }

    if (order.published !== undefined && order.published !== null && typeof order.published !== "boolean") {
        errors.push("published deve ser um boolean.");
    }

    if (order.dataPublication !== undefined && order.dataPublication !== null) {
        if (typeof order.dataPublication !== "object") {
            errors.push("dataPublication deve ser um objeto.");
        } else {
            if (typeof order.dataPublication.id !== "string" || order.dataPublication.id.trim() === "") {
                errors.push("dataPublication.id é obrigatório e deve ser uma string não vazia.");
            }
            if (!Array.isArray(order.dataPublication.shrimps)) {
                errors.push("dataPublication.shrimps deve ser um array.");
            }
        }
    }

    if (order.dataCupomPayment !== undefined && order.dataCupomPayment !== null && typeof order.dataCupomPayment !== "object") {
        errors.push("dataCupomPayment deve ser um objeto ou null.");
    }

    if (order.paymentUrl !== undefined && order.paymentUrl !== null && typeof order.paymentUrl !== "string") {
        errors.push("paymentUrl deve ser uma string ou null.");
    }

    if (order.paymentLog !== undefined && order.paymentLog !== null && typeof order.paymentLog !== "object") {
        errors.push("paymentLog deve ser um objeto ou null.");
    }

    if (order.createdAt !== undefined && order.createdAt !== null && !normalizeFirestoreDate(order.createdAt)) {
        errors.push("createdAt deve ser uma data válida.");
    }

    if (order.updatedAt !== undefined && order.updatedAt !== null && !normalizeFirestoreDate(order.updatedAt)) {
        errors.push("updatedAt deve ser uma data válida.");
    }

    return { valid: errors.length === 0, errors };
};

const normalizeOrder = (order) => {
    if (!order || typeof order !== "object") {
        return { valid: false, errors: ["Order deve ser um objeto."], order: null };
    }

    const normalized = {
        idOrder: typeof order.idOrder === "string" ? order.idOrder.trim() : "",
        userId: typeof order.userId === "string" ? order.userId.trim() : "",
        paymentValue: typeof order.paymentValue === "number" && !Number.isNaN(order.paymentValue) ? order.paymentValue : 0,
        status: typeof order.status === "string" ? order.status : null,
        published: typeof order.published === "boolean" ? order.published : false,
        dataPublication: null,
        dataCupomPayment: order.dataCupomPayment ?? null,
        paymentUrl: typeof order.paymentUrl === "string" ? order.paymentUrl : null,
        paymentLog: order.paymentLog ?? null,
        createdAt: normalizeFirestoreDate(order.createdAt),
        updatedAt: normalizeFirestoreDate(order.updatedAt),
    };

    if (order.dataPublication && typeof order.dataPublication === "object" && order.dataPublication !== null) {
        normalized.dataPublication = {
            id: typeof order.dataPublication.id === "string" ? order.dataPublication.id.trim() : "",
            shrimps: Array.isArray(order.dataPublication.shrimps) ? order.dataPublication.shrimps : [],
        };
    }

    return {
        valid: true,
        errors: [],
        order: normalized,
    };
};

module.exports = {
    ORDER_STATUS,
    validateOrder,
    normalizeOrder,
};
module.exports.default = {
    ORDER_STATUS,
    validateOrder,
    normalizeOrder,
};
