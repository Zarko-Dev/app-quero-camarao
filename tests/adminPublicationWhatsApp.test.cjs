const assert = require("node:assert/strict");
const test = require("node:test");

const {
    buildAdminPublicationWhatsAppUrl,
    buildWhatsAppAppUrl,
} = require("../src/utils/adminPublicationWhatsApp");

test("buildAdminPublicationWhatsAppUrl handles Pix phone object", () => {
    assert.equal(
        buildAdminPublicationWhatsAppUrl({
            user: {
                phone: {
                    ddd: "85",
                    number: "992265252",
                },
            },
        }),
        "https://wa.me/5585992265252",
    );
});

test("buildAdminPublicationWhatsAppUrl falls back to publication contact number", () => {
    assert.equal(
        buildAdminPublicationWhatsAppUrl({
            user: {},
            dataPublication: {
                contactNumber: "+55 (88) 98223-9875",
            },
        }),
        "https://wa.me/5588982239875",
    );
});

test("buildAdminPublicationWhatsAppUrl accepts the encarte contact number", () => {
    assert.equal(
        buildAdminPublicationWhatsAppUrl({
            contactNumber: "+55 (88) 98223-9875",
        }),
        "https://wa.me/5588982239875",
    );
});

test("buildWhatsAppAppUrl encodes the message for the admin button", () => {
    assert.equal(
        buildWhatsAppAppUrl(
            "+55 (85) 99226-5252",
            "Olá, vi seu encarte no Quero Camarão.",
        ),
        "whatsapp://send?phone=5585992265252&text=Ol%C3%A1%2C%20vi%20seu%20encarte%20no%20Quero%20Camar%C3%A3o.",
    );
});

test("buildAdminPublicationWhatsAppUrl does not duplicate country code", () => {
    assert.equal(
        buildAdminPublicationWhatsAppUrl({
            user: {
                phone: "+55 (85) 99226-5252",
            },
        }),
        "https://wa.me/5585992265252",
    );
});

test("buildAdminPublicationWhatsAppUrl returns null without usable phone", () => {
    assert.equal(buildAdminPublicationWhatsAppUrl({ user: {} }), null);
});
