const isNumericVersion = (value) => /^[0-9]+(\.[0-9]+)*$/.test(value);

// 1 se remote > local, -1 se menor, 0 se igual. Partes ausentes valem 0 ("3" == "3.0.0").
const compareDotVersions = (remote, local) => {
    const remoteParts = remote.split(".").map(Number);
    const localParts = local.split(".").map(Number);
    const maxLength = Math.max(remoteParts.length, localParts.length);

    for (let index = 0; index < maxLength; index += 1) {
        const remoteValue = remoteParts[index] ?? 0;
        const localValue = localParts[index] ?? 0;

        if (remoteValue > localValue) return 1;
        if (remoteValue < localValue) return -1;
    }

    return 0;
};

// Valor ausente/inválido nunca bloqueia o usuário.
const isBelowMinimumVersion = (minimum, appVersion) => {
    const min = `${minimum ?? ""}`.trim();
    const app = `${appVersion ?? ""}`.trim();
    if (!isNumericVersion(min) || !isNumericVersion(app)) return false;
    return compareDotVersions(min, app) > 0;
};

module.exports = { compareDotVersions, isBelowMinimumVersion, isNumericVersion };
