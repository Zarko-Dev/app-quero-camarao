# Cadastro de Usuário Server-Side Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o cadastro idempotente e impedir que uma falha entre Firebase Auth e Firestore deixe o usuário sem conseguir concluir o cadastro.

**Architecture:** O app enviará os dados para uma HTTPS Callable Function. A Function valida o payload, coordena Auth e Firestore com compensação e retorna um resultado único; o cliente só cria sessão/local storage após sucesso. A reconciliação automática detecta inconsistências remanescentes.

**Tech Stack:** React Native/Expo, React Native Firebase Functions, Firebase Cloud Functions v2, Firebase Admin SDK, Firestore Rules, Node test runner/Jest.

---

### Task 1: Contrato server-side e testes

**Files:**
- Create: `functions/src/registerUser.js`
- Test: `functions/src/registerUser.test.js`
- Modify: `functions/src/index.js`

- [x] Escrever testes para validação, cadastro idempotente, rollback e recuperação de órfão.
- [x] Implementar a Callable com Admin SDK e erro estruturado.
- [x] Exportar `registerUser` em `functions/src/index.js`.

### Task 2: Migrar o cliente

**Files:**
- Modify: `src/controllers/User/register.js`
- Modify: `src/services/FirebaseAdapter.js`
- Test: `tests/registerFlow.test.cjs`

- [x] Substituir criação direta Auth/Firestore pela chamada Callable.
- [x] Manter armazenamento local somente depois da resposta de sucesso.
- [x] Enviar falhas técnicas ao Discord com dados mascarados.

### Task 3: Fechar a porta de criação direta

**Files:**
- Modify: `firestore.rules`
- Test: `functions/src/registerUser.test.js`

- [x] Bloquear `create` direto em `users` pelo cliente no código das regras.
- [x] Preservar leitura e atualizações autorizadas existentes.

### Task 4: Reconciliação e validação

**Files:**
- Create: `functions/src/reconcileUsers.js`
- Test: `functions/src/reconcileUsers.test.js`
- Modify: `functions/src/index.js`
- Modify: `.agent/tasks.json`
- Modify: `.agent/progress.md`

- [x] Criar rotina administrativa idempotente para localizar Auth sem perfil e perfil sem Auth.
- [x] Executar testes Functions e testes do app.
- [x] Documentar que as regras e o rollout do app dependem da publicação da nova versão.
