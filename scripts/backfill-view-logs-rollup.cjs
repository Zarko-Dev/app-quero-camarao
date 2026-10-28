const admin = require("../functions/node_modules/firebase-admin");
const serviceAccount = require("../api-quero-camarao-c4ef8022ba49.json");

const APPLY = process.argv.includes("--apply");
const PAGE_SIZE = 300;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const toDate = (value) => {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const monthKeyOf = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

// Recalcula do zero (não usa FieldValue.increment) - idempotente, seguro
// pra rodar mais de uma vez sem duplicar contagem.
async function fetchAllLogDocs() {
    const docs = [];
    let lastDoc = null;

    for (;;) {
        let q = db.collection("logPublicationsViews").orderBy("__name__").limit(PAGE_SIZE);
        if (lastDoc) q = q.startAfter(lastDoc);
        // eslint-disable-next-line no-await-in-loop
        const snap = await q.get();
        if (snap.empty) break;
        snap.docs.forEach((docSnap) => docs.push(docSnap));
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.docs.length < PAGE_SIZE) break;
    }

    return docs;
}

function buildRollups(logDocs) {
    const rollups = {}; // monthKey -> { daily, hourly, byPublication, totalViews }
    const monthKeys = new Set();

    logDocs.forEach((docSnap) => {
        const data = docSnap.data();
        const publicationId = data.publicationId;
        const label = data.location || "";
        const views = Array.isArray(data.views) ? data.views : [];

        views.forEach((view) => {
            const date = toDate(view?.createdAt);
            if (!date) return;
            const monthKey = monthKeyOf(date);
            monthKeys.add(monthKey);

            if (!rollups[monthKey]) {
                rollups[monthKey] = { daily: {}, hourly: {}, byPublication: {}, totalViews: 0 };
            }
            const rollup = rollups[monthKey];
            const day = String(date.getDate()).padStart(2, "0");
            const hour = String(date.getHours()).padStart(2, "0");

            rollup.daily[day] = (rollup.daily[day] || 0) + 1;
            rollup.hourly[hour] = (rollup.hourly[hour] || 0) + 1;
            rollup.totalViews += 1;

            if (publicationId) {
                if (!rollup.byPublication[publicationId]) {
                    rollup.byPublication[publicationId] = { count: 0, label };
                }
                rollup.byPublication[publicationId].count += 1;
                rollup.byPublication[publicationId].label = label;
            }
        });
    });

    return { rollups, months: Array.from(monthKeys).sort() };
}

async function main() {
    const logDocs = await fetchAllLogDocs();
    const { rollups, months } = buildRollups(logDocs);

    if (!APPLY) {
        console.log(
            JSON.stringify(
                {
                    dryRun: true,
                    totalLogDocs: logDocs.length,
                    months,
                    totalsByMonth: Object.fromEntries(
                        Object.entries(rollups).map(([m, r]) => [m, r.totalViews]),
                    ),
                    usage: "node scripts/backfill-view-logs-rollup.cjs --apply",
                },
                null,
                2,
            ),
        );
        return;
    }

    await Promise.all(
        Object.entries(rollups).map(([monthKey, rollup]) =>
            db.collection("publicationViewsRollup").doc(monthKey).set(rollup),
        ),
    );
    await db.collection("stats").doc("publicationViewsMonths").set({ months });

    console.log(
        JSON.stringify(
            {
                dryRun: false,
                totalLogDocs: logDocs.length,
                monthsWritten: months,
            },
            null,
            2,
        ),
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
