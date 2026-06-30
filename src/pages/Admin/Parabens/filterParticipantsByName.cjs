"use strict";

function filterParticipantsByName(participants, query) {
    const trimmed = query.trim();
    if (!trimmed) return participants;
    const lower = trimmed.toLowerCase();
    return participants.filter((p) => {
        const label = (p.name || p.displayName || "").toLowerCase();
        return label.includes(lower);
    });
}

module.exports = { filterParticipantsByName };
