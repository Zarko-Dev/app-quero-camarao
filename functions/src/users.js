const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { computeUsersSummary } = require("./usersAggregate");

const handleUserWritten = async (db = admin.firestore()) => {
    const snap = await db.collection("users").get();
    const users = snap.docs.map((doc) => doc.data());
    const summary = computeUsersSummary(users);
    await db.collection("stats").doc("usersSummary").set(summary);
    return summary;
};

exports.onUserWritten = onDocumentWritten("users/{userId}", () => handleUserWritten());
exports.handleUserWritten = handleUserWritten;
