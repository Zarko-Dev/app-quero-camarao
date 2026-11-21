// WAHA/NOWEB entrega para número BR SEM o 9 extra do celular
// (55 + DDD + 8 dígitos). Com o 9, a mensagem fica ack:0 PENDING.
export const toWhatsappId = (raw: string): string | null => {
    let digits = String(raw ?? "").replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
    if (!digits.startsWith("55")) return null;

    let national = digits.slice(2);
    if (national.length === 11 && national[2] === "9") {
        national = national.slice(0, 2) + national.slice(3);
    }
    if (national.length !== 10) return null;
    return `55${national}@c.us`;
};
