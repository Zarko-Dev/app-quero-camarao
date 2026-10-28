const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { diffNewViews, groupNewViewsByMonth } = require("./publicationViewsAggregate");

const handlePublicationViewWritten = async (event, db = admin.firestore()) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!after) return null; // doc deletado - nunca acontece pelo client hoje

    const newEntries = diffNewViews(before?.views, after.views);
    if (newEntries.length === 0) return null;

    const byMonth = groupNewViewsByMonth(newEntries);
    const monthKeys = Object.keys(byMonth);
    if (monthKeys.length === 0) return null;

    const { FieldValue } = admin.firestore;
    const publicationId = after.publicationId;
    const label = after.location || "";

    await Promise.all(monthKeys.map(async (monthKey) => {
        const monthData = byMonth[monthKey];

        const dailyIncrements = {};
        Object.entries(monthData.daily).forEach(([day, count]) => {
            dailyIncrements[day] = FieldValue.increment(count);
        });

        const hourlyIncrements = {};
        Object.entries(monthData.hourly).forEach(([hour, count]) => {
            hourlyIncrements[hour] = FieldValue.increment(count);
        });

        await db.collection("publicationViewsRollup").doc(monthKey).set(
            {
                daily: dailyIncrements,
                hourly: hourlyIncrements,
                totalViews: FieldValue.increment(monthData.total),
                ...(publicationId ? {
                    byPublication: {
                        [publicationId]: {
                            count: FieldValue.increment(monthData.total),
                            label,
                        },
                    },
                } : {}),
            },
            { merge: true },
        );

        await db.collection("stats").doc("publicationViewsMonths").set(
            { months: FieldValue.arrayUnion(monthKey) },
            { merge: true },
        );
    }));

    return byMonth;
};

exports.onPublicationViewWritten = onDocumentWritten(
    "logPublicationsViews/{logId}",
    (event) => handlePublicationViewWritten(event),
);
exports.handlePublicationViewWritten = handlePublicationViewWritten;
