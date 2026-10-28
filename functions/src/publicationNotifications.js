const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

const discordAlerts = createDiscordFunctionAlertReporter();

const EXPO_BATCH = 100;

const buildPublicationBody = (pub) => {
    const shrimps = Array.isArray(pub.shrimps) ? pub.shrimps : [];
    const totalKg = shrimps.reduce((sum, s) => sum + (Number(s.kilo) || 0), 0);
    const grammages = [...new Set(shrimps.map((s) => s.grammage).filter((g) => g != null && g !== ""))];
    const kg = totalKg > 0 ? `${totalKg} kg de camarão` : "Camarão";
    const grams = grammages.length ? ` de ${grammages.join("/")}g` : "";
    const where = pub.location ? ` em ${pub.location}` : "";
    return `${kg}${grams} foi publicado${where}`;
};

// Tokens únicos de todos os usuários, menos o publicador.
const collectTokens = async (db, publisherId) => {
    const snap = await db.collection("users").select("notification").get();
    const tokens = new Set();
    snap.docs.forEach((doc) => {
        if (doc.id === publisherId) return;
        const token = doc.data()?.notification?.token;
        if (typeof token === "string" && token.startsWith("ExponentPushToken")) tokens.add(token);
    });
    return [...tokens];
};

const sendExpoBatch = async (tokens, title, body, data) => {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokens.map((to) => ({
            to, title, body, data, sound: "default", channelId: "notifications-app",
        }))),
    });
    const result = await response.json();
    if (!response.ok) console.error("[publicationNotifications] Expo push rejected:", JSON.stringify(result));
    return result;
};

const handlePublicationCreated = async (event, db = admin.firestore()) => {
    const pub = event.data?.data();
    const { publicationId } = event.params;
    if (!pub) return null;

    const tokens = await collectTokens(db, pub.userId);
    const body = buildPublicationBody(pub);
    const data = { type: "publication", publicationId };

    for (let i = 0; i < tokens.length; i += EXPO_BATCH) {
        await sendExpoBatch(tokens.slice(i, i + EXPO_BATCH), "Nova publicação", body, data);
    }
    console.log(`[publicationNotifications] sent=${tokens.length} publicationId=${publicationId}`);
    return { sent: tokens.length };
};

exports.onPublicationCreated = onDocumentCreated(
    { document: "shrimpPonds/{publicationId}", timeoutSeconds: 300 },
    async (event) => {
        try {
            return await handlePublicationCreated(event);
        } catch (error) {
            void discordAlerts.reportDiscordFunctionError({
                functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
                functionName: "onPublicationCreated",
                userId: event.data?.data?.()?.userId || "unknown",
                eventId: event.id || event.params?.publicationId,
                documentPath: event.data?.ref?.path || `shrimpPonds/${event.params?.publicationId}`,
                error,
                extra: { publicationId: event.params?.publicationId },
            });
            throw error;
        }
    },
);

exports.buildPublicationBody = buildPublicationBody;
exports.collectTokens = collectTokens;
exports.handlePublicationCreated = handlePublicationCreated;
