const test = require("node:test");
const assert = require("node:assert/strict");

const { formatFileSize } = require("../src/utils/formatFileSize");

test("retorna vazio para inválido ou <= 0", () => {
    assert.equal(formatFileSize(0), "");
    assert.equal(formatFileSize(-10), "");
    assert.equal(formatFileSize(NaN), "");
    assert.equal(formatFileSize(undefined), "");
    assert.equal(formatFileSize(null), "");
});

test("bytes inteiros abaixo de 1024", () => {
    assert.equal(formatFileSize(1), "1 B");
    assert.equal(formatFileSize(532), "532 B");
    assert.equal(formatFileSize(1023), "1023 B");
});

test("KB com 1 casa decimal e vírgula", () => {
    assert.equal(formatFileSize(1024), "1,0 KB");
    assert.equal(formatFileSize(12698), "12,4 KB");
    assert.equal(formatFileSize(1024 * 1023), "1023,0 KB");
});

test("MB com 1 casa decimal e vírgula a partir de 1024 KB", () => {
    assert.equal(formatFileSize(1024 * 1024), "1,0 MB");
    assert.equal(formatFileSize(Math.round(1.8 * 1024 * 1024)), "1,8 MB");
});
