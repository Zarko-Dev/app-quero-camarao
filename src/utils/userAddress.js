const ADDRESS_FIELDS = [
    "cep",
    "state",
    "city",
    "neighborhood",
    "street",
    "number",
    "complement",
];

const normalizeUserEmail = (email) => String(email ?? "").trim().toLowerCase();

const getUserAddressValue = (dataUser, field) => {
    const nestedAddress = dataUser?.address ?? {};

    if (nestedAddress[field] !== undefined && nestedAddress[field] !== null) {
        return nestedAddress[field];
    }

    if (field === "cep") {
        return dataUser?.zipCode ?? "";
    }

    return dataUser?.[field] ?? "";
};

const buildUserAddressUpdate = (address) => {
    const normalizedAddress = ADDRESS_FIELDS.reduce((result, field) => {
        result[field] = address?.[field] ?? "";
        return result;
    }, {});

    return {
        address: normalizedAddress,
        zipCode: normalizedAddress.cep,
        state: normalizedAddress.state,
        city: normalizedAddress.city,
        neighborhood: normalizedAddress.neighborhood,
        street: normalizedAddress.street,
        number: normalizedAddress.number,
        complement: normalizedAddress.complement,
    };
};

module.exports = {
    buildUserAddressUpdate,
    getUserAddressValue,
    normalizeUserEmail,
};
