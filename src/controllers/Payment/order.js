import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { convertSecondsToDate } from "../../utils/convertSecondsToDate";

let cachedApprovedOrders = [];
let cachedApprovedOrdersAt = 0;
const APPROVED_ORDERS_CACHE_TTL_MS = 60000;
const cachedApprovedOrdersByYear = {};

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
        const updatedAtRaw =
            normalizeFirestoreDate(order.updatedAt) || createdAt;

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
                order?.idOrder &&
                typeof order?.paymentValue === "number" &&
                order?.createdAt instanceof Date,
        )
        .sort((a, b) => b.createdAt - a.createdAt);
};

export const savePaymentOrder = async (dataOrder) => {
    try {
        const userDoc = doc(firestore, models.orders, dataOrder.idOrder);

        await setDoc(userDoc, {
            ...dataOrder,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const savePublicationPaymentOrder = async (
    orderId,
    paymentUrl,
    dataPublication,
    dataCupomPayment,
) => {
    try {
        const userDoc = doc(firestore, models.orders, orderId);

        await setDoc(
            userDoc,
            {
                paymentUrl,
                dataPublication,
                dataCupomPayment,
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

export const savePublicationPaymentPixOrder = async (
    orderId,
    paymentLog,
    dataPublication,
    dataCupomPayment,
) => {
    try {
        const userDoc = doc(firestore, models.orders, orderId);

        await setDoc(
            userDoc,
            {
                paymentLog,
                dataPublication,
                dataCupomPayment,
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

export const getPaymentUrl = async (orderId) => {
    try {
        const response = await (
            await fetch(
                `https://paymentgenerateurl-73bqtyvvfq-uc.a.run.app?orderId=${orderId}`,
            )
        ).json();

        if (!response.error) {
            return response;
        }

        return response;
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
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

        if (!response.error) {
            return response;
        }

        return response;
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: null,
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
        const userDoc = doc(firestore, models.orders, orderId);

        await setDoc(
            userDoc,
            {
                ...dataOrder,
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

export const getAllUserOrders = async (userId) => {
    try {
        const ordersRef = collection(firestore, models.orders);
        const queryConfig = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataOrders = [];

        querySnapshot.forEach((order) => {
            dataOrders.push(order.data());
        });

        return {
            error: false,
            data: dataOrders,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};

export const getAllApprovedOrders = async () => {
    try {
        const now = Date.now();
        if (
            cachedApprovedOrders.length > 0 &&
            now - cachedApprovedOrdersAt < APPROVED_ORDERS_CACHE_TTL_MS
        ) {
            return {
                error: false,
                data: cachedApprovedOrders,
            };
        }

        const ordersRef = collection(firestore, models.orders);
        const queryConfig = query(ordersRef, where("status", "==", "approved"));

        const querySnapshot = await getDocs(queryConfig);
        const dataOrders = [];

        querySnapshot.forEach((order) => {
            dataOrders.push(order.data());
        });

        const validOrders = normalizeAndFilterApprovedOrders(dataOrders);

        cachedApprovedOrders = validOrders;
        cachedApprovedOrdersAt = now;

        return {
            error: false,
            data: validOrders,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
            message: error?.message || "unknown_error",
        };
    }
};

export const getApprovedOrdersByYear = async (year) => {
    try {
        const normalizedYear = Number(year);
        const now = Date.now();
        const cacheKey = String(normalizedYear);
        const cached = cachedApprovedOrdersByYear[cacheKey];

        if (cached && now - cached.at < APPROVED_ORDERS_CACHE_TTL_MS) {
            return {
                error: false,
                data: cached.data,
            };
        }

        const start = new Date(normalizedYear, 0, 1);
        const end = new Date(normalizedYear + 1, 0, 1);
        const ordersRef = collection(firestore, models.orders);

        const queryConfig = query(
            ordersRef,
            where("status", "==", "approved"),
            where("createdAt", ">=", start),
            where("createdAt", "<", end),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataOrders = [];
        querySnapshot.forEach((order) => {
            dataOrders.push(order.data());
        });

        const validOrders = normalizeAndFilterApprovedOrders(dataOrders);
        cachedApprovedOrdersByYear[cacheKey] = {
            at: now,
            data: validOrders,
        };

        return {
            error: false,
            data: validOrders,
        };
    } catch (error) {
        Sentry.captureException(error);

        const fallback = await getAllApprovedOrders();
        if (!fallback.error) {
            const filtered = fallback.data.filter(
                (order) => order.createdAt.getFullYear() === Number(year),
            );
            return {
                error: false,
                data: filtered,
                fallback: true,
            };
        }

        return {
            error: true,
            data: [],
            message: error?.message || "unknown_error",
        };
    }
};
