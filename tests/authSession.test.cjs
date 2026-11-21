const test = require("node:test");
const assert = require("node:assert/strict");

const { waitForAuthUser } = require("../src/utils/authSession");

test("sessão presente: devolve o usuário e cancela a inscrição", async () => {
    let unsubscribed = false;
    const result = await waitForAuthUser((cb) => {
        setTimeout(() => cb({ uid: "u1" }), 1);
        return () => { unsubscribed = true; };
    });
    assert.deepEqual(result, { user: { uid: "u1" }, timedOut: false });
    assert.equal(unsubscribed, true);
});

test("sessão ausente: user null sem timeout (deve forçar novo login)", async () => {
    const result = await waitForAuthUser((cb) => {
        cb(null);
        return () => {};
    });
    assert.deepEqual(result, { user: null, timedOut: false });
});

test("sem resposta do Auth: timedOut=true (mantém sessão)", async () => {
    const result = await waitForAuthUser(() => () => {}, 10);
    assert.deepEqual(result, { user: null, timedOut: true });
});

test("subscribe falha: timedOut=true (mantém sessão)", async () => {
    const result = await waitForAuthUser(() => { throw new Error("boom"); }, 50);
    assert.deepEqual(result, { user: null, timedOut: true });
});
