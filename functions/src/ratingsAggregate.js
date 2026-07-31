const computeAggregate = (ratings) => {
    const valid = (Array.isArray(ratings) ? ratings : [])
        .map((r) => Number(r?.stars))
        .filter((s) => Number.isFinite(s) && s >= 1 && s <= 5);
    if (valid.length === 0) return { average: 0, count: 0 };
    const sum = valid.reduce((a, b) => a + b, 0);
    return { average: Math.round((sum / valid.length) * 10) / 10, count: valid.length };
};

module.exports = { computeAggregate };
