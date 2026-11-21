import test from "node:test";
import assert from "node:assert/strict";
import { buildChatText, buildPublicationText, isOptOut } from "./messages.ts";
import { toWhatsappId } from "./phone.ts";

test("publicação: kg, gramatura, local, link e SAIR", () => {
    const t = buildPublicationText({
        publicationId: "abc",
        location: "Aracati",
        shrimps: [{ grammage: 22, kilo: 1000 }, { grammage: 18, kilo: 400 }],
    });
    assert.match(t, /1400 kg de camarão de 22\/18g em Aracati/);
    assert.match(t, /https:\/\/querocamarao\.com\.br\/publicacao\/abc/);
    assert.match(t, /SAIR/);
});

test("publicação sem dados mínimos não quebra", () => {
    assert.match(buildPublicationText({ publicationId: "x" }), /^🦐 \*Novo camarão publicado!\*\nCamarão\n/);
});

test("chat não vaza conteúdo", () => {
    const t = buildChatText("Maria");
    assert.match(t, /\*Maria\*/);
    assert.match(buildChatText(), /\*Alguém\*/);
});

test("SAIR", () => {
    assert.equal(isOptOut(" sair "), true);
    assert.equal(isOptOut("sair daqui"), false);
});

test("telefone BR: remove o 9 extra", () => {
    assert.equal(toWhatsappId("(85) 98653-476"), "558598653476@c.us");
    assert.equal(toWhatsappId("85 9 8653-4766"), "558586534766@c.us");
    assert.equal(toWhatsappId("+55 85 98653-4766"), "558586534766@c.us");
    assert.equal(toWhatsappId("558586534766"), "558586534766@c.us");
    assert.equal(toWhatsappId("8586534766"), "558586534766@c.us");
    assert.equal(toWhatsappId("123"), null);
});
