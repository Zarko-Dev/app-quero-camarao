const monthKeyOf = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

const toDate = (value) => {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// setNewVisuaization.js sempre faz [...dataViews, novaEntrada] - o array só
// cresce, nunca reordena/edita entradas antigas. Então tudo depois do
// tamanho anterior é novo.
const diffNewViews = (beforeViews, afterViews) => {
    const beforeLength = Array.isArray(beforeViews) ? beforeViews.length : 0;
    const after = Array.isArray(afterViews) ? afterViews : [];
    if (after.length <= beforeLength) return [];
    return after.slice(beforeLength);
};

// Agrupa as views novas por mês (YYYY-MM), contando por dia-do-mês e
// hora-do-dia dentro de cada mês - é exatamente o formato que os gráficos
// de "Visualizações Diárias" e "Horário de Pico" precisam.
const groupNewViewsByMonth = (entries) => {
    const result = {};
    (entries || []).forEach((entry) => {
        const date = toDate(entry?.createdAt);
        if (!date) return;
        const monthKey = monthKeyOf(date);
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        if (!result[monthKey]) {
            result[monthKey] = { daily: {}, hourly: {}, total: 0 };
        }
        result[monthKey].daily[day] = (result[monthKey].daily[day] || 0) + 1;
        result[monthKey].hourly[hour] = (result[monthKey].hourly[hour] || 0) + 1;
        result[monthKey].total += 1;
    });
    return result;
};

module.exports = { monthKeyOf, diffNewViews, groupNewViewsByMonth };
