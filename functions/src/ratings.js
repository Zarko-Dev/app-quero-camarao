const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { computeAggregate } = require("./ratingsAggregate");

exports.onRatingWritten = onDocumentWritten("ratings/{ratingId}", async (event) => {
    const after = event.data?.after?.data();
    const before = event.data?.before?.data();
    const ratedId = after?.ratedId ?? before?.ratedId;
    if (!ratedId) return;

    const db = admin.firestore();
    const snap = await db.collection("ratings").where("ratedId", "==", ratedId).get();
    const { average, count } = computeAggregate(snap.docs.map((d) => d.data()));

    await db.collection("users").doc(ratedId).set(
        { ratingAverage: average, ratingCount: count },
        { merge: true },
    );
});
