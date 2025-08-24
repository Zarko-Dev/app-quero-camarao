export const formatKilo = (value) => {
    const formatValue = value.replace(",", ".");

    if (formatValue.indexOf(".") !== -1) {
        return formatValue;
    }

    return Number(formatValue).toLocaleString("pt-BR");
};
