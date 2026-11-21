# Refatoração de Arquitetura — Preparação para Chat

Proteger auth, orders, pagamentos e Firestore enquanto refatora a base para novos módulos (chat).

---

## Fase 1 — Linha de Base e Rede de Segurança

- [ ] Rodar auditoria baseline: listar todos os arquivos que importam `firebase/app`, `firebase/firestore`, `firebase/auth`, `firebase/storage`, `firebase/functions` e registrar quais APIs cada um usa. Salvar resultado em `.maestro/playbooks/audit-baseline-live.md`.
- [ ] Verificar se todos os testes unitários atuais passam: executar `npx jest --passWithNoTests` e registrar pass/fail count em `.maestro/playbooks/audit-baseline-live.md`. Se falhar, parar e reportar antes de avançar.
- [ ] Executar typecheck (`npx tsc --noEmit` ou equivalente do Expo) e registrar erros em `.maestro/playbooks/audit-baseline-live.md`.
- [ ] Executar lint (`npx eslint src/` ou equivalente) e registrar erros em `.maestro/playbooks/audit-baseline-live.md`.
- [ ] Criar branch de integração `epic/chat-refactor` a partir de `main` e confirmar que `main` está limpo (sem alterações pendentes).

## Fase 2 — Camada Adapter Firebase (Web SDK → React Native Firebase)

- [ ] Criar `src/services/Firebase/adapter.js` que exporta as mesmas interfaces (initApp, getAuthInstance, getFirestoreInstance, getStorageInstance, getFunctionsInstance) usando `@react-native-firebase/*` em vez de `firebase/*`. Não remover imports antigos ainda — apenas criar o adapter.
- [ ] Criar testes unitários para o adapter em `tests/adapter.test.cjs` que verificam: inicialização sem erro, cada instância retorna objeto válido, persistência auth usa AsyncStorage.
- [ ] Rodar typecheck e lint após criar adapter. Se falir, corrigir antes de seguir.
- [ ] Migrar `src/services/Firebase/index.js` para usar o adapter internamente (mantendo a mesma exportação externa). Nenhum outro arquivo deve quebrar neste passo.
- [ ] Rodar testes unitários novamente. Confirmar que todos passam. Commitar com mensagem `feat(firebase): add RN Firebase adapter layer`.

## Fase 3 — Proteção de Auth e Orders (Zero Quebra)

- [ ] Refatorar `src/controllers/User/authentication.js` para usar o adapter Firebase. Manter mesma API de entrada/saída. Nenhuma mudança de comportamento permitida.
- [ ] Refatorar `src/controllers/User/register.js` para usar o adapter Firebase. Manter mesma API de entrada/saída.
- [ ] Refatorar `src/controllers/User/resetPassword.js` e `resetPasswordByIdentifier.js` para usar o adapter Firebase.
- [ ] Rodar testes de auth específicos. Se existirem, confirmar pass. Se não existirem, criar testes mínimos de integração para sign-in e sign-up.
- [ ] Refatorar `src/controllers/Payment/order.js` para usar o adapter Firebase. Proteger todas as operações CRUD de orders. Nenhuma mudança de schema ou regra de negócio.
- [ ] Criar teste de regressão para orders: criar, ler, atualizar, deletar um order fictício e confirmar que o fluxo completo funciona via adapter.
- [ ] Confirmar que nenhum arquivo de configuração Firebase (`firebase.json`, `GoogleService-Info.plist`, `google-services.json`) foi modificado.

## Fase 4 — Refatoração de App.jsx e Composition Root

- [ ] Analisar `App.jsx` atual e documentar todas as providers, imports e dependências em `.maestro/playbooks/app-architecture.md`.
- [ ] Refatorar `App.jsx` como composition root: extrair cada provider para seu próprio arquivo em `src/providers/` (ErrorBoundary, Theme, Permissions, Notifications). App.jsx deve apenas compor os providers.
- [ ] Garantir que a navegação root (React Navigation) permaneça funcional após a refatoração. Nenhum route pode quebrar.
- [ ] Rodar a app em build de desenvolvimento (`npx expo start --tunnel`) e confirmar que a tela inicial carrega sem erros.
- [ ] Rodar testes unitários e confirmar que todos passam após mudança no App.jsx.

## Fase 5 — Redux e Caches (Limpeza Controlada)

