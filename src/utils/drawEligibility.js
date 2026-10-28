const hasLocation = (user) => {
    if (!user) return false;

    const nestedState = user.address?.state;
    const nestedCity = user.address?.city;
    const flatState = user.state;
    const flatCity = user.city;

    return Boolean((nestedState && nestedCity) || (flatState && flatCity));
};

const getParticipantKey = (participant) => {
    if (!participant) return "";
    return participant.uid || participant.email || participant.cpf || "";
};

const buildWinnerKeySet = (previousWinners = []) =>
    new Set(previousWinners.map(getParticipantKey).filter(Boolean));

const buildEligibleParticipants = ({
    participants = [],
    previousWinners = [],
    logger = () => {},
}) => {
    const winnerKeys = buildWinnerKeySet(previousWinners);

    return participants.filter((participant) => {
        const key = getParticipantKey(participant);

        if (!key) {
            logger("[draw] excluded missing_identifier");
            return false;
        }

        if (!hasLocation(participant)) {
            logger(`[draw] excluded missing_location key=${key}`);
            return false;
        }

        if (winnerKeys.has(key)) {
            logger(`[draw] excluded already_winner key=${key}`);
            return false;
        }

        logger(`[draw] included key=${key}`);
        return true;
    });
};

const pickRandomUniqueWinners = (eligibleParticipants, countPrizes, randomFn = Math.random) => {
    const winners = [];
    const pool = [...eligibleParticipants];
    const targetCount = Math.max(0, countPrizes);

    for (let index = 0; index < targetCount; index++) {
        if (pool.length === 0) break;
        const randomIndex = Math.floor(randomFn() * pool.length);
        const randomElement = pool[randomIndex];
        winners.push(randomElement);
        pool.splice(randomIndex, 1);
    }

    return winners;
};

const partitionIndicatedAndRandom = ({
    indicatedIds = [],
    previousWinners = [],
    participants = [],
    eligibleParticipants = [],
    countPrizes = 1,
    pickRandomFn = pickRandomUniqueWinners,
}) => {
    const previousWinnerKeys = new Set(
        previousWinners.map((w) => w.uid || w.email || w.cpf).filter(Boolean)
    );

    // Filter out indicated participants who have already won
    const activeIndicatedIds = indicatedIds.filter((uid) => !previousWinnerKeys.has(uid));

    // We only draw up to countPrizes from the sequence of active indicated participants
    const drawnIndicatedIds = activeIndicatedIds.slice(0, countPrizes);
    const remainingIndicatedIds = activeIndicatedIds.slice(countPrizes);

    // Map the drawn indicated IDs to their full user objects
    const indicatedWinners = drawnIndicatedIds
        .map((uid) => participants.find((p) => p.uid === uid || p.email === uid || p.cpf === uid))
        .filter(Boolean)
        .map((p) => ({ ...p, indicated: true }));

    // Exclude all active indicated participants from the random pool to prevent them from winning randomly
    const activeIndicatedSet = new Set(activeIndicatedIds);
    const poolForRandom = eligibleParticipants.filter((p) => !activeIndicatedSet.has(p.uid || p.email || p.cpf));

    const randomCount = Math.max(0, countPrizes - indicatedWinners.length);
    const selectedWinners = pickRandomFn(poolForRandom, randomCount);

    const winners = [...indicatedWinners, ...selectedWinners];

    return {
        winners,
        remainingIndicatedIds,
    };
};

// Pure core of executeDrawPrizeLive: who wins now, who stays indicated, what gets persisted.
const planDrawExecution = ({
    draw,
    users = [],
    prizeName,
    countPrizes = 1,
    logger,
    pickRandomFn,
}) => {
    const previousWinners = draw?.winners ?? [];
    const eligibleParticipants = buildEligibleParticipants({
        participants: users,
        previousWinners,
        logger,
    });
    const { winners, remainingIndicatedIds } = partitionIndicatedAndRandom({
        indicatedIds: draw?.indicatedParticipants ?? [],
        previousWinners,
        participants: users,
        eligibleParticipants,
        countPrizes,
        ...(pickRandomFn ? { pickRandomFn } : {}),
    });
    const newWinners = winners.map((item) => ({ ...item, drawName: prizeName }));

    return {
        newWinners,
        allWinners: [...previousWinners, ...newWinners],
        remainingIndicatedIds,
    };
};

module.exports = {
    planDrawExecution,
    buildEligibleParticipants,
    pickRandomUniqueWinners,
    partitionIndicatedAndRandom,
    buildWinnerKeySet,
};
