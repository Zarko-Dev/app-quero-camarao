const { formatKilo } = require("./formatKilo");

const buildPublicationSummary = (shrimps) => {
    if (!Array.isArray(shrimps)) return "";

    return shrimps
        .filter((s) => s && s.grammage != null)
        .map((s) => `${s.grammage}g • ${formatKilo(s.kilo)}kg`)
        .join(" · ");
};

module.exports = { buildPublicationSummary };