- [ ] Inventariar todo o estado Redux atual: listar cada reducer, action type e slice em `.maestro/playbooks/redux-inventory.md`.
- [ ] Remover caches manuais redundantes (se existirem) que duplicam estado já gerenciado pelo Redux. Cada remoção deve ser acompanhada de teste que confirma o comportamento permanece idêntico.
- [ ] Garantir que nenhum reducer de auth, orders ou pagamentos seja alterado nesta fase. Apenas caches auxiliares e estado de UI.
- [ ] Rodar testes e typecheck. Confirmar zero regressões.

## Fase 6 — Estrutura Base para Chat Module

- [ ] Criar `src/features/chat/` com estrutura mínima: `index.js`, `contracts/`, `controllers/`, `hooks/`, `services/`.
- [ ] Criar contrato canônico de chat em `src/features/chat/contracts/` definindo: tipos de mensagem, schema de sala, regras de permissão (quem pode ler/escrever).
- [ ] Criar `src/features/chat/controllers/chatController.js` usando o adapter Firebase (não o Web SDK). Implementar apenas operações de leitura (listar salas, ler mensagens) — escrita será na próxima fase.
- [ ] Criar testes unitários para o chat controller que mockam o adapter Firebase e validam o fluxo de leitura.
- [ ] Garantir que o chat module não importa nenhum arquivo de `src/controllers/Payment/` ou `src/controllers/User/authentication.js` diretamente — apenas via adapter ou contracts.

## Fase 7 — Segurança e Rules

- [ ] Revisar `firestore.rules` e confirmar que regras de orders, auth e admin claims estão intactas e não foram enfraquecidas pela migração do adapter.
- [ ] Revisar `storage.rules` e confirmar que regras de anexos e imagens públicas permanecem válidas.
- [ ] Criar regras de Firestore para o novo chat module em `src/features/chat/contracts/firestore-rules.md` descrevendo quais regras serão necessárias.
- [ ] Executar `firebase emulators:exec` (ou equivalente) para validar rules se possível. Registrar resultado.

## Fase 8 — Observabilidade e Hardening

- [ ] Garantir que Sentry (`@sentry/react-native`) capture erros do adapter Firebase sem vazar dados sensíveis (tokens, credenciais).
- [ ] Remover qualquer `console.log` ou `console.warn` de produção nos controllers migrados.
- [ ] Verificar que o fluxo de notificações (Expo Notifications) não foi afetado pela migração do adapter.
- [ ] Rodar o conjunto completo de testes: unitários + functions tests. Registrar resultado final em `.maestro/playbooks/regression-report.md`.

## Fase 9 — Validação de Plataforma e Regressão Final

- [ ] Executar build de desenvolvimento para Android (`eas build --profile development`) e confirmar que o APK é gerado sem erros.
- [ ] Executar build de desenvolvimento para iOS (`eas build --profile development`) e confirmar que o build é gerado sem erros (ou pelo menos que o prebuild completa).
- [ ] Rodar lint completo no projeto (`npx eslint .` ou equivalente) e confirmar zero erros novos.
- [ ] Rodar typecheck completo e confirmar zero erros novos.
- [ ] Rodar testes finais de regressão: auth sign-in, order CRUD, payment flow (mock), chat read. Todos devem passar.
- [ ] Fazer merge da branch `epic/chat-refactor` em `main` apenas após todas as validações acima passarem.

---

## Pontos de Parada (Halt)

Se em qualquer fase:
- Testes falharem após uma mudança
- Auth, orders ou pagamentos apresentarem comportamento diferente do baseline
- Build falhar

Escreva `<!-- maestro:halt: <motivo> -->` no documento e pare a execução.

---

## Checkpoint de Saída de Cada Fase

Cada fase deve produzir:

- PHASE: nome da fase
- STATUS: completed | blocked | partial
- SUMMARY: o que foi feito
- FILES_CHANGED: lista de arquivos modificados
- TESTS_EXECUTED: quantos testes rodou
- TEST_RESULTS: pass/fail count
- TYPECHECK: ok | failed | not applicable
- LINT: ok | failed | not applicable
- RISKS: riscos conhecidos
- KNOWN_LIMITATIONS: limitações da fase
- COMMIT_SHA: hash do commit final da fase
- BLOCKERS: bloqueios (se houver)

---

## Regras de Concorrência

Este playbook é para trabalho individual em `main`. Não há workers paralelos. Cada fase deve ser concluída e validada antes de iniciar a próxima.

Hotspots protegidos (nunca modificar sem checkpoint de baseline):
- `package.json`, `package-lock.json`, `yarn.lock`
- `App.jsx` (apenas na Fase 4, com testes de regressão)
- `firebase.json`, `GoogleService-Info.plist`, `google-services.json`
- `firestore.rules`, `storage.rules`
- Arquivos de configuração de navegação root