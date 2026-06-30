const { sanitizeDecimalInput } = require("./sanitizeDecimalInput");
const { parseDecimalValue } = require("./shrimpSalePricing");

const sanitizeGrammageInput = (value, maxDecimalPlaces = 2, maxValue = 70) => {
    const sanitizedValue = sanitizeDecimalInput(value, maxDecimalPlaces);
    const numericValue = parseDecimalValue(sanitizedValue);

    if (numericValue > maxValue) {
        return {
            value: Number(maxValue).toFixed(maxDecimalPlaces).replace(".", ","),
            exceeded: true,
        };
    }

    return {
        value: sanitizedValue,
        exceeded: false,
    };
};

module.exports = {
    sanitizeGrammageInput,
};
