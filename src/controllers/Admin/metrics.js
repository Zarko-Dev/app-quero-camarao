import {
    httpsCallable,
} from "../../services/FirebaseAdapter";
import * as Sentry from "@sentry/react-native";

import { functions } from "../../services/Firebase";
import { getApprovedOrdersByYear } from "../../controllers/Payment/order";
import { getCurrentYear, getCurrentExtendedMonth } from "../../utils/convertDate";

const getMonthLabel = (date) =>
    new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);

const computeMetricsFromOrders = (orders) => {
    const currentMonth = getCurrentExtendedMonth();
    const currentYear = getCurrentYear();

    const totalRevenue = (orders || []).reduce(
        (sum, order) => sum + Number(order?.paymentValue || 0),
        0,
    );

    const monthlyOrders = (orders || []).filter((order) => {
        const date = order?.createdAt;
        if (!(date instanceof Date)) return false;
        return (
            getMonthLabel(date) === String(currentMonth).toLowerCase() &&
            date.getFullYear() === Number(currentYear)
        );
    });

    const monthlyRevenue = monthlyOrders.reduce(
        (sum, order) => sum + Number(order?.paymentValue || 0),
        0,
    );

    const statusBreakdown = {};
    (orders || []).forEach((order) => {
        const status = order?.status || "unknown";
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    return {
        totalRevenue,
        monthlyRevenue,
        statusBreakdown,
    };
};

export const getAdminDashboardMetrics = async () => {
    try {
        const year = getCurrentYear();
        const fallback = await getApprovedOrdersByYear(year);

        if (fallback.error) {
            return {
                error: true,
                message: "Erro ao carregar métricas do dashboard.",
            };
        }

        const metrics = computeMetricsFromOrders(fallback.data || []);
        return { error: false, data: { ...metrics, fallback: true } };
    } catch (error) {
        Sentry.captureException(error);
        return {
            error: true,
            message: "Erro inesperado ao carregar métricas",
        };
    }
};
