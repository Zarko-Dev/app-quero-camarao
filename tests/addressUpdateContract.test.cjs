const assert = require("node:assert/strict");
const test = require("node:test");

const {
    buildUserAddressUpdate,
    getUserAddressValue,
    normalizeUserEmail,
} = require("../src/utils/userAddress");

test("normalizes the user document email before an update", () => {
    assert.equal(
        normalizeUserEmail("  Daniel@Example.COM "),
        "daniel@example.com",
    );
});

test("reads nested address values and falls back to legacy flat fields", () => {
    const user = {
        address: { state: "CE", city: "Morada Nova" },
        zipCode: "62952-990",
        neighborhood: "Centro",
        street: "Rua Ana Nogueira",
        number: "10",
    };

    assert.equal(getUserAddressValue(user, "state"), "CE");
    assert.equal(getUserAddressValue(user, "city"), "Morada Nova");
    assert.equal(getUserAddressValue(user, "cep"), "62952-990");
    assert.equal(getUserAddressValue(user, "street"), "Rua Ana Nogueira");
});

test("keeps the nested address and legacy fields in sync when saving", () => {
    const address = {
        cep: "62952-990",
        state: "CE",
        city: "Morada Nova",
        neighborhood: "Ch2",
        street: "Rua Ana Nogueira",
        number: "10",
        complement: "Casa",
    };

    assert.deepEqual(buildUserAddressUpdate(address), {
        address,
        zipCode: "62952-990",
        state: "CE",
        city: "Morada Nova",
        neighborhood: "Ch2",
        street: "Rua Ana Nogueira",
        number: "10",
        complement: "Casa",
    });
});
