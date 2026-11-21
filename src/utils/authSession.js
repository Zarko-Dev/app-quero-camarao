// Espera o primeiro estado do Firebase Auth. `subscribe(cb)` deve registrar cb
// (ex.: onAuthStateChanged) e devolver o unsubscribe (ou uma Promise dele).
// Timeout ou erro NÃO derrubam a sessão: devolvem timedOut=true para o
// chamador manter o usuário logado em vez de deslogar por falha nossa.
const waitForAuthUser = (subscribe, timeoutMs = 5000) => new Promise((resolve) => {
    let done = false;
    let unsubscribe = null;
    let timer = null;

    const finish = (result) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (typeof unsubscribe === "function") unsubscribe();
        resolve(result);
    };

    timer = setTimeout(() => finish({ user: null, timedOut: true }), timeoutMs);

    Promise.resolve()
        .then(() => subscribe((user) => finish({ user: user || null, timedOut: false })))
        .then((unsub) => {
            unsubscribe = unsub;
            if (done && typeof unsub === "function") unsub();
        })
        .catch(() => finish({ user: null, timedOut: true }));
});

module.exports = { waitForAuthUser };
