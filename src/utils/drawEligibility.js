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
            logger(`[draw] excluded missing_identifier`);
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

module.exports = {
    buildEligibleParticipants,
    pickRandomUniqueWinners,
};
