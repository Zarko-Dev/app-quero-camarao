const toggleDrawPrizeSelection = (selectedIds = [], drawPrizeId) => {
    if (!drawPrizeId) return [...selectedIds];

    if (selectedIds.includes(drawPrizeId)) {
        return selectedIds.filter((id) => id !== drawPrizeId);
    }

    return [...selectedIds, drawPrizeId];
};

const areAllDrawPrizeSelectionsSelected = (drawPrizeIds = [], selectedIds = []) => {
    if (drawPrizeIds.length === 0) return false;

    return drawPrizeIds.every((id) => selectedIds.includes(id));
};

const toggleAllDrawPrizeSelections = (drawPrizeIds = [], selectedIds = []) => {
    if (areAllDrawPrizeSelectionsSelected(drawPrizeIds, selectedIds)) {
        return selectedIds.filter((id) => !drawPrizeIds.includes(id));
    }

    const selectedSet = new Set(selectedIds);

    drawPrizeIds.forEach((id) => selectedSet.add(id));

    return [...selectedSet];
};

module.exports = {
    toggleDrawPrizeSelection,
    toggleAllDrawPrizeSelections,
    areAllDrawPrizeSelectionsSelected,
};
