const test = require("node:test");
const assert = require("node:assert/strict");

const {
    matchesResetPasswordIdentity,
    normalizeDateBirth,
    resolveResetPasswordIdentity,
} = require("../functions/src/resetPasswordHelpers");

test("normalizeDateBirth trims strings and formats Date values", () => {
    assert.equal(normalizeDateBirth(" 01/02/2003 "), "01/02/2003");
    assert.equal(normalizeDateBirth(new Date(2003, 1, 1)), "01/02/2003");
});

test("matchesResetPasswordIdentity accepts cpf and birth date", () => {
    const userData = {
        cpf: "123.456.789-09",
        phone: "(85) 99999-1111",
        dateBirth: "01/02/2003",
    };

    assert.equal(
        matchesResetPasswordIdentity(userData, "12345678909", "01/02/2003"),
        true,
    );
});

test("matchesResetPasswordIdentity accepts phone and birth date", () => {
    const userData = {
        cpf: "123.456.789-09",
        phone: "(85) 99999-1111",
        dateBirth: "01/02/2003",
    };

    assert.equal(
        matchesResetPasswordIdentity(userData, "(85) 99999-1111", "01/02/2003"),
        true,
    );
});

test("matchesResetPasswordIdentity rejects mismatched birth date", () => {
    const userData = {
        cpf: "123.456.789-09",
        phone: "(85) 99999-1111",
        dateBirth: "01/02/2003",
    };

    assert.equal(
        matchesResetPasswordIdentity(userData, "12345678909", "02/02/2003"),
        false,
    );
});

test("resolveResetPasswordIdentity accepts a single matching record", () => {
    const userRecords = [
        {
            cpf: "123.456.789-09",
            phone: "(85) 99999-1111",
            dateBirth: "01/02/2003",
        },
    ];

    const result = resolveResetPasswordIdentity(
        userRecords,
        "12345678909",
        "01/02/2003",
    );

    assert.equal(result.status, "matched");
    assert.deepEqual(result.record, userRecords[0]);
});

test("resolveResetPasswordIdentity rejects duplicated identifier with different birth dates", () => {
    const userRecords = [
        {
            cpf: "123.456.789-09",
            phone: "(85) 99999-1111",
            dateBirth: "01/02/2003",
        },
        {
            cpf: "123.456.789-09",
            phone: "(85) 99999-2222",
            dateBirth: "02/02/2003",
        },
    ];

    const result = resolveResetPasswordIdentity(
        userRecords,
        "12345678909",
        "01/02/2003",
    );

    assert.equal(result.status, "ambiguous");
    assert.equal(result.record, null);
});
