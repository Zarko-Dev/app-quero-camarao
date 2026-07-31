const formatRatingLabel = (average, count) => {
    const safeCount = Number(count);
    if (!Number.isFinite(safeCount) || safeCount <= 0) {
        return "⭐ Sem avaliações";
    }
    const safeAverage = Number.isFinite(Number(average)) ? Number(average) : 0;
    const formatted = safeAverage.toFixed(1).replace(".", ",");
    const suffix = safeCount === 1 ? "avaliação" : "avaliações";
    return `⭐ ${formatted} • ${safeCount} ${suffix}`;
};

module.exports = { formatRatingLabel };
