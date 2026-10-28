const admin = require("../functions/node_modules/firebase-admin");
const serviceAccount = require("../api-quero-camarao-c4ef8022ba49.json");
const { computeUsersSummary } = require("../functions/src/usersAggregate");

const APPLY = process.argv.includes("--apply");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function main() {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => doc.data());
    const summary = computeUsersSummary(users);

    if (!APPLY) {
        console.log(
            JSON.stringify(
                {
                    dryRun: true,
                    totalUsers: users.length,
                    summaryPreview: {
                        total: summary.total,
                        byUserType: summary.byUserType,
                        stateCount: summary.byState.length,
                    },
                    usage: "node scripts/backfill-users-summary.cjs --apply",
                },
                null,
                2,
            ),
        );
        return;
    }

    await db.collection("stats").doc("usersSummary").set(summary);

    console.log(
        JSON.stringify(
            { dryRun: false, totalUsers: users.length, written: "stats/usersSummary" },
            null,
            2,
        ),
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
