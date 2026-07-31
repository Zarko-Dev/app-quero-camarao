const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildPaymentAddress,
} = require("../src/utils/paymentAddress");

test("buildPaymentAddress uses the saved address fields when nested address is incomplete", () => {
    const dataUser = {
        address: {
            state: "CE",
            city: "Fortaleza",
        },
        zipCode: "60000-000",
        street: "Rua das Flores",
        number: "123",
    };

    assert.deepEqual(buildPaymentAddress(dataUser), {
        zip_code: "60000000",
        street_name: "Rua das Flores",
        street_number: 123,
    });
});

test("buildPaymentAddress prefers nested address values when they exist", () => {
    const dataUser = {
        address: {
            cep: "60123-456",
            street: "Av Beira Mar",
            number: "456",
        },
        zipCode: "60000-000",
        street: "Rua antiga",
        number: "123",
    };

    assert.deepEqual(buildPaymentAddress(dataUser), {
        zip_code: "60123456",
        street_name: "Av Beira Mar",
        street_number: 456,
    });
});

test("buildPaymentAddress accepts nested zipCode as fallback", () => {
    const dataUser = {
        address: {
            zipCode: "62000-000",
            street: "Rua do Porto",
            number: "12",
        },
    };

    assert.deepEqual(buildPaymentAddress(dataUser), {
        zip_code: "62000000",
        street_name: "Rua do Porto",
        street_number: 12,
    });
});

test("buildPaymentAddress accepts address without street", () => {
    const dataUser = {
        address: {
            cep: "60000-000",
            number: "10",
        },
    };

    assert.deepEqual(buildPaymentAddress(dataUser), {
        zip_code: "60000000",
        street_number: 10,
    });
});

test("buildPaymentAddress accepts address without zip code", () => {
    const dataUser = {
        address: {
            street: "Rua sem CEP",
            number: "10",
        },
    };

    assert.deepEqual(buildPaymentAddress(dataUser), {
        street_name: "Rua sem CEP",
        street_number: 10,
    });
});

test("buildPaymentAddress blocks payment when address has no usable fields", () => {
    const dataUser = {
        address: {},
    };

    assert.deepEqual(buildPaymentAddress(dataUser), {
        zip_code: "60000000",
        street_name: "Antero Quental",
        street_number: 10,
    });
});

test("buildPaymentAddress falls back to zero when street number is missing", () => {
    const dataUser = {
        address: {
            cep: "60000-000",
            street: "Av Presidente Ernesto",
        },
    };

    assert.deepEqual(buildPaymentAddress(dataUser), {
        zip_code: "60000000",
        street_name: "Av Presidente Ernesto",
        street_number: 0,
    });
});
