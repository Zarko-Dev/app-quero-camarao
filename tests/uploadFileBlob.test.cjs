// Testes do upload real de ARQUIVO do chat: exercita performStorageUpload
// (storage().ref().putFile(localUri, {contentType}).getDownloadURL()).
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const { performStorageUpload } = require("../src/controllers/Chat/uploadStorage");

const makeFakeStorage = ({ url = "https://example.com/file.pdf" } = {}) => {
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

describe("performStorageUpload (arquivo)", () => {
    test("chama storage().ref com path de arquivo do chat", async () => {
        const fake = makeFakeStorage();
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "pub_abc",
            kind: "files",
            filename: "1700000000000_nota.pdf",
            localUri: "file:///tmp/nota.pdf",
            contentType: "application/pdf",
        });

        assert.equal(result.error, false);
        assert.ok(
            fake.calls.some(
                ([op, p]) => op === "ref" && p === "chats/pub_abc/files/1700000000000_nota.pdf",
            ),
        );
    });

    test("envia contentType do mimeType fornecido via putFile", async () => {
        const fake = makeFakeStorage();
        await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "files",
            filename: "doc.txt",
            localUri: "file:///doc.txt",
            contentType: "text/plain",
        });
        assert.deepEqual(
            fake.calls.filter(([op]) => op === "putFile")[0],
            ["putFile", "file:///doc.txt", { contentType: "text/plain" }],
        );
    });

    test("retorna o url vindo de getDownloadURL", async () => {
        const fake = makeFakeStorage({ url: "https://cdn/file.pdf" });
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "files",
            filename: "doc.pdf",
            localUri: "file:///doc.pdf",
            contentType: "application/pdf",
        });
        assert.equal(result.url, "https://cdn/file.pdf");
    });
});