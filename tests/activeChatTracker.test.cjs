const test = require("node:test");
const assert = require("node:assert/strict");

const { setActiveChatId, getActiveChatId } = require("../src/utils/activeChatTracker");

test("getActiveChatId retorna null antes de qualquer set", () => {
    assert.equal(getActiveChatId(), null);
});

test("setActiveChatId guarda o id do chat", () => {
    setActiveChatId("pub1_buyer1");
    assert.equal(getActiveChatId(), "pub1_buyer1");
});

test("setActiveChatId(null) limpa o chat ativo", () => {
    setActiveChatId("pub1_buyer1");
    setActiveChatId(null);
    assert.equal(getActiveChatId(), null);
});

test("setActiveChatId(undefined) também limpa o chat ativo", () => {
    setActiveChatId("pub1_buyer1");
    setActiveChatId(undefined);
    assert.equal(getActiveChatId(), null);
});
