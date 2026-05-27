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

const buildSingleWinnerShareMessage = (winner, appLink = "") => {
    const drawName = winner?.drawName ?? "Sorteio";
    const linkBlock = appLink ? `\n\nAcompanhe: ${appLink}` : "";

    return [
        "Quero Camarao",
        "",
        `Vencedor(a): ${winner?.name ?? "Nao informado"}`,
        `Sorteio: ${drawName}`,
        `Telefone: ${normalizePhone(winner?.phone)}`,
        `CPF: ${winner?.cpf ? `***.***.${String(winner.cpf).slice(-5)}` : "Nao informado"}`,
        `Cidade: ${getWinnerLocation(winner)}`,
    ].join("\n") + linkBlock;
};

const buildWinnersShareMessage = (winners = [], appLink = "") => {
    const grouped = winners.reduce((acc, winner) => {
        const key = winner?.drawName ?? "Sorteio";
        if (!acc[key]) acc[key] = [];
        acc[key].push(winner);
        return acc;
    }, {});

    const drawBlocks = Object.entries(grouped)
        .map(([drawName, list]) => {
            const lines = list.map((winner, index) =>
                `${index + 1}. ${winner?.name ?? "Nao informado"} | ${getWinnerLocation(winner)} | ${normalizePhone(winner?.phone)}`
            );
            return [`${drawName}`, ...lines].join("\n");
        })
        .join("\n\n");

    const title = winners.length > 1 ? "Vencedores" : "Vencedor";
    const linkBlock = appLink ? `\n\nAcompanhe: ${appLink}` : "";

    return `Quero Camarao\n\n${title} do Sorteio\n\n${drawBlocks}${linkBlock}`;
};

module.exports = {
    buildSingleWinnerShareMessage,
    buildWinnersShareMessage,
};
