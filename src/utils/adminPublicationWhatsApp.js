const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

const normalizePhoneDigits = (phone) => {
    if (!phone) return "";

    if (typeof phone === "object") {
        return `${digitsOnly(phone.ddd)}${digitsOnly(phone.number)}`;
    }

    return digitsOnly(phone);
};

const normalizeBrazilianWhatsAppPhone = (...phones) => {
    const phone = phones
        .map(normalizePhoneDigits)
        .find((value) => value.length >= 10);

    if (!phone) return null;

    const withCountryCode = phone.startsWith("55") ? phone : `55${phone}`;
    return withCountryCode.length >= 12 ? withCountryCode : null;
};

const buildAdminPublicationWhatsAppUrl = (order) => {
    const phone = normalizeBrazilianWhatsAppPhone(
        order?.user?.phone,
        order?.dataPublication?.contactNumber,
        order?.contactNumber,
    );

    return phone ? `https://wa.me/${phone}` : null;
};

const buildWhatsAppAppUrl = (phone, message = "") => {
    const normalizedPhone = normalizeBrazilianWhatsAppPhone(phone);

    if (!normalizedPhone) return null;

    const encodedMessage = encodeURIComponent(message);
    return `whatsapp://send?phone=${normalizedPhone}&text=${encodedMessage}`;
};

module.exports = {
    buildAdminPublicationWhatsAppUrl,
    buildWhatsAppAppUrl,
    normalizeBrazilianWhatsAppPhone,
};
