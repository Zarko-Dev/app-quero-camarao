import {
    collection,
    deleteDoc,
    doc,
    getDoc,
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

        const querySnapshot = await getDoc(queryConfig);

        if (querySnapshot.exists()) {
            return {
                error: false,
                data: querySnapshot.data(),
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
        const ordersRef = collection(firestore, models.orders);
        const queryConfig = query(
            ordersRef,
            where("status", "==", "approved"),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(queryConfig);
        const dataOrders = [];

        querySnapshot.forEach((order) => {
            dataOrders.push(order.data());
        });

        const orders = dataOrders.map((order) => {
            const createdAt = convertSecondsToDate(order.createdAt.seconds);
            const updatedAt = convertSecondsToDate(order.updatedAt.seconds);

            createdAt.setHours(createdAt.getHours() - 3);
            updatedAt.setHours(updatedAt.getHours() - 3);

            return {
                ...order,
                createdAt,
                updatedAt,
            };
        });

        return {
            error: false,
            data: orders,
        };
    } catch (error) {
        Sentry.captureException(error);

        return {
            error: true,
            data: [],
        };
    }
};
