const {
    handleAdminDeleteUser,
    storagePathFromUrl,
    collectStoragePaths,
} = require("./adminDeleteUser");

const URL = (path) => `https://firebasestorage.googleapis.com/v0/b/api-quero-camarao.appspot.com/o/${encodeURIComponent(path)}?alt=media&token=x`;

// Fake Firestore em memória: coleções { id: data }, com where == e doc/get/delete/recursiveDelete.
function makeDb(seed) {
    const store = JSON.parse(JSON.stringify(seed));
    const snapOf = (col, id) => ({
        id,
        ref: { path: `${col}/${id}`, id, col },
        data: () => store[col][id],
        exists: store[col][id] !== undefined,
    });
    const colRef = (col) => ({
        doc: (id) => ({
            id,
            get: async () => snapOf(col, id),
            delete: async () => { delete store[col][id]; },
        }),
        where: (field, op, value) => ({
            get: async () => {
                const docs = Object.keys(store[col] || {})
                    .filter((id) => store[col][id][field] === value)
                    .map((id) => snapOf(col, id));
                return { docs, forEach: (fn) => docs.forEach(fn) };
            },
        }),
    });
    return {
        store,
        collection: colRef,
        recursiveDelete: async (ref) => { delete store[ref.col][ref.id]; },
    };
}

const makeAuth = (uid) => {
    const deleted = [];
    return {
        deleted,
        getUserByEmail: async (email) => {
            if (!uid) {
                const error = new Error("nf");
                error.code = "auth/user-not-found";
                throw error;
            }
            return { uid, email };
        },
        deleteUser: async (id) => deleted.push(id),
    };
};

const makeBucket = () => {
    const deleted = [];
    return {
        deleted,
        file: (path) => ({ delete: async () => deleted.push(path) }),
    };
};

const req = (email, data) => ({ auth: email ? { token: { email } } : undefined, data });

const seed = () => ({
    users: {
        "boss@x.com": { rules: ["Admin"], userImage: "" },
        "dup@x.com": { rules: ["Normal"], userImage: URL("user/foto.jpg") },
    },
    shrimpPonds: {
        p1: { userId: "dup@x.com", shrimps: [{ imageShrimpUri: URL("Shrimp/a.jpg") }] },
        p2: { userId: "outro@x.com" },
    },
    logPublicationsViews: { p1: { views: [] }, p2: { views: [] } },
    shirimpSale: { s1: { publicationId: "p1" }, s2: { publicationId: "p2" } },
    publishAds: { ad1: { userId: "dup@x.com", image: URL("ads/ad.jpg") } },
    orders: { o1: { userId: "dup@x.com" }, o2: { userId: "outro@x.com" } },
    wallets: { "dup@x.com": { saldo: 1 } },
    invitations: { "dup@x.com": { guest: 1 } },
    chats: { c1: { buyerId: "dup@x.com", sellerId: "outro@x.com" }, c2: { buyerId: "a@a.com", sellerId: "outro@x.com" } },
    ratings: { r1: { raterId: "dup@x.com", ratedId: "outro@x.com" }, r2: { raterId: "a@a.com", ratedId: "outro@x.com" } },
});

describe("storagePathFromUrl / collectStoragePaths", () => {
    test("extrai o caminho decodificado da URL de download", () => {
        expect(storagePathFromUrl(URL("Shrimp/a b.jpg"))).toBe("Shrimp/a b.jpg");
    });

    test("ignora strings sem URL de Storage", () => {
        expect(collectStoragePaths({ a: "oi", b: ["x"] }).size).toBe(0);
    });
});

describe("handleAdminDeleteUser", () => {
    test("rejeita sem login", async () => {
        await expect(handleAdminDeleteUser(req(null, { email: "dup@x.com" }), {
            db: makeDb(seed()), authApi: makeAuth("u1"), bucket: makeBucket(),
        }))
            .rejects.toMatchObject({ code: "unauthenticated" });
    });

    test("rejeita quem não é admin", async () => {
        await expect(handleAdminDeleteUser(req("dup@x.com", { email: "outro@x.com" }), {
            db: makeDb(seed()), authApi: makeAuth("u1"), bucket: makeBucket(),
        })).rejects.toMatchObject({ code: "permission-denied" });
    });

    test("não deixa admin apagar a si mesmo", async () => {
        await expect(handleAdminDeleteUser(req("boss@x.com", { email: "boss@x.com" }), {
            db: makeDb(seed()), authApi: makeAuth("u2"), bucket: makeBucket(),
        })).rejects.toMatchObject({ code: "failed-precondition" });
    });

    test("apaga tudo ligado à conta e não deixa órfãos", async () => {
        const db = makeDb(seed());
        const authApi = makeAuth("u1");
        const bucket = makeBucket();

        const res = await handleAdminDeleteUser(req("boss@x.com", { email: "DUP@x.com" }), {
            db, authApi, bucket,
        });

        expect(res.authDeleted).toBe(true);
        expect(authApi.deleted).toEqual(["u1"]);
        expect(res.counts).toMatchObject({ publications: 1, ads: 1, orders: 1, chats: 1, ratings: 1 });

        // só sobra o que é de outras pessoas
        expect(Object.keys(db.store.shrimpPonds)).toEqual(["p2"]);
        expect(Object.keys(db.store.logPublicationsViews)).toEqual(["p2"]);
        expect(Object.keys(db.store.shirimpSale)).toEqual(["s2"]);
        expect(Object.keys(db.store.publishAds)).toEqual([]);
        expect(Object.keys(db.store.orders)).toEqual(["o2"]);
        expect(db.store.wallets["dup@x.com"]).toBeUndefined();
        expect(db.store.invitations["dup@x.com"]).toBeUndefined();
        expect(db.store.users["dup@x.com"]).toBeUndefined();
        expect(Object.keys(db.store.chats)).toEqual(["c2"]);
        expect(Object.keys(db.store.ratings)).toEqual(["r2"]);

        // imagens: perfil, publicação e anúncio
        expect(bucket.deleted.sort()).toEqual(["Shrimp/a.jpg", "ads/ad.jpg", "user/foto.jpg"].sort());
    });

    test("conta de login já inexistente não quebra e limpa os dados", async () => {
        const db = makeDb(seed());
        const res = await handleAdminDeleteUser(req("boss@x.com", { email: "dup@x.com" }), {
            db, authApi: makeAuth(null), bucket: makeBucket(),
        });
        expect(res.authDeleted).toBe(false);
        expect(db.store.users["dup@x.com"]).toBeUndefined();
    });
});
