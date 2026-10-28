const { formatKilo } = require("./formatKilo");

const formatShrimpDetails = ({ shrimps, location } = {}) => {
    const validShrimps = (shrimps ?? []).filter(
        (s) =>
            s
            && s.grammage != null
            && s.kilo != null
            && String(s.grammage).trim() !== ""
            && String(s.kilo).trim() !== "",
    );

    if (validShrimps.length === 0) {
        return null;
    }

    const totalKg = validShrimps.reduce((sum, s) => {
        const raw = String(s.kilo ?? "").replace(",", ".");
        return sum + (parseFloat(raw) || 0);
    }, 0);

    const grammages = [
        ...new Set(
            validShrimps.map((s) => {
                const rawG = String(s.grammage).trim().replace(/g$/i, "");
                return `${rawG}g`;
            }),
        ),
    ].join(" e ");

    const totalKgStr = formatKilo(String(totalKg));

    let locationStr = "";
    if (typeof location === "string") {
        locationStr = location.trim();
    } else if (location && typeof location === "object") {
        if (location.city && location.state) {
            locationStr = `${location.city}/${location.state}`;
        } else {
            locationStr = (location.city || location.state || "").trim();
        }
    }

    const locationPart = locationStr ? ` em ${locationStr}` : "";

    return { totalKgStr, grammages, locationPart };
};

const buildNotificationBody = ({ shrimps, location } = {}) => {
    const details = formatShrimpDetails({ shrimps, location });
    if (!details) {
        return "Um novo camarão 🦐 foi publicado, venha conferir!";
    }
    const { totalKgStr, grammages, locationPart } = details;
    return `${totalKgStr}kg de camarão de ${grammages}${locationPart} acaba de ser publicado`;
};

const buildEditNotificationBody = ({ shrimps, location } = {}) => {
    const details = formatShrimpDetails({ shrimps, location });
    if (!details) {
        return "Uma publicação foi alterada, venha conferir!";
    }
    const { totalKgStr, grammages, locationPart } = details;
    return `${totalKgStr}kg de camarão de ${grammages}${locationPart} foi alterado, venha conferir!`;
};

module.exports = { buildNotificationBody, buildEditNotificationBody };
