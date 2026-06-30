const formatDecimalValue = (value, maxDecimalPlaces = 0) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "";
    }

    if (maxDecimalPlaces <= 0) {
        return String(Math.trunc(numericValue));
    }

    return numericValue.toLocaleString("pt-BR", {
        minimumFractionDigits: maxDecimalPlaces,
        maximumFractionDigits: maxDecimalPlaces,
    });
};

const sanitizeDecimalInput = (value, maxDecimalPlaces = 0, maxValue = null) => {
    const rawValue = String(value ?? "")
        .replace(/\s+/g, "")
        .replace(/[^0-9.,]/g, "");

    if (!rawValue) return "";

    const hasMaxValue = maxValue !== null && maxValue !== undefined;
    const numericMaxValue = hasMaxValue ? Number(maxValue) : null;
    const firstSeparatorIndex = rawValue.search(/[.,]/);

    if (firstSeparatorIndex === -1) {
        if (
            hasMaxValue
            && Number.isFinite(numericMaxValue)
            && Number(rawValue) > numericMaxValue
        ) {
            return formatDecimalValue(maxValue, maxDecimalPlaces);
        }

        return rawValue;
    }

    const integerPart = rawValue.slice(0, firstSeparatorIndex);
    const decimalPart = rawValue
        .slice(firstSeparatorIndex + 1)
        .replace(/[.,]/g, "")
        .slice(0, Math.max(0, maxDecimalPlaces));

    if (maxDecimalPlaces <= 0) {
        const sanitizedInteger = integerPart || "0";

        if (
            hasMaxValue
            && Number.isFinite(numericMaxValue)
            && Number(sanitizedInteger) > numericMaxValue
        ) {
            return formatDecimalValue(maxValue, maxDecimalPlaces);
        }

        return sanitizedInteger;
    }

    const sanitizedValue = `${integerPart || "0"},${decimalPart}`;

    if (hasMaxValue && Number.isFinite(numericMaxValue)) {
        const numericValue = Number(sanitizedValue.replace(",", "."));

        if (Number.isFinite(numericValue) && numericValue > numericMaxValue) {
            return formatDecimalValue(maxValue, maxDecimalPlaces);
        }
    }

    return sanitizedValue;
};

module.exports = {
    sanitizeDecimalInput,
    formatDecimalValue,
};
