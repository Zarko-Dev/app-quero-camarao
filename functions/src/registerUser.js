const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { createDiscordFunctionAlertReporter } = require("./discordAlerts");

const discordAlerts = createDiscordFunctionAlertReporter();

const REQUIRED_FIELDS = [
    "name",
    "phone",
    "dateBirth",
    "cpf",
    "state",
    "city",
    "neighborhood",
    "street",
    "number",
    "zipCode",
];

function validateRegistrationPayload(data = {}) {
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const password = typeof data.password === "string" ? data.password : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpsError("invalid-argument", "E-mail inválido.");
    }
    if (!data.userType || !["client", "productor"].includes(data.userType)) {
        throw new HttpsError("invalid-argument", "Tipo de usuário inválido.");
    }
    if (password && password.length < 6) {
        throw new HttpsError("invalid-argument", "Senha deve ter pelo menos 6 caracteres.");
    }
    for (const field of REQUIRED_FIELDS) {
        if (typeof data[field] !== "string" || !data[field].trim()) {
            throw new HttpsError("invalid-argument", `Campo obrigatório ausente: ${field}.`);
        }
    }
    if (data.checked !== true) {
        throw new HttpsError("invalid-argument", "Os termos de uso precisam ser aceitos.");
    }

    const profile = { ...data, email, password: undefined };
    delete profile.password;
    profile.rules = ["Normal"];
    return { ok: true, email, password, profile };
}

function isNotFound(error) {
    return error?.code === "auth/user-not-found";
}

function isAlreadyExists(error) {
    return error instanceof HttpsError && error.code === "already-exists";
}

async function reportRegistrationFailure(error, extra = {}, user = {}) {
    console.error("[registerUser]", extra.stage, error?.code, error?.message);
    await discordAlerts.reportDiscordFunctionError({
        functionsEnv: process.env.FUNCTIONS_EMULATOR ? "emulator" : "production",
        functionName: "registerUser",
        userId: user.uid || "unknown",
        email: user.email || extra.email || "unknown",
        phone: user.phone || "unknown",
        eventId: extra.registrationId || extra.email || "unknown",
        error,
        extra: { ...extra, password: undefined },
    });
}

async function handleRegisterUser(request, deps = {}) {
    const db = deps.db || admin.firestore();
    const authApi = deps.authApi || {
        createUser: (data) => admin.auth().createUser(data),
        getUser: (uid) => admin.auth().getUser(uid),
        getUserByEmail: (email) => admin.auth().getUserByEmail(email),
        deleteUser: (uid) => admin.auth().deleteUser(uid),
    };
    const createCustomToken = deps.createCustomToken || ((uid) => admin.auth().createCustomToken(uid));
    const reportError = deps.reportError || reportRegistrationFailure;
    let payload;

    try {
        payload = validateRegistrationPayload(request.data || {});
        const data = request.data || {};
        const profileRef = db.collection("users").doc(payload.email);
        let authUser;
        let createdAuth = false;

        // Sessão antiga de outra conta (ex: logout que não chamou signOut) vai
        // no token da callable: só vale como "recuperação" se o e-mail bater;
        // senão é ignorada e cai no fluxo de conta nova.
        if (request.auth?.uid) {
            const sessionUser = await authApi.getUser(request.auth.uid).catch(() => null);
            if (sessionUser?.email?.toLowerCase() === payload.email) authUser = sessionUser;
        }

        if (!authUser) {
            try {
                await authApi.getUserByEmail(payload.email);
                throw new HttpsError("already-exists", "Este e-mail já possui uma conta.");
            } catch (error) {
                if (isAlreadyExists(error)) throw error;
                if (!isNotFound(error)) throw error;
            }

            authUser = await authApi.createUser({
                email: payload.email,
                password: payload.password,
                displayName: data.name,
            });
            createdAuth = true;
        }

        const profile = {
            ...payload.profile,
            authUid: authUser.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            await db.runTransaction(async (transaction) => {
                const snapshot = await transaction.get(profileRef);
                if (snapshot.exists) {
                    throw new HttpsError("already-exists", "Este e-mail já possui um perfil.");
                }
                transaction.create(profileRef, profile);
            });
        } catch (error) {
            if (isAlreadyExists(error)) {
                if (createdAuth) {
                    try {
                        await authApi.deleteUser(authUser.uid);
                    } catch (rollbackError) {
                        await reportError(rollbackError, {
                            stage: "auth-rollback-existing-profile",
                            rollback: "failed",
                            originalError: error.message,
                            email: payload.email,
                            registrationId: data.registrationId,
                        }, authUser);
                    }
                }
                throw error;
            }

            let rollback = "not-needed";
            if (createdAuth) {
                try {
                    await authApi.deleteUser(authUser.uid);
                    rollback = "succeeded";
                } catch (rollbackError) {
                    rollback = "failed";
                    await reportError(rollbackError, {
                        stage: "auth-rollback",
                        rollback,
                        originalError: error.message,
                        originalErrorCode: error.code || "unknown",
                        email: payload.email,
                        registrationId: data.registrationId,
                    }, authUser);
                }
            }

            await reportError(error, {
                stage: "firestore-profile",
                rollback,
                email: payload.email,
                registrationId: data.registrationId,
            }, authUser);
            throw new HttpsError("internal", "Não foi possível concluir o cadastro.");
        }

        // createCustomToken precisa de iam.serviceAccounts.signBlob; se faltar,
        // o cadastro já está completo - o client entra com e-mail/senha.
        let customToken = null;
        if (createdAuth) {
            try {
                customToken = await createCustomToken(authUser.uid);
            } catch (tokenError) {
                await reportError(tokenError, {
                    stage: "custom-token",
                    email: payload.email,
                    registrationId: data.registrationId,
                }, authUser);
            }
        }
        return { ok: true, customToken };
    } catch (error) {
        if (error instanceof HttpsError) throw error;
        await reportError(error, {
            stage: "auth-create-or-validation",
            email: payload?.email || request.data?.email,
            registrationId: request.data?.registrationId,
        });
        throw new HttpsError("internal", "Não foi possível concluir o cadastro.");
    }
}

exports.registerUser = onCall({ region: "us-central1", cors: true }, handleRegisterUser);
exports.handleRegisterUser = handleRegisterUser;
exports.validateRegistrationPayload = validateRegistrationPayload;
