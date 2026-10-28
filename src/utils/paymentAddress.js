const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

const DEFAULT_PAYMENT_ADDRESS = {
    zip_code: "60000000",
    street_name: "Antero Quental",
    street_number: 10,
};

const normalizeStreetNumber = (value) => {
    const digits = String(value ?? "").replace(/[^0-9]/g, "");

    if (!digits) {
        return 0;
    }

    return Number(digits);
};

const buildPaymentAddress = (dataUser, { fallbackToDefault = true } = {}) => {
    const nestedAddress = dataUser?.address ?? {};
    const zipSource = nestedAddress.cep ?? nestedAddress.zipCode ?? dataUser?.zipCode;
    const streetSource = nestedAddress.street ?? dataUser?.street;
    const numberSource = nestedAddress.number ?? dataUser?.number;

    const zipCode = digitsOnly(zipSource);
    const streetName = String(streetSource ?? "").trim();
    const streetNumber = normalizeStreetNumber(numberSource);
    const hasZipCode = Boolean(zipCode);
    const hasStreetName = Boolean(streetName);
    const hasStreetNumber =
        numberSource !== undefined
        && numberSource !== null
        && String(numberSource).trim() !== "";

    if (!hasZipCode && !hasStreetName && !hasStreetNumber) {
        return fallbackToDefault ? DEFAULT_PAYMENT_ADDRESS : null;
    }

    const paymentAddress = {};

    if (hasZipCode) {
        paymentAddress.zip_code = zipCode;
    }

    if (hasStreetName) {
        paymentAddress.street_name = streetName;
    }

    paymentAddress.street_number = hasStreetNumber ? streetNumber : 0;

    return paymentAddress;
};

module.exports = {
    buildPaymentAddress,
};
