// Testes do upload real de VÍDEO do chat: exercita performStorageUpload
// (storage().ref().putFile(localUri, {contentType}).getDownloadURL()).
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const { performStorageUpload } = require("../src/controllers/Chat/uploadStorage");

const makeFakeStorage = ({ url = "https://example.com/video.mp4" } = {}) => {
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

describe("performStorageUpload (vídeo)", () => {
    test("chama storage().ref com path de vídeo do chat", async () => {
        const fake = makeFakeStorage();
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "pub_abc",
            kind: "videos",
            filename: "1700000000000.mp4",
            localUri: "file:///tmp/video.mp4",
            contentType: "video/mp4",
        });

        assert.equal(result.error, false);
        assert.ok(
            fake.calls.some(
                ([op, p]) => op === "ref" && p === "chats/pub_abc/videos/1700000000000.mp4",
            ),
        );
    });

    test("envia contentType do mimeType via putFile", async () => {
        const fake = makeFakeStorage();
        await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "videos",
            filename: "v.mov",
            localUri: "file:///v.mov",
            contentType: "video/quicktime",
        });
        assert.deepEqual(
            fake.calls.filter(([op]) => op === "putFile")[0],
            ["putFile", "file:///v.mov", { contentType: "video/quicktime" }],
        );
    });

    test("retorna o url vindo de getDownloadURL", async () => {
        const fake = makeFakeStorage({ url: "https://cdn/video.mp4" });
        const result = await performStorageUpload({
            storage: () => fake,
            chatId: "c1",
            kind: "videos",
            filename: "v.mp4",
            localUri: "file:///v.mp4",
            contentType: "video/mp4",
        });
        assert.equal(result.url, "https://cdn/video.mp4");
    });
});