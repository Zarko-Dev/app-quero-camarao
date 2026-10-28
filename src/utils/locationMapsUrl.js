const { Platform } = require("react-native");

const buildLocationMapsUrl = (lat, lng, platform = Platform.OS) => {
    const q = `${lat},${lng}`;
    if (platform === "android") return `geo:${lat},${lng}?q=${q}`;
    return `maps:0,0?q=${q}&ll=${q}`;
};

const buildWazeUrl = (lat, lng) => `waze://?ll=${lat},${lng}&navigate=yes`;

const buildWazeFallbackUrl = (lat, lng) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

const buildGoogleMapsFallbackUrl = (lat, lng) => `https://maps.google.com/maps?q=${lat},${lng}`;

const isValidCoords = (lat, lng) =>
    typeof lat === "number" && isFinite(lat) && lat >= -90 && lat <= 90 &&
    typeof lng === "number" && isFinite(lng) && lng >= -180 && lng <= 180;

const openInGoogleMaps = async (lat, lng, { openURL, platform } = {}) => {
    const primaryUrl = buildLocationMapsUrl(lat, lng, platform);
    const fallbackUrl = buildGoogleMapsFallbackUrl(lat, lng);
    try {
        await openURL(primaryUrl);
    } catch {
        await openURL(fallbackUrl).catch(() => {});
    }
};

const openInWaze = async (lat, lng, { canOpenURL, openURL } = {}) => {
    const appUrl = buildWazeUrl(lat, lng);
    const webUrl = buildWazeFallbackUrl(lat, lng);
    const wazeAvailable = await canOpenURL(appUrl).catch(() => false);
    await openURL(wazeAvailable ? appUrl : webUrl).catch(() => {});
};

module.exports = {
    buildLocationMapsUrl,
    buildWazeUrl,
    buildWazeFallbackUrl,
    buildGoogleMapsFallbackUrl,
    isValidCoords,
    openInGoogleMaps,
    openInWaze,
};
