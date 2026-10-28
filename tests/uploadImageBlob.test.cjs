// Testes do upload real de IMAGEM do chat: exercita performStorageUpload
// (storage().ref().putFile(localUri, {contentType}).getDownloadURL()).
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const { performStorageUpload } = require("../src/controllers/Chat/uploadStorage");

const makeFakeStorage = ({ url = "https://example.com/img.jpg" } = {}) => {
    const calls = [];
    const storageRef = {
        putFile: async (localUri, meta) => {
            calls.push(["putFile", localUri, meta]);
        },
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

describe("performStorageUpload (imagem)", () => {
    test("chama storage().ref com path de imagem do chat", async () => {
        const fake = makeFakeStorage();
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "pub_abc",
            kind: "images",
            filename: "1700000000000.jpg",
            localUri: "file:///tmp/foto.jpg",
            contentType: "image/jpeg",
        });

        assert.equal(result.error, false);
        assert.equal(result.url, "https://example.com/img.jpg");
        assert.ok(
            fake.calls.some(
                ([op, p]) => op === "ref" && p === "chats/pub_abc/images/1700000000000.jpg",
            ),
            `path deve ser chats/<chatId>/images/<filename>, foi ${JSON.stringify(fake.calls)}`,
        );
    });

    test("chama putFile(localUri, { contentType }) e getDownloadURL", async () => {
        const fake = makeFakeStorage();
        await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "images",
            filename: "f.jpg",
            localUri: "file:///img.jpg",
            contentType: "image/jpeg",
        });

        assert.deepEqual(
            fake.calls.filter(([op]) => op === "putFile")[0],
            ["putFile", "file:///img.jpg", { contentType: "image/jpeg" }],
        );
        assert.ok(fake.calls.some(([op]) => op === "getDownloadURL"));
    });

    test("retorna o url vindo de getDownloadURL", async () => {
        const fake = makeFakeStorage({ url: "https://cdn/abc.jpg" });
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "images",
            filename: "f.jpg",
            localUri: "file:///img.jpg",
            contentType: "image/jpeg",
        });
        assert.equal(result.url, "https://cdn/abc.jpg");
    });

    test("rejeita quando putFile lança (o controller devolve {error:true})", async () => {
        const storageRef = {
            putFile: async () => { throw new Error("upload failed"); },
            getDownloadURL: async () => "https://x",
        };
        await assert.rejects(
            performStorageUpload({
                storage: () => ({ ref: () => storageRef }),
                chatId: "c1",
                kind: "images",
                filename: "f.jpg",
                localUri: "file:///img.jpg",
                contentType: "image/jpeg",
            }),
            /upload failed/,
        );
    });
});