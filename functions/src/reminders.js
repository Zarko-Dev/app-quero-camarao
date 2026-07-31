const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

const sendToProducers = async (title, body) => {
    const db = admin.firestore();
    const snap = await db.collection("users").where("userType", "==", "productor").get();
    const tokens = snap.docs
        .map((d) => d.data()?.notification?.token)
        .filter(Boolean);
    await Promise.all(tokens.map((to) =>
        fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to, title, body, sound: "default", data: { type: "registerMyAds" },
            }),
        })));
};

exports.mondayProducerReminder = onSchedule(
    { schedule: "0 8 * * 1", timeZone: "America/Fortaleza" },
    () => sendToProducers(
        "Produtor, comece a semana aparecendo para os compradores!",
        "Publique seu camarão no Quero Camarão e aumente suas chances de negociação.",
    ),
);

exports.tuesdayProducerReminder = onSchedule(
    { schedule: "0 8 * * 2", timeZone: "America/Fortaleza" },
    () => sendToProducers(
        "Seu camarão já está publicado?",
        "Os compradores começam a se movimentar. Anuncie agora e fique visível durante a semana.",
    ),
);
