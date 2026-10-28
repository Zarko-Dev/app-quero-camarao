import * as Sentry from "@sentry/react-native";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
    where,
} from "../../services/FirebaseAdapter";
import * as OrdersReader from "../../repositories/OrdersReader";
import {
    ORDER_STATUS,
    normalizeOrder,
    validateOrder,
} from "../../contracts/orders";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

const normalizeFirestoreDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return new Date(value);
    if (typeof value?.toDate === "function") return value.toDate();
    if (typeof value?.seconds === "number") {
        return convertSecondsToDate(value.seconds);
    }
    return null;
};

const normalizeAndFilterApprovedOrders = (dataOrders) => {
    const orders = dataOrders.map((order) => {
        const createdAt = normalizeFirestoreDate(order.createdAt);
        const updatedAtRaw = normalizeFirestoreDate(order.updatedAt) || createdAt;

        const normalizedCreatedAt = createdAt || new Date();
        const normalizedUpdatedAt = updatedAtRaw || new Date();

        normalizedCreatedAt.setHours(normalizedCreatedAt.getHours() - 3);
        normalizedUpdatedAt.setHours(normalizedUpdatedAt.getHours() - 3);

        return {
            ...order,
            user: order.user || {},
            dataPublication: {
                ...order.dataPublication,
                shrimps: Array.isArray(order?.dataPublication?.shrimps)
                    ? order.dataPublication.shrimps
                    : [],
            },
            createdAt: normalizedCreatedAt,
            updatedAt: normalizedUpdatedAt,
        };
    });

    return orders
        .filter(
            (order) =>
                order?.idOrder
                && typeof order?.paymentValue === "number"
                && order?.createdAt instanceof Date,
        )
        .sort((a, b) => b.createdAt - a.createdAt);
};

export const savePaymentOrder = async (dataOrder) => {
    try {
        const validation = validateOrder(dataOrder);
        if (!validation.valid) {
            Sentry.captureException(
                new Error(`Order inválida: ${validation.errors.join("; ")}`),
            );
            return false;
        }

        const normalized = normalizeOrder(dataOrder);
        // Preserva campos fora do whitelist do contrato (user, endereço etc.).
        const payload = {
            ...dataOrder,
            ...normalized.order,
            user: dataOrder.user,
        };
        const userDoc = doc(firestore, models.orders, dataOrder.idOrder);

        await setDoc(userDoc, {
            ...payload,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

const sanitizePayload = (payload) => JSON.parse(JSON.stringify(payload));

export const savePublicationPaymentOrder = async (
    orderId,
    paymentUrl,
    dataPublication,
    dataCupomPayment,
) => {
    try {
        const userDoc = doc(firestore, models.orders, orderId);

        const payload = sanitizePayload({
            paymentUrl: paymentUrl || null,
            dataPublication: dataPublication || null,
            dataCupomPayment: dataCupomPayment || null,
        });
        payload.updatedAt = new Date();

        await setDoc(
            userDoc,
            payload,
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const savePublicationPaymentPixOrder = async (
    orderId,
    paymentLog,
    dataPublication,
    dataCupomPayment,
) => {
    try {
        const userDoc = doc(firestore, models.orders, orderId);

        const payload = sanitizePayload({
            paymentLog: paymentLog || null,
            dataPublication: dataPublication || null,
            dataCupomPayment: dataCupomPayment || null,
        });
        payload.updatedAt = new Date();

        await setDoc(
            userDoc,
            payload,
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const getPaymentUrl = async (orderId) => {
    try {
        const response = await (
            await fetch(
                `https://paymentgenerateurl-73bqtyvvfq-uc.a.run.app?orderId=${orderId}`,
            )
        ).json();

        return response;
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
            message: error?.message || "Não foi possível gerar o pagamento.",
        };
    }
};

export const getPaymentPix = async (orderId) => {
    try {
        const response = await (
            await fetch(
                `https://paymentpix-73bqtyvvfq-uc.a.run.app?orderId=${orderId}`,
            )
        ).json();

        return response;
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
            message: error?.message || "Não foi possível gerar o Pix.",
        };
    }
};

export const getPaymentOrder = async (orderId) => {
    try {
        const shrimpPondsRef = collection(firestore, models.orders);
        const queryConfig = query(
            shrimpPondsRef,
            where("idOrder", "==", orderId),
        );

        const querySnapshot = await getDocs(queryConfig);
        const firstDoc = querySnapshot.docs[0];

        if (firstDoc?.exists()) {
            return {
                error: false,
                data: firstDoc.data(),
            };
        }

        return {
            error: true,
            data: null,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
        };
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const validStatuses = Object.values(ORDER_STATUS);
        if (!validStatuses.includes(status)) {
            Sentry.captureException(
                new Error(`Status de ordem inválido: ${status}`),
            );
            return false;
        }

        const userDoc = doc(firestore, models.orders, orderId);

        await setDoc(
            userDoc,
            {
                status,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const updateOrder = async (orderId, dataOrder) => {
    try {
        // updateOrder grava só status/published/paymentLog (merge) e recebe
        // payloads parciais (p.ex. { status: "approved" } no CardOrder). Valida
        // esses campos, coerente com a regra onlyChanges do firestore.
        const { status, published, paymentLog } = dataOrder;
        const errors = [];
        if (status !== undefined && typeof status !== "string") {
            errors.push("status deve ser string");
        }
        if (published !== undefined && typeof published !== "boolean") {
            errors.push("published deve ser boolean");
        }
        if (paymentLog !== undefined && paymentLog !== null && typeof paymentLog !== "object") {
            errors.push("paymentLog deve ser objeto ou null");
        }
        if (errors.length > 0) {
            Sentry.captureException(
                new Error(`Order inválida: ${errors.join("; ")}`),
            );
            return false;
        }

        const userDoc = doc(firestore, models.orders, orderId);
        const allowedFields = ["status", "published", "paymentLog"];
        const updateData = {};
        for (const field of allowedFields) {
            if (dataOrder[field] !== undefined) {
                updateData[field] = dataOrder[field];
            }
        }
        updateData.updatedAt = new Date();

        await setDoc(
            userDoc,
            updateData,
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const deleteOrder = async (orderId) => {
    try {
        const orderRef = doc(firestore, models.orders, orderId);
        await deleteDoc(orderRef);

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const getAllUserOrders = async (userId) => OrdersReader.getAllUserOrders(userId);

export const getApprovedOrdersByYear = async (year) => OrdersReader.getApprovedOrdersByYear(year);

export const getAllOrdersByYear = async (year) => OrdersReader.getAllOrdersByYear(year);
