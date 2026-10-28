const { handleRegisterUser, validateRegistrationPayload } = require("./registerUser");

const validPayload = {
    email: "new@example.com",
    password: "secret123",
    userType: "client",
    name: "New User",
    phone: "(88) 99999-9999",
    dateBirth: "23/02/1995",
    cpf: "056.981.163-50",
    state: "CE",
    city: "Alto Santo",
    neighborhood: "Centro",
    street: "Rua A",
    number: "213",
    zipCode: "62970-000",
    checked: true,
};

function createDb({ profile = null, onCreate = () => {} } = {}) {
    const profileRef = {
        get: async () => ({ exists: Boolean(profile), data: () => profile }),
    };
    return {
        collection: () => ({ doc: () => profileRef }),
        runTransaction: async (callback) => callback({
            get: async () => ({ exists: Boolean(profile), data: () => profile }),
            create: (_ref, data) => onCreate(data),
        }),
    };
}

test("validates the registration payload without accepting a password in the profile", () => {
    const result = validateRegistrationPayload(validPayload);

    expect(result.ok).toBe(true);
    expect(result.profile.password).toBeUndefined();
    expect(result.profile.email).toBe("new@example.com");
});

test("creates Auth and Firestore profile before returning a custom token", async () => {
    const calls = [];
    const result = await handleRegisterUser(
        { data: validPayload, auth: null },
        {
            db: createDb({ onCreate: (data) => calls.push({ type: "profile", data }) }),
            authApi: {
                getUserByEmail: async () => { throw { code: "auth/user-not-found" }; },
                createUser: async (data) => {
                    calls.push({ type: "auth", data });
                    return { uid: "uid-new", email: data.email };
                },
                deleteUser: async () => calls.push({ type: "delete" }),
            },
            createCustomToken: async (uid) => `token-${uid}`,
        },
    );

    expect(result).toEqual({ ok: true, customToken: "token-uid-new" });
    expect(calls[0].type).toBe("auth");
    expect(calls[1].type).toBe("profile");
    expect(calls[1].data.password).toBeUndefined();
});

test("deletes Auth when the profile transaction fails", async () => {
    const calls = [];
    const registration = handleRegisterUser(
        { data: validPayload, auth: null },
        {
            db: {
                runTransaction: async () => { throw new Error("permission-denied"); },
                collection: () => ({ doc: () => ({}) }),
            },
            authApi: {
                getUserByEmail: async () => { throw { code: "auth/user-not-found" }; },
                createUser: async () => ({ uid: "uid-new", email: validPayload.email }),
                deleteUser: async (uid) => calls.push(uid),
            },
            createCustomToken: async () => "unused",
            reportError: async (error, extra) => calls.push({ error, extra }),
        },
    );

    await expect(registration).rejects.toMatchObject({ code: "internal" });
    expect(calls[0]).toBe("uid-new");
    expect(calls[1].extra.password).toBeUndefined();
    expect(calls[1].extra.rollback).toBe("succeeded");
});

test("allows an authenticated orphan to complete its missing profile", async () => {
    const calls = [];
    const result = await handleRegisterUser(
        { data: { ...validPayload, password: undefined }, auth: { uid: "uid-orphan", token: { email: validPayload.email } } },
        {
            db: createDb({ onCreate: (data) => calls.push(data) }),
            authApi: {
                getUser: async () => ({ uid: "uid-orphan", email: validPayload.email }),
            },
        },
    );

    expect(result).toEqual({ ok: true, customToken: null });
    expect(calls[0].authUid).toBe("uid-orphan");
});

test("rolls back Auth when a concurrent request already created the profile", async () => {
    const deleted = [];
    const result = handleRegisterUser(
        { data: validPayload, auth: null },
        {
            db: createDb({ profile: { email: validPayload.email } }),
            authApi: {
                getUserByEmail: async () => { throw { code: "auth/user-not-found" }; },
                createUser: async () => ({ uid: "uid-race", email: validPayload.email }),
                deleteUser: async (uid) => deleted.push(uid),
            },
        },
    );

    await expect(result).rejects.toMatchObject({ code: "already-exists" });
    expect(deleted).toEqual(["uid-race"]);
});

test("ignores a stale session of another account and creates the new one", async () => {
    const created = [];
    const result = await handleRegisterUser(
        { data: validPayload, auth: { uid: "uid-old" } },
        {
            db: createDb({ onCreate: () => {} }),
            authApi: {
                getUser: async () => ({ uid: "uid-old", email: "outro@teste.com" }),
                getUserByEmail: async () => { throw { code: "auth/user-not-found" }; },
                createUser: async (data) => { created.push(data.email); return { uid: "uid-new", email: data.email }; },
                deleteUser: async () => {},
            },
            createCustomToken: async (uid) => `token-${uid}`,
        },
    );
    expect(created).toHaveLength(1);
    expect(result.customToken).toBe("token-uid-new");
});
