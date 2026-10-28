const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

const discordAlerts = createDiscordFunctionAlertReporter();

function findUserMismatches(authUsers = [], profileDocs = []) {
    const authByEmail = new Map(
        authUsers
            .filter((user) => user.email)
            .map((user) => [user.email.toLowerCase(), user]),
    );
    const profilesByEmail = new Map(
        profileDocs
            .filter((profile) => profile.email)
            .map((profile) => [profile.email.toLowerCase(), profile]),
    );

    const authWithoutProfile = [...authByEmail.entries()]
        .filter(([email]) => !profilesByEmail.has(email))
        .map(([email, user]) => ({ email, uid: user.uid }));
    const profileWithoutAuth = [...profilesByEmail.entries()]
        .filter(([email]) => !authByEmail.has(email))
        .map(([email, profile]) => ({ email, authUid: profile.authUid || null }));
    const uidMismatch = [...authByEmail.entries()]
        .filter(([email, user]) => profilesByEmail.get(email)?.authUid && profilesByEmail.get(email).authUid !== user.uid)
        .map(([email, user]) => ({ email, authUid: user.uid, profileAuthUid: profilesByEmail.get(email).authUid }));

    return { authWithoutProfile, profileWithoutAuth, uidMismatch };
}

async function listAllAuthUsers(authApi = admin.auth()) {
    const users = [];
    let pageToken;
    do {
        const page = await authApi.listUsers(1000, pageToken);
        users.push(...page.users);
        pageToken = page.pageToken;
    } while (pageToken);
    return users;
}

async function runUserReconciliation({ authApi = admin.auth(), db = admin.firestore(), reportError = null } = {}) {
    const authUsers = await listAllAuthUsers(authApi);
    const snapshot = await db.collection("users").get();
    const profileDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data()?.email || doc.id,
        ...doc.data(),
    }));
    const mismatches = findUserMismatches(authUsers, profileDocs);
    const total = Object.values(mismatches).reduce((sum, entries) => sum + entries.length, 0);

    if (total > 0) {
        const report = reportError || ((error, extra) => discordAlerts.reportDiscordFunctionError({
            functionName: "reconcileUsers",
            functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
            error,
            extra,
        }));
        await report(new Error("User Auth/Firestore inconsistency detected"), {
            total,
            ...mismatches,
            action: "reported-only-no-automatic-delete",
        });
    }

    return { ...mismatches, total };
}

exports.reconcileUsers = onSchedule("every 24 hours", () => runUserReconciliation());
exports.findUserMismatches = findUserMismatches;
exports.listAllAuthUsers = listAllAuthUsers;
exports.runUserReconciliation = runUserReconciliation;
