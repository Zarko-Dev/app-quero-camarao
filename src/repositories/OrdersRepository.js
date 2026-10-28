import {
    collection,
    deleteDoc,
    doc,
    setDoc,
} from "../services/FirebaseAdapter";

import { firestore } from "../services/Firebase";
import { models } from "../services/Firebase/models";
import { docRef, getCollection } from "./base";
import { normalizeOrder, validateOrder } from "../contracts/orders.js";

export const savePaymentOrder = async (dataOrder) => {
    try {
        const validation = validateOrder(dataOrder);
        if (!validation.valid) {
            return false;
        }

        const orderRef = docRef(models.orders, dataOrder.idOrder);

        await setDoc(
            orderRef,
            {
                ...dataOrder,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        );

        return true;
    } catch (error) {
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
        const orderRef = docRef(models.orders, orderId);

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

        return true;
    } catch (error) {
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
        const orderRef = docRef(models.orders, orderId);

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

        return true;
    } catch (error) {
        return false;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const orderRef = docRef(models.orders, orderId);

        await setDoc(
            orderRef,
            {
                status,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const updateOrder = async (orderId, dataOrder) => {
    try {
        const validation = validateOrder(dataOrder);
        if (!validation.valid) {
            return false;
        }

        const orderRef = docRef(models.orders, orderId);

        await setDoc(
            orderRef,
            {
                ...dataOrder,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        return false;
    }
};

export const deleteOrder = async (orderId) => {
    try {
        const orderRef = docRef(models.orders, orderId);

        await deleteDoc(orderRef);

        return true;
    } catch (error) {
        return false;
    }
};
