const digitsOnly = (value = "") => String(value ?? "").replace(/\D/g, "");

const formatCpf = (value = "") => {
    const cleaned = digitsOnly(value);

    if (cleaned.length !== 11) {
        return null;
    }

    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

const formatPhone11 = (value = "") => {
    const cleaned = digitsOnly(value);

    if (cleaned.length !== 11) {
        return null;
    }

    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

const formatPhone10 = (value = "") => {
    const cleaned = digitsOnly(value);

    if (cleaned.length !== 10) {
        return null;
    }

    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
};

const normalizeDateBirth = (value) => {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    if (value instanceof Date) {
        const day = String(value.getDate()).padStart(2, "0");
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const year = String(value.getFullYear()).padStart(4, "0");

        return `${day}/${month}/${year}`;
    }

    if (typeof value?.toDate === "function") {
        return normalizeDateBirth(value.toDate());
    }

    return String(value).trim();
};

const matchesResetPasswordIdentity = (userData, identifier, dateBirth) => {
    const cleanedIdentifier = digitsOnly(identifier);

    if (cleanedIdentifier.length < 8) {
        return false;
    }

    const storedCpf = digitsOnly(userData?.cpf);
    const storedPhone = digitsOnly(userData?.phone);
    const identifierMatches = cleanedIdentifier === storedCpf || cleanedIdentifier === storedPhone;

    if (!identifierMatches) {
        return false;
    }

    return normalizeDateBirth(userData?.dateBirth) === normalizeDateBirth(dateBirth);
};

const resolveResetPasswordIdentity = (userRecords = [], identifier, dateBirth) => {
    const cleanedIdentifier = digitsOnly(identifier);

    if (cleanedIdentifier.length < 8) {
        return { status: "invalid-identifier", record: null };
    }

    const matchingRecords = userRecords.filter((record) => {
        const userData = record?.userData ?? record ?? {};
        const storedCpf = digitsOnly(userData?.cpf);
        const storedPhone = digitsOnly(userData?.phone);

        return cleanedIdentifier === storedCpf || cleanedIdentifier === storedPhone;
    });

    if (matchingRecords.length === 0) {
        return { status: "not-found", record: null };
    }

    if (matchingRecords.length > 1) {
        return { status: "ambiguous", record: null };
    }

    const matchedRecord = matchingRecords[0];
    const userData = matchedRecord?.userData ?? matchedRecord ?? {};

    if (normalizeDateBirth(userData?.dateBirth) !== normalizeDateBirth(dateBirth)) {
        return { status: "date-mismatch", record: null };
    }

    return { status: "matched", record: matchedRecord };
};

module.exports = {
    digitsOnly,
    formatCpf,
    formatPhone11,
    formatPhone10,
    normalizeDateBirth,
    matchesResetPasswordIdentity,
    resolveResetPasswordIdentity,
};
