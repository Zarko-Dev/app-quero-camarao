const sanitizeVersion = (value) => `${value ?? ""}`.trim();

const isNumericVersion = (value) => /^[0-9]+(\.[0-9]+)*$/.test(value);

const compareDotVersions = (remote, local) => {
    const remoteParts = remote.split(".").map((item) => Number(item));
    const localParts = local.split(".").map((item) => Number(item));
    const maxLength = Math.max(remoteParts.length, localParts.length);

    for (let index = 0; index < maxLength; index += 1) {
        const remoteValue = remoteParts[index] ?? 0;
        const localValue = localParts[index] ?? 0;

        if (remoteValue > localValue) return 1;
        if (remoteValue < localValue) return -1;
    }

    return 0;
};

const shouldForceAppUpdate = ({
    forceUpdate = false,
    remoteVersion,
    appVersion,
    buildVersion,
}) => {
    if (!forceUpdate) {
        return false;
    }

    const remote = sanitizeVersion(remoteVersion);
    const app = sanitizeVersion(appVersion);
    const build = sanitizeVersion(buildVersion);

    if (!remote) {
        return false;
    }

    if (remote === app || remote === build) {
        return false;
    }

    if (isNumericVersion(remote) && remote.includes(".")) {
        if (!isNumericVersion(app)) {
            return false;
        }

        return compareDotVersions(remote, app) > 0;
    }

    if (isNumericVersion(remote) && isNumericVersion(build)) {
        return Number(remote) > Number(build);
    }

    return false;
};

const getStoreUrlByPlatform = (configData = {}, platform) => {
    if (platform === "android") {
        return (
            configData.androidUri
            || configData.androidUrl
            || configData.android
            || ""
        );
    }

    if (platform === "ios") {
        return (
            configData.iosUri
            || configData.iosUrl
            || configData.ios
            || ""
        );
    }

    return "";
};

module.exports = {
    compareDotVersions,
    getStoreUrlByPlatform,
    shouldForceAppUpdate,
};
