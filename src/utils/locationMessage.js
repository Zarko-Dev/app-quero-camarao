const inRange = (n, max) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= max;

// Converts getChatLocation() result into the message `location` field, or null when unusable.
const buildLocationPayload = (result) => {
    if (!result || result.error) return null;
    const { lat, lng } = result;
    return inRange(lat, 90) && inRange(lng, 180) ? { lat, lng } : null;
};

module.exports = { buildLocationPayload };
