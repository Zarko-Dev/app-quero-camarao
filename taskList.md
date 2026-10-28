# Task List — Sorteio (DrawPrize)

- [x] Mapear fluxo completo (telas, controllers, repo, utils, Cloud Functions)
- [x] Confirmar loop de reprodução (execute lê sorteio errado; find perde id; repo sem dedup/delete errado; client boolean mismatch)
- [x] Corrigir controller `live.js` (map id + filter ativo)
- [x] Corrigir repo `DrawPrizesRepository.js` (dedup set, soft delete isDeleted)
- [x] Corrigir `DrawPrizeLive/index.jsx` (execute/reload focado, validação de código, guard criação, reset, datas seguras)
- [x] Corrigir `DrawerPrizeLiveClient/index.jsx` (check boolean)
- [x] Executar `eslint --fix` no `DrawPrizeLive/index.jsx` (540 -> 13 erros restantes, só max-len/no-shadow)
- [x] Extrair orquestração pura (`planDrawExecution` em `src/utils/drawEligibility.js`) + `tests/drawPlanExecution.test.cjs`
- [x] Atualizar diário 2026-09-10; tasks.md; .agent/tasks/progress
