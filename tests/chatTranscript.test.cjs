const test = require("node:test");
const assert = require("node:assert/strict");

const { buildChatTranscript } = require("../src/utils/chatTranscript");

const ts = (iso) => ({ toDate: () => new Date(iso) });
const names = { me: "Pedro", other: "Produtor" };
const base = { myId: "me", myName: "Pedro", otherName: "Produtor" };

test("uma linha por mensagem com data, nome e texto", () => {
    const out = buildChatTranscript(
        [
            { id: "1", senderId: "other", text: "Oi", createdAt: ts("2026-10-28T13:05:00-03:00") },
            { id: "2", senderId: "me", text: "Bom dia", createdAt: ts("2026-10-28T13:06:00-03:00") },
        ],
        base,
    );
    assert.equal(out, "[28/10/2026 13:05] Produtor: Oi\n[28/10/2026 13:06] Pedro: Bom dia");
});

test("ignora apagadas para todos e apagadas para mim", () => {
    const out = buildChatTranscript(
        [
            { id: "1", senderId: "me", text: "a", deletedForEveryone: true },
            { id: "2", senderId: "me", text: "b", deletedFor: { me: true } },
            { id: "3", senderId: "me", text: "c" },
        ],
        base,
    );
    assert.equal(out, "[--/--/---- --:--] Pedro: c");
});

test("midia vira rotulo e nunca expoe URL", () => {
    const out = buildChatTranscript(
        [
            { id: "1", senderId: "me", imageUrl: "https://storage/x.png" },
            { id: "2", senderId: "me", audioUrl: "https://storage/a.m4a" },
            { id: "3", senderId: "me", fileUrl: "https://storage/f.pdf" },
        ],
        base,
    );
    assert.match(out, /📷 Foto/);
    assert.match(out, /🎵 Áudio/);
    assert.match(out, /📎 Documento/);
    assert.doesNotMatch(out, /storage/);
});

test("localizacao vira rotulo com link do Google Maps", () => {
    const out = buildChatTranscript(
        [{ id: "1", senderId: "other", location: { lat: -3.7, lng: -38.5 } }],
        base,
    );
    assert.match(out, /📍 Localização: https:\/\/maps\.google\.com\/maps\?q=-3\.7,-38\.5/);
});

test("sem mensagens retorna string vazia", () => {
    assert.equal(buildChatTranscript([], base), "");
    assert.equal(buildChatTranscript(undefined, base), "");
});
