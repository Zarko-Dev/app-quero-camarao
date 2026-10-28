import {
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { convertSecondsToDate } from "../utils/convertSecondsToDate";

const normalizeFirestoreDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value?.toDate === "function") return value.toDate();
    if (typeof value?.seconds === "number") {
        return convertSecondsToDate(value.seconds);
    }
    if (typeof value === "string") {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
};

const normalizeOrder = (order, { utcMinus3 = false } = {}) => {
    if (!order || typeof order !== "object") {
        return null;
    }

    let createdAt = normalizeFirestoreDate(order.createdAt);
    let updatedAt = normalizeFirestoreDate(order.updatedAt) || createdAt;

    // Original normalizeAndFilterApprovedOrders aplicava -3h (BRT) nos pedidos
    // consumidos por métricas/admin para evitar erro de mês/ano em borda.
    if (utcMinus3) {
        createdAt = createdAt || new Date();
        updatedAt = updatedAt || createdAt;
        createdAt.setHours(createdAt.getHours() - 3);
        updatedAt.setHours(updatedAt.getHours() - 3);
    }

    return {
        ...order,
        user: order.user || {},
        dataPublication: {
            ...order.dataPublication,
            shrimps: Array.isArray(order?.dataPublication?.shrimps)
                ? order.dataPublication.shrimps
                : [],
        },
        createdAt: createdAt || new Date(),
        updatedAt: updatedAt || new Date(),
    };
};

const isValidOrder = (order) =>
    !!order?.idOrder
    && typeof order?.paymentValue === "number"
    && !Number.isNaN(order?.paymentValue);

const sortByCreatedAtDesc = (a, b) => b.createdAt - a.createdAt;

export const getAllUserOrders = async (userId) => {
    try {
        const ordersRef = collection(firestore, models.orders);
        const queryConfig = query(
            ordersRef,
            where("userId", "==", userId),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataOrders = [];

        querySnapshot.forEach((docSnap) => {
            dataOrders.push(docSnap.data());
        });

        const normalized = dataOrders
            .map(normalizeOrder)
            .filter((order) => order !== null && isValidOrder(order))
            .sort(sortByCreatedAtDesc);

        return {
            error: false,
            data: normalized,
        };
    } catch (error) {
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

        querySnapshot.forEach((docSnap) => {
            dataOrders.push(docSnap.data());
        });

        const normalized = dataOrders
            .map((order) => normalizeOrder(order, { utcMinus3: true }))
            .filter((order) => order !== null && isValidOrder(order))
            .sort(sortByCreatedAtDesc);

        return {
            error: false,
            data: normalized,
        };
    } catch (error) {
        return {
            error: true,
            data: [],
            message: error?.message || "unknown_error",
        };
    }
};

export const getAllOrdersByYear = async (year) => {
    try {
        const normalizedYear = Number(year);
        const start = new Date(normalizedYear, 0, 1);
        const end = new Date(normalizedYear + 1, 0, 1);

        const ordersRef = collection(firestore, models.orders);
        const queryConfig = query(
            ordersRef,
            where("createdAt", ">=", start),
            where("createdAt", "<", end),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataOrders = [];

        querySnapshot.forEach((docSnap) => {
            dataOrders.push(docSnap.data());
        });

        const normalized = dataOrders
            .map((order) => normalizeOrder(order, { utcMinus3: true }))
            .filter((order) => order !== null && isValidOrder(order))
            .sort(sortByCreatedAtDesc);

        return {
            error: false,
            data: normalized,
        };
    } catch (error) {
        return {
            error: true,
            data: [],
            message: error?.message || "unknown_error",
        };
    }
};
