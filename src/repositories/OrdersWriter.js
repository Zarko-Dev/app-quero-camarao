import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { validateOrder, ORDER_STATUS } from "../contracts/orders";

const normalizeFirestoreDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value?.toDate === "function") return value.toDate();
    return null;
};

const buildOrderForValidation = (existing, overrides = {}) => {
    const createdAt = normalizeFirestoreDate(existing.createdAt);
    const updatedAt = normalizeFirestoreDate(existing.updatedAt) || createdAt;

    return {
        idOrder: typeof existing.idOrder === "string" ? existing.idOrder : "",
        userId: typeof existing.userId === "string" ? existing.userId : "",
        paymentValue:
            typeof existing.paymentValue === "number" && !Number.isNaN(existing.paymentValue)
                ? existing.paymentValue
                : 0,
        status: typeof existing.status === "string" ? existing.status : null,
        published: typeof existing.published === "boolean" ? existing.published : false,
        dataPublication:
            existing.dataPublication && typeof existing.dataPublication === "object"
                ? existing.dataPublication
                : null,
        dataCupomPayment: existing.dataCupomPayment ?? null,
        paymentUrl: typeof existing.paymentUrl === "string" ? existing.paymentUrl : null,
        paymentLog: existing.paymentLog ?? null,
        createdAt: createdAt || new Date(),
        updatedAt: updatedAt || new Date(),
        ...overrides,
    };
};

export const savePaymentOrder = async (dataOrder) => {
    try {
        const validation = validateOrder(dataOrder);
        if (!validation.valid) {
            return { error: true, message: validation.errors.join("; ") };
        }

        const userDoc = doc(firestore, models.orders, dataOrder.idOrder);

        await setDoc(userDoc, {
            ...dataOrder,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return { error: false };
    } catch (error) {
        return { error: true, message: error?.message || "unknown_error" };
    }
};

export const savePublicationPaymentOrder = async (
    orderId,
    paymentUrl,
    dataPublication,
    dataCupomPayment,
) => {
    try {
        const orderRef = doc(firestore, models.orders, orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return { error: true, message: "Ordem não encontrada." };
        }

        const existing = orderSnap.data();
        const orderForValidation = buildOrderForValidation(existing, {
            paymentUrl: typeof paymentUrl === "string" ? paymentUrl : null,
            dataPublication,
            dataCupomPayment,
        });

        const validation = validateOrder(orderForValidation);
        if (!validation.valid) {
            return { error: true, message: validation.errors.join("; ") };
        }

        await setDoc(
            orderRef,
            {
                paymentUrl,
                dataPublication,
                dataCupomPayment,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return { error: false };
    } catch (error) {
        return { error: true, message: error?.message || "unknown_error" };
    }
};

export const savePublicationPaymentPixOrder = async (
    orderId,
    paymentLog,
    dataPublication,
    dataCupomPayment,
) => {
    try {
        const orderRef = doc(firestore, models.orders, orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return { error: true, message: "Ordem não encontrada." };
        }

        const existing = orderSnap.data();
        const orderForValidation = buildOrderForValidation(existing, {
            paymentLog,
            dataPublication,
            dataCupomPayment,
        });

        const validation = validateOrder(orderForValidation);
        if (!validation.valid) {
            return { error: true, message: validation.errors.join("; ") };
        }

        await setDoc(
            orderRef,
            {
                paymentLog,
                dataPublication,
                dataCupomPayment,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return { error: false };
    } catch (error) {
        return { error: true, message: error?.message || "unknown_error" };
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const validStatuses = Object.values(ORDER_STATUS);
        if (!validStatuses.includes(status)) {
            return { error: true, message: `Status inválido: ${status}` };
        }

        const orderRef = doc(firestore, models.orders, orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return { error: true, message: "Ordem não encontrada." };
        }

        const existing = orderSnap.data();
        const orderForValidation = buildOrderForValidation(existing, { status });

        const validation = validateOrder(orderForValidation);
        if (!validation.valid) {
            return { error: true, message: validation.errors.join("; ") };
        }

        await setDoc(
            orderRef,
            {
                status,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return { error: false };
    } catch (error) {
        return { error: true, message: error?.message || "unknown_error" };
    }
};

export const updateOrder = async (orderId, dataOrder) => {
    try {
        const orderRef = doc(firestore, models.orders, orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return { error: true, message: "Ordem não encontrada." };
        }

        const existing = orderSnap.data();
        const orderForValidation = buildOrderForValidation(existing, dataOrder);

        const validation = validateOrder(orderForValidation);
        if (!validation.valid) {
            return { error: true, message: validation.errors.join("; ") };
        }

        await setDoc(
            orderRef,
            {
                ...dataOrder,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return { error: false };
    } catch (error) {
        return { error: true, message: error?.message || "unknown_error" };
    }
};

export const deleteOrder = async (orderId) => {
    try {
        const orderRef = doc(firestore, models.orders, orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return { error: true, message: "Ordem não encontrada." };
        }

        const existing = orderSnap.data();
        const orderForValidation = buildOrderForValidation(existing);

        const validation = validateOrder(orderForValidation);
        if (!validation.valid) {
            return { error: true, message: validation.errors.join("; ") };
        }

        await deleteDoc(orderRef);

        return { error: false };
    } catch (error) {
        return { error: true, message: error?.message || "unknown_error" };
    }
};
