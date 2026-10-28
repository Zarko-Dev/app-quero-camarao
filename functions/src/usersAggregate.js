// manter sincronizado com src/utils/groupUsersByStateCity.js (normalizeLabel/compareLabels
// são idênticas lá — duplicadas aqui de propósito porque functions/ é deployado isolado:
// Firebase CLI só empacota o conteúdo de functions/, um import relativo pra fora dessa
// pasta quebraria o deploy. Não há tooling de monorepo/build step neste repo que copie
// arquivo compartilhado pra dentro de functions/ antes do deploy).
const normalizeLabel = (value) => {
    const normalized = String(value ?? "").trim();
    return normalized || "Não Identificado";
};

const compareLabels = (left, right, fallbackLabel = "Não Identificado") => {
    if (left === fallbackLabel && right === fallbackLabel) return 0;
    if (left === fallbackLabel) return 1;
    if (right === fallbackLabel) return -1;
    return left.localeCompare(right);
};

// Espelha src/utils/groupUsersByStateCity.js, mas grava só CONTAGENS (sem
// os registros de usuário) - o doc de resumo tem que ficar pequeno.
const computeUsersSummary = (users) => {
    const list = Array.isArray(users) ? users : [];

    const byUserType = {};
    const byStateMap = [];

    list.forEach((user) => {
        const userType = user?.userType || "Não Identificado";
        byUserType[userType] = (byUserType[userType] || 0) + 1;

        const state = normalizeLabel(user?.address?.state ?? user?.state);
        const city = normalizeLabel(user?.address?.city ?? user?.city);

        let stateEntry = byStateMap.find((item) => item.state === state);
        if (!stateEntry) {
            stateEntry = { state, count: 0, cities: [] };
            byStateMap.push(stateEntry);
        }
        stateEntry.count += 1;

        let cityEntry = stateEntry.cities.find((item) => item.city === city);
        if (!cityEntry) {
            cityEntry = { city, count: 0 };
            stateEntry.cities.push(cityEntry);
        }
        cityEntry.count += 1;
    });

    byStateMap.sort((a, b) => compareLabels(a.state, b.state));
    byStateMap.forEach((state) => {
        state.cities.sort((a, b) => compareLabels(a.city, b.city));
    });

    return {
        total: list.length,
        byUserType,
        byState: byStateMap,
    };
};

module.exports = { computeUsersSummary };
