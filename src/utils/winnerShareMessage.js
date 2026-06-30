const normalizePhone = (phone) => {
    if (!phone) return "Nao informado";
    return String(phone).replace(/\D/g, "") || "Nao informado";
};

const getWinnerLocation = (winner) => {
    if (!winner) return "Nao informado/Nao informado";
    if (winner.userType === "productor") {
        const city = winner?.address?.city ?? "Nao informado";
        const state = winner?.address?.state ?? "Nao informado";
        return `${city}/${state}`;
    }

    const city = winner?.city ?? "Nao informado";
    const state = winner?.state ?? "Nao informado";
    return `${city}/${state}`;
};

const buildSingleWinnerShareMessage = (winner) => {
    const drawName = winner?.drawName ?? "Sorteio";

    return [
        "🦐🦐🦐 QUERO CAMARÃO 🦐🦐🦐",
        "",
        "🏆 PARABÉNS AO VENCEDOR(A)!",
        "",
        `👤 ${winner?.name ?? "Nao informado"}`,
        `🎯 Sorteio: ${drawName}`,
        `📞 Telefone: ${normalizePhone(winner?.phone)}`,
        `🪪 CPF: ${winner?.cpf ? `***.***.${String(winner.cpf).slice(-5)}` : "Nao informado"}`,
        `📍 Cidade: ${getWinnerLocation(winner)}`,
        "",
        "🦐 Este sorteio tem oferecimento de QUERO CAMARÃO 🦐",
    ].join("\n");
};

const buildWinnersShareMessage = (winners = []) => {
    const grouped = winners.reduce((acc, winner) => {
        const key = winner?.drawName ?? "Sorteio";
        if (!acc[key]) acc[key] = [];
        acc[key].push(winner);
        return acc;
    }, {});

    const drawBlocks = Object.entries(grouped)
        .map(([drawName, list]) => {
            const lines = list.map((winner, index) =>
                `${index + 1}. 👤 ${winner?.name ?? "Nao informado"} | 📍 ${getWinnerLocation(winner)} | 📞 ${normalizePhone(winner?.phone)}`
            );
            return [`🎯 ${drawName}`, ...lines].join("\n");
        })
        .join("\n\n");

    const title = winners.length > 1 ? "Vencedores" : "Vencedor";

    return `🦐🦐🦐 QUERO CAMARÃO 🦐🦐🦐\n\n🏆 ${title} do Sorteio\n\n${drawBlocks}\n\n🦐 Este sorteio tem oferecimento de QUERO CAMARÃO 🦐`;
};

const buildCongratulatoryMessage = (winner, draw) => {
    const name = winner?.name ?? "Participante";
    const drawName = draw?.name ?? draw?.code ?? "Sorteio";
    const theme = draw?.theme ?? "";
    const date = draw?.createdAt?.toDate
        ? draw.createdAt.toDate()
        : draw?.createdAt instanceof Date
        ? draw.createdAt
        : new Date();
    const formatted = date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const themeBlock = theme ? `, ${theme}` : "";
    return encodeURIComponent(
        `🦐🦐🦐 QUERO CAMARÃO 🦐🦐🦐\n\n🏆 Parabéns ${name}, por ganhar o sorteio ${drawName}${themeBlock}, realizado no dia ${formatted}.\n\n🦐 Este sorteio tem oferecimento de QUERO CAMARÃO 🦐`
    );
};

module.exports = {
    buildSingleWinnerShareMessage,
    buildWinnersShareMessage,
    buildCongratulatoryMessage,
};
