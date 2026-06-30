const parseDecimalValue = (value) => {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const numericValue = Number(String(value).trim().replace(",", "."));

    return Number.isFinite(numericValue) ? numericValue : 0;
};

const calculateShrimpSalePrice = (tablePrice10g, soldGrammage) => {
    const basePrice = parseDecimalValue(tablePrice10g);
    const grammage = parseDecimalValue(soldGrammage);
    const calculatedPrice = basePrice + (grammage - 10);

    return Number(Math.max(0, calculatedPrice).toFixed(2));
};

const formatPriceValue = (value) => {
    const parsedValue = parseDecimalValue(value);

    return parsedValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

module.exports = {
    calculateShrimpSalePrice,
    formatPriceValue,
    parseDecimalValue,
};
