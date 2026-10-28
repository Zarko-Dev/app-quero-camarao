// Anúncio aberto por deep link sem sessão: guardado até o login terminar.
let pendingPublicationId = null;

module.exports = {
    setPendingPublication: (id) => {
        pendingPublicationId = id || null;
    },
    takePendingPublication: () => {
        const id = pendingPublicationId;
        pendingPublicationId = null;
        return id;
    },
};
