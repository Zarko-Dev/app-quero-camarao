// Testes do upload real de ÁUDIO do chat: exercita performStorageUpload
// (storage().ref().putFile(localUri, {contentType}).getDownloadURL()).
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const { performStorageUpload } = require("../src/controllers/Chat/uploadStorage");

const makeFakeStorage = ({ url = "https://example.com/audio.m4a" } = {}) => {
    const calls = [];
    const storageRef = {
        putFile: async (localUri, meta) => calls.push(["putFile", localUri, meta]),
        getDownloadURL: async () => {
            calls.push(["getDownloadURL"]);
            return url;
        },
    };
    return {
        calls,
        ref: (path) => {
            calls.push(["ref", path]);
            return storageRef;
        },
    };
};

describe("performStorageUpload (áudio)", () => {
    test("chama storage().ref com path de áudio do chat", async () => {
        const fake = makeFakeStorage();
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "pub_abc",
            kind: "audio",
            filename: "1700000000000.m4a",
            localUri: "file:///tmp/audio.m4a",
            contentType: "audio/m4a",
        });

        assert.equal(result.error, false);
        assert.ok(
            fake.calls.some(
                ([op, p]) => op === "ref" && p === "chats/pub_abc/audio/1700000000000.m4a",
            ),
        );
    });

    test("envia contentType audio/m4a via putFile", async () => {
        const fake = makeFakeStorage();
        await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "audio",
            filename: "a.m4a",
            localUri: "file:///a.m4a",
            contentType: "audio/m4a",
        });
        assert.deepEqual(
            fake.calls.filter(([op]) => op === "putFile")[0],
            ["putFile", "file:///a.m4a", { contentType: "audio/m4a" }],
        );
    });

    test("retorna o url vindo de getDownloadURL", async () => {
        const fake = makeFakeStorage({ url: "https://cdn/audio.m4a" });
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "audio",
            filename: "a.m4a",
            localUri: "file:///a.m4a",
            contentType: "audio/m4a",
        });
        assert.equal(result.url, "https://cdn/audio.m4a");
    });
});