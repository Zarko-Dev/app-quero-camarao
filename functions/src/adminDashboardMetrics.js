const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

function toDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value.toDate === "function") return value.toDate();
    if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthKeyOf(date) {
    const brt = new Date(date.getTime() - BRT_OFFSET_MS);
    const year = brt.getUTCFullYear();
    const month = String(brt.getUTCMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function isValidOrder(order) {
    if (!order || typeof order !== "object") return false;
    const pv = order.paymentValue;
    return typeof pv === "number" && Number.isFinite(pv);
}

function aggregateMonthlyMetrics(orders) {
    const result = {};
    (orders || []).forEach((order) => {
        if (!isValidOrder(order)) return;
        const date = toDate(order.createdAt);
        if (!date) return;
        const key = monthKeyOf(date);
        if (!result[key]) {
            result[key] = { total: 0, count: 0 };
        }
        result[key].total = Math.round((result[key].total * 100 + Math.round(order.paymentValue * 100))) / 100;
        result[key].count += 1;
    });
    for (const key of Object.keys(result)) {
        result[key].avg = Math.round((result[key].total / result[key].count) * 100) / 100;
    }
    return result;
}

function sumPaymentValues(orders) {
    let totalCents = 0;
    (orders || []).forEach((order) => {
        if (!isValidOrder(order)) return;
        totalCents += Math.round(order.paymentValue * 100);
    });
    return Math.round(totalCents) / 100;
}

async function isAdmin(db, email) {
    if (!email) return false;
    const snap = await db.collection("users").doc(email).get();
    if (!snap.exists) return false;
    const rules = snap.data()?.rules;
    return Array.isArray(rules) && rules.includes("Admin");
}

async function fetchApprovedOrders(db) {
    const snap = await db.collection("orders")
        .where("status", "==", "approved")
        .get();
    return snap.docs.map((doc) => doc.data());
}

async function fetchAllOrdersStatusCounts(db) {
    const snap = await db.collection("orders").get();
    const counts = {};
    snap.docs.forEach((doc) => {
        const status = doc.data()?.status;
        if (status) counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
}

const handleAdminDashboardMetrics = async (request, db = admin.firestore()) => {
    const email = request.auth?.token?.email;

    if (!(await isAdmin(db, email))) {
        return { error: true, data: null, message: "Acesso negado. Apenas administradores podem acessar este recurso." };
    }

    const approvedOrders = await fetchApprovedOrders(db);
    const statusCounts = await fetchAllOrdersStatusCounts(db);

    const totalRevenue = sumPaymentValues(approvedOrders);
    const count = approvedOrders.length;
    const averageTicket = count > 0 ? Math.round((totalRevenue / count) * 100) / 100 : 0;

    const monthlyRaw = aggregateMonthlyMetrics(approvedOrders);
    const monthly = Object.entries(monthlyRaw)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, { total }]) => ({ month, revenue: total }));

    return {
        error: false,
        data: {
            totalRevenue,
            monthly,
            statusCounts,
            averageTicket,
        },
    };
};

exports.adminDashboardMetrics = onCall(
    { region: "us-central1", cors: true },
    async (request) => {
        try {
            return await handleAdminDashboardMetrics(request);
        } catch (error) {
            return { error: true, data: null, message: error.message };
        }
    },
);

exports.handleAdminDashboardMetrics = handleAdminDashboardMetrics;
exports.aggregateMonthlyMetrics = aggregateMonthlyMetrics;
exports.sumPaymentValues = sumPaymentValues;
exports.toDate = toDate;
exports.monthKeyOf = monthKeyOf;
exports.isValidOrder = isValidOrder;