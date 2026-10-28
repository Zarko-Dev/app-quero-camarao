# Known Failures and Lessons

- **Testes Unitários de reportDiscordError**: Identificadas falhas (por ex: "formats the full alert payload", "safely serializes circular and long extra data"). Precisam ser corrigidas para ter um painel verde (`verify.sh = VERIFICATION_PASS`).
- **Problema de Pipeline do Verify**: O verify para de forma correta ao encontrar erros no node-test ou linter (o `set -e` garante a interrupção).## BUG-011 (2026-10-06)
- Falha em produção: "Falha ao salvar ordem no Firebase!" ao publicar com cupom e ao informar venda. Causa raiz: doc users/joseumberto11@gmail.com com campo email divergente do ID (josehumberto11@gmail.com); o app gravava userId de ordem com o campo do storage e as regras comparam com o email do token Auth -> permission-denied.
- Correção aplicada em produção (campo email do doc) e no client (login grava email da sessão Auth). Lição: campos de identidade editáveis não podem ser fonte de ownership; conferir docs com email != ID em futuros relatos de "permission denied".
