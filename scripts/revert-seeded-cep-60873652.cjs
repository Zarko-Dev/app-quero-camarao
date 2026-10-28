const admin = require("../functions/node_modules/firebase-admin");
const serviceAccount = require("../api-quero-camarao-c4ef8022ba49.json");

const TARGET_ZIP = "60873652";
const TARGET_UPDATED_DAY = "2026-06-23";
const APPLY = process.argv.includes("--apply");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : null;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const { FieldValue } = admin.firestore;

const digitsOnly = (value) =>
    typeof value === "string" ? value.replace(/\D/g, "") : null;

const firstNonEmpty = (...values) =>
    values.find((value) => typeof value === "string" && value.trim())?.trim()
    || null;

const timestampToDay = (value) => {
    if (!value) return null;
    if (typeof value.toDate === "function") {
        return value.toDate().toISOString().slice(0, 10);
    }
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }
    if (typeof value.seconds === "number") {
        return new Date(value.seconds * 1000).toISOString().slice(0, 10);
    }

    return null;
};

const buildPatchedAddress = (address) => {
    if (!address || typeof address !== "object") {
        return null;
    }

    const nextAddress = { ...address };
    delete nextAddress.cep;
    delete nextAddress.zipCode;

    if (Object.keys(nextAddress).length === 0) {
        return FieldValue.delete();
    }

    return nextAddress;
};

async function main() {
    const snapshot = await db.collection("users").get();
    const candidates = [];

    snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const address = data.address && typeof data.address === "object" ? data.address : {};
        const zipCode = digitsOnly(
            firstNonEmpty(address.cep, address.zipCode, data.zipCode),
        );
        const street = firstNonEmpty(address.street, data.street);
        const number = firstNonEmpty(address.number, data.number);
        const updatedDay = timestampToDay(data.updatedAt);

        if (zipCode !== TARGET_ZIP) return;
        if (updatedDay !== TARGET_UPDATED_DAY) return;
        if (street && number) return;

        candidates.push({
            id: docSnap.id,
            email: data.email || null,
            zipCode: data.zipCode || null,
            address,
            city: firstNonEmpty(address.city, data.city),
            state: firstNonEmpty(address.state, data.state),
            street,
            number,
            updatedDay,
        });
    });

    const selectedCandidates = LIMIT && Number.isFinite(LIMIT)
        ? candidates.slice(0, LIMIT)
        : candidates;

    if (!APPLY) {
        console.log(
            JSON.stringify(
                {
                    dryRun: true,
                    targetZip: TARGET_ZIP,
                    targetUpdatedDay: TARGET_UPDATED_DAY,
                    totalCandidates: candidates.length,
                    selectedCandidates: selectedCandidates.length,
                    sample: selectedCandidates.slice(0, 20),
                    usage:
                        "node scripts/revert-seeded-cep-60873652.cjs --apply [--limit=10]",
                },
                null,
                2,
            ),
        );
        return;
    }

    await Promise.all(
        selectedCandidates.map((candidate) => {
            const ref = db.collection("users").doc(candidate.id);
            const nextAddress = buildPatchedAddress(candidate.address);

            return ref.set(
                {
                    zipCode: FieldValue.delete(),
                    address: nextAddress,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true },
            );
        }),
    );

    console.log(
        JSON.stringify(
            {
                dryRun: false,
                targetZip: TARGET_ZIP,
                targetUpdatedDay: TARGET_UPDATED_DAY,
                updated: selectedCandidates.length,
            },
            null,
            2,
        ),
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
