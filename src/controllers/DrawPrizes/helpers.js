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

const filterActiveOnly = (drawPrizes = []) =>
    drawPrizes.filter((drawPrize) => drawPrize?.status === true);

const filterNotYetParticipating = (drawPrizes = [], participant) =>
    drawPrizes.filter((drawPrize) => !drawPrize?.participants?.includes(participant));

const buildCloseDrawUpdate = (now = new Date()) => ({
    status: false,
    updatedAt: normalizeDate(now),
});

const mergeParticipants = (existing = [], incoming = []) =>
    Array.from(new Set([...(existing || []), ...(incoming || [])]));

const orchestrateDeleteDrawPrizes = async (drawPrizeIds = [], softDeleteDrawPrizeById) => {
    const uniqueIds = [...new Set(drawPrizeIds)].filter(Boolean);
    if (uniqueIds.length === 0) return true;

    const results = await Promise.all(uniqueIds.map((id) => softDeleteDrawPrizeById(id)));
    return results.every(Boolean);
};

module.exports = {
    buildCloseDrawUpdate,
    buildSoftDeleteDrawPrizeUpdate,
    filterActiveOnly,
    filterActiveDrawPrizes,
    filterNotYetParticipating,
    mergeParticipants,
    orchestrateDeleteDrawPrizes,
};
