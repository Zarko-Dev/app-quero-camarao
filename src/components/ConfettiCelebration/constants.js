const MAX_DELAY_MS = 2000;
const MIN_DUR_MS = 2500;
const MAX_DUR_MS = MIN_DUR_MS + 2000; // 4500
// must cover max particle lifetime (MAX_DELAY_MS + MAX_DUR_MS) before unmounting ConfettiCelebration
const CONFETTI_DURATION_MS = MAX_DELAY_MS + MAX_DUR_MS + 500; // 7000

module.exports = { CONFETTI_DURATION_MS, MAX_DELAY_MS, MIN_DUR_MS, MAX_DUR_MS };
