// Normaliza a CRIAÇÃO de cupom para o Firestore: para durationType "Quantity",
// durationValue e durationInitialValue devem ser NUMBER (nunca string), senão o
// decremento atômico FieldValue.increment(-1) falha/degrada. Retorna o payload
// normalizado, ou null se a quantidade for inválida (NaN, <= 0).
// CommonJS para permitir teste direto do tipo gravado via node --test.
const normalizeCouponQuantity = (dataCupom) => {
    if (!dataCupom || typeof dataCupom !== "object") {
        return null;
    }

    const payload = { ...dataCupom };

    if (payload.durationType === "Quantity") {
        const value = Number(payload.durationValue);
        if (!Number.isFinite(value) || value <= 0) {
            return null;
        }

        const initialValue = payload.durationInitialValue != null
            ? Number(payload.durationInitialValue)
            : value;

        payload.durationValue = value;
        payload.durationInitialValue = Number.isFinite(initialValue)
            ? initialValue
            : value;
    }

    return payload;
};

module.exports = { normalizeCouponQuantity };
