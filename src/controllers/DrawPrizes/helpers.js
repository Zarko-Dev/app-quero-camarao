const normalizeDate = (value) => {
    if (value instanceof Date) {
        return new Date(value);
    }

    return new Date(value);
};

const buildSoftDeleteDrawPrizeUpdate = (now = new Date()) => {
    const deletedAt = normalizeDate(now);

    return {
        isDeleted: true,
        deletedAt,
        updatedAt: new Date(deletedAt),
    };
};

const filterActiveDrawPrizes = (drawPrizes = []) =>
    drawPrizes.filter((drawPrize) => !drawPrize?.isDeleted);

module.exports = {
    buildSoftDeleteDrawPrizeUpdate,
    filterActiveDrawPrizes,
};
