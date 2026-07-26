let activeChatId = null;

const setActiveChatId = (id) => {
    activeChatId = id ?? null;
};

const getActiveChatId = () => activeChatId;

module.exports = {
    setActiveChatId,
    getActiveChatId,
};
