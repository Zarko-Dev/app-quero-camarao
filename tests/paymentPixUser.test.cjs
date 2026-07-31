const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildPixPaymentUser,
} = require("../src/utils/paymentPixUser");

test("buildPixPaymentUser keeps address when it is complete", () => {
    const dataUser = {
        name: "Claudio Gabriel",
        cpf: "064.277.303-39",
        phone: "(85) 99612-9611",
        email: "claudiogna@outlook.com",
    };

    const paymentAddress = {
        zip_code: "60864380",
        street_name: "Rua Humberto Teixeira",
        street_number: 231,
    };

    assert.deepEqual(buildPixPaymentUser(dataUser, paymentAddress), {
        name: "Claudio",
        surname: "Gabriel",
        cpf: "06427730339",
        phone: {
            ddd: "85",
            number: "996129611",
        },
        email: "claudiogna@outlook.com",
        address: paymentAddress,
    });
});

test("buildPixPaymentUser omits address when it is missing", () => {
    const dataUser = {
        name: "Francisco André",
        cpf: "059.669.583-78",
        phone: "(88) 99266-9028",
        email: "1993andresilva2024@gmail.com",
    };

    const result = buildPixPaymentUser(dataUser, null);

    assert.deepEqual(result, {
        name: "Francisco",
        surname: "André",
        cpf: "05966958378",
        phone: {
            ddd: "88",
            number: "992669028",
        },
        email: "1993andresilva2024@gmail.com",
    });
    assert.equal(Object.prototype.hasOwnProperty.call(result, "address"), false);
});
