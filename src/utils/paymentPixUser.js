const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

const splitName = (fullName) => {
    const parts = String(fullName ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    return {
        name: parts[0] ?? "",
        surname: parts.slice(1).join(" "),
    };
};

const buildPixPaymentUser = (dataUser, paymentAddress) => {
    const { name, surname } = splitName(dataUser?.name);
    const phoneDigits = digitsOnly(dataUser?.phone);

    const user = {
        name,
        surname,
        cpf: digitsOnly(dataUser?.cpf),
        phone: {
            ddd: phoneDigits.slice(0, 2),
            number: phoneDigits.slice(2),
        },
        email: dataUser?.email,
    };

    if (paymentAddress) {
        user.address = paymentAddress;
    }

    return user;
};

module.exports = {
    buildPixPaymentUser,
};
