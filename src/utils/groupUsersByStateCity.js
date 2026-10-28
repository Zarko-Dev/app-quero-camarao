// manter sincronizado com functions/src/usersAggregate.js (normalizeLabel/compareLabels
// são duplicadas ali porque functions/ é deployado isolado — Firebase CLI só empacota o
// conteúdo de functions/, um import relativo pra fora dessa pasta quebraria o deploy).
const normalizeLabel = (value) => {
    const normalized = String(value ?? "").trim();

    return normalized || "Não Identificado";
};

const compareLabels = (left, right, fallbackLabel = "Não Identificado") => {
    if (left === fallbackLabel && right === fallbackLabel) {
        return 0;
    }

    if (left === fallbackLabel) {
        return 1;
    }

    if (right === fallbackLabel) {
        return -1;
    }

    return left.localeCompare(right);
};

const groupUsersByStateCity = (users = []) => {
    const groupedUsers = (Array.isArray(users) ? users : []).reduce(
        (acc, user) => {
            const state = normalizeLabel(user?.address?.state ?? user?.state);
            const city = normalizeLabel(user?.address?.city ?? user?.city);

            let stateExists = acc.find((item) => item.state === state);

            if (!stateExists) {
                stateExists = {
                    state,
                    count: 0,
                    data: [],
                };
                acc.push(stateExists);
            }

            stateExists.count += 1;

            let cityExists = stateExists.data.find((item) => item.city === city);

            if (!cityExists) {
                cityExists = {
                    city,
                    count: 0,
                    dataUser: [],
                };
                stateExists.data.push(cityExists);
            }

            cityExists.count += 1;
            cityExists.dataUser.push(user);

            return acc;
        },
        [],
    );

    groupedUsers.sort((a, b) => compareLabels(a.state, b.state));

    groupedUsers.forEach((state) => {
        state.data.sort((a, b) => compareLabels(a.city, b.city));
    });

    return groupedUsers;
};

module.exports = {
    groupUsersByStateCity,
    normalizeLabel,
};
