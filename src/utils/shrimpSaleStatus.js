const areAllShrimpsSold = (shrimps) =>
    Array.isArray(shrimps) && shrimps.length > 0 && shrimps.every((s) => s.sale === true);

module.exports = { areAllShrimpsSold };
