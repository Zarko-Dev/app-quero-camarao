/**
 * drawSpecificRules.js
 *
 * Regras específicas de sorteio:
 *   1. Regra 2-em-5: cálculo do número sugerido de ganhadores.
 *   2. Sorteio com indicações obrigatórias do admin.
 *   3. Filtro de ganhadores bloqueáveis (apenas sorteados, nunca indicados).
 *
 * Convenções:
 *   - CommonJS (module.exports), sem dependências externas.
 *   - Chave de identificação: uid || email || cpf (igual a drawEligibility.js).
 *   - randomFn parametrizável (default Math.random) para testes determinísticos.
 */

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Retorna a chave de identificação única de um participante.
 * Mesma lógica de getParticipantKey em drawEligibility.js.
 *
 * @param {object} participant
 * @returns {string}
 */
const getParticipantKey = (participant) => {
    if (!participant) return "";
    return participant.uid || participant.email || participant.cpf || "";
};

// ---------------------------------------------------------------------------
// calculateSuggestedWinners
// ---------------------------------------------------------------------------

/**
 * Calcula o número sugerido de ganhadores pela regra 2-em-5.
 *
 * Fórmula: Math.floor(eligibleCount * 2 / 5)
 * Resultado mínimo: 0.
 *
 * Exemplos:
 *   0  → 0
 *   4  → 1   (floor de 1.6)
 *   5  → 2
 *   7  → 2   (floor de 2.8)
 *   10 → 4
 *   13 → 5   (floor de 5.2)
 *   25 → 10
 *
 * Decisão de design: não há limiar mínimo absoluto (ex: sem "precisa de 5").
 * Com 4 elegíveis a sugestão já é 1. O admin pode ignorar a sugestão.
 *
 * @param {number} eligibleCount - Número de participantes elegíveis.
 * @returns {number} Número sugerido de ganhadores (>= 0).
 */
const calculateSuggestedWinners = (eligibleCount) => {
    if (!eligibleCount || eligibleCount < 0) return 0;
    return Math.floor(eligibleCount * 2 / 5);
};

// ---------------------------------------------------------------------------
// pickWinnersWithAdminPicks
// ---------------------------------------------------------------------------

/**
 * Realiza o sorteio respeitando indicações obrigatórias do admin.
 *
 * Regras:
 *   - Indicados válidos (que existam em eligibleParticipants) entram primeiro,
 *     na ordem de adminPickedKeys, todos com isAdminPicked=true.
 *   - adminPickedKeys duplicadas são deduplicadas.
 *   - Indicados que não estejam em eligibleParticipants são silenciosamente descartados.
 *   - Se indicados válidos >= totalWinners: retorna só os primeiros totalWinners
 *     indicados, sem sorteio.
 *   - Ganhadores restantes (totalWinners - indicadosVálidos) são sorteados
 *     aleatoriamente dos elegíveis NÃO indicados, com isAdminPicked=false.
 *   - Se elegíveis disponíveis < vagas restantes: retorna o que há, sem repetir.
 *
 * @param {object} params
 * @param {object[]} params.eligibleParticipants - Participantes elegíveis.
 * @param {string[]} params.adminPickedKeys - Chaves (uid/email/cpf) dos indicados.
 * @param {number} params.totalWinners - Total de ganhadores desejado.
 * @param {function} [params.randomFn] - Função de aleatoriedade (default Math.random).
 * @returns {object[]} Array de ganhadores com flag isAdminPicked.
 */
const pickWinnersWithAdminPicks = ({
    eligibleParticipants = [],
    adminPickedKeys = [],
    totalWinners = 0,
    randomFn = Math.random,
}) => {
    if (eligibleParticipants.length === 0) return [];

    const target = Math.max(0, totalWinners);

    // Mapa de elegíveis por chave para lookup O(1)
    const eligibleByKey = new Map(
        eligibleParticipants.map((p) => [getParticipantKey(p), p])
    );

    // Deduplicar adminPickedKeys mantendo ordem de inserção
    const uniqueAdminKeys = [...new Set(adminPickedKeys)];

    // Filtrar indicados que realmente existem nos elegíveis
    const validAdminPicks = uniqueAdminKeys
        .filter((key) => eligibleByKey.has(key))
        .slice(0, target) // trunca se indicados > totalWinners
        .map((key) => ({ ...eligibleByKey.get(key), isAdminPicked: true }));

    const adminPickKeySet = new Set(validAdminPicks.map((w) => getParticipantKey(w)));

    // Vagas restantes para sorteio
    const remainingSlots = target - validAdminPicks.length;

    if (remainingSlots <= 0) {
        return validAdminPicks;
    }

    // Pool para sorteio: elegíveis que NÃO foram indicados
    const pool = eligibleParticipants.filter(
        (p) => !adminPickKeySet.has(getParticipantKey(p))
    );

    // Sortear sem repetição
    const randomWinners = [];
    const mutablePool = [...pool];

    for (let i = 0; i < remainingSlots; i++) {
        if (mutablePool.length === 0) break;
        const randomIndex = Math.floor(randomFn() * mutablePool.length);
        const picked = mutablePool[randomIndex];
        randomWinners.push({ ...picked, isAdminPicked: false });
        mutablePool.splice(randomIndex, 1);
    }

    return [...validAdminPicks, ...randomWinners];
};

// ---------------------------------------------------------------------------
// filterBlockableWinners
// ---------------------------------------------------------------------------

/**
 * Filtra apenas os ganhadores bloqueáveis (sorteados, não indicados).
 *
 * Ganhadores com isAdminPicked=true NÃO devem ser bloqueados.
 * Use esta função para alimentar blockWinners() com segurança.
 *
 * @param {object[]} winners - Array de ganhadores com flag isAdminPicked.
 * @returns {object[]} Apenas ganhadores com isAdminPicked === false.
 */
const filterBlockableWinners = (winners = []) => {
    return winners.filter((w) => w.isAdminPicked === false);
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
    calculateSuggestedWinners,
    pickWinnersWithAdminPicks,
    filterBlockableWinners,
};
