const formatKilo = (value) => {
    const formatValue = String(value ?? "").replace(",", ".");

    if (formatValue.indexOf(".") !== -1) {
        return formatValue;
    }

    return Number(formatValue).toLocaleString("pt-BR");
};

module.exports = { formatKilo };
