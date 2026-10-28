# ORCA MASTER ORCHESTRATOR — Firebase / React Native Refactor

Você será o ORCHESTRATOR principal desta refatoração.

Você NÃO é o principal implementador.

Sua responsabilidade é utilizar os recursos de multi-agent orchestration do Orca ADE para coordenar agentes especializados trabalhando em worktrees isoladas.

Antes de executar qualquer ação de orchestration:

```bash
orca skills get orchestration --full
```

Leia a documentação retornada e utilize exclusivamente os comandos e contratos suportados pela versão atual do Orca.

Não invente comandos de orchestration.

---

# OBJETIVO

Executar as seguintes 30 atividades de engenharia de forma segura, incremental e auditável:

1. Auditoria baseline e mapa de impacto
2. Matriz de imports Firebase Web SDK
3. Adapter Firebase compatível sem troca de SDK
4. Preparação nativa Android/iOS para React Native Firebase
5. Migração Auth para React Native Firebase
6. Migração Firestore read path para React Native Firebase
7. Migração Firestore write path para repositories
8. Migração Storage para React Native Firebase
9. Migração Functions callable para React Native Firebase
10. Decisão e migração de Messaging/Expo Notifications
11. Contrato canônico de orders
12. Leitor compatível para orders legados
13. Escrita validada de orders
14. Cloud Function adminDashboardMetrics
15. Testes financeiros de timezone e bordas
16. Admin Dashboard consumindo métricas agregadas
17. Remoção do download amplo de orders no Admin
18. Refatoração de App.jsx em composition root
19. Providers de erro, permissões, tema e notificações
20. Notification payload contract
21. Notification router e deep linking
22. Remoção de polling navigationRef.isReady
23. Inventário Redux por tipo de estado
24. Remoção progressiva de caches manuais
25. Firestore rules para orders e admin claims/rules
26. Storage rules para anexos e imagens públicas
27. Observabilidade sem dados sensíveis
28. Performance audit de reads, listeners e re-renders
29. Validação Android/iOS/EAS
30. Checklist final de regressão

---

# MODELO DE EXECUÇÃO

Crie um Run de orchestration para:

firebase-mobile-architecture-refactor

As 30 atividades devem existir como tasks individuais e rastreáveis.

Entretanto:

NÃO crie 30 workers simultâneos.

Utilize no máximo 4 ou 5 workers de implementação em paralelo.

Um worker poderá executar várias tasks relacionadas de forma sequencial.

---

# WORKERS

Organize os workers nas seguintes especialidades:

## FIREBASE-PLATFORM

Responsável por:

3
4
5
6
7
8
9

Objetivo:

Migrar progressivamente a infraestrutura Firebase Web para React Native Firebase.

---

## DATA-BACKEND

Responsável por:

11
12
13
14
15
16
17

Objetivo:

Normalizar orders, criar contratos, mover agregações financeiras para backend e modificar Admin Dashboard.

---

## APP-ARCHITECTURE

Responsável por:

18
19
23
24

Objetivo:

Separar responsabilidades do App.jsx e racionalizar Redux/cache.

---

## NOTIFICATIONS

Responsável por:

10
20
21
22

Objetivo:

Definir estratégia Messaging/Expo, payload contract, deep linking e eliminar polling de navegação.

---

## SECURITY

Responsável por:

25
26
27

Objetivo:

Revisar Firestore Rules, Storage Rules e observabilidade segura.

---

## QA-REVIEWER

Responsável principalmente por:

28
29
30

Também deverá revisar outputs críticos dos demais workers.

Esse worker deve preferencialmente utilizar um modelo/agente diferente daquele que implementou a mudança quando possível.

---

# DEPENDÊNCIAS

Respeite obrigatoriamente o seguinte grafo.

Primeiro:

1 → 2

Após 1 e 2:

3
4
11
23

podem avançar conforme os arquivos afetados permitirem.

Firebase:

3 + 4
↓
5
6
8
9

A task 7 deverá considerar o contrato de orders antes de modificar caminhos relacionados a orders.

Orders:

11
↓
12
13

Dashboard:

9 + 11 + 12 + 13
↓
14
↓
15
↓
16
↓
17

Notifications:

4
↓
10

10 + 18 + 19
↓
20
↓
21
↓
22

Redux:

23
↓
24

Security:

5 + 11 + 12 + 13
↓
25

8
↓
26

Hardening:

todas as implementações principais
↓
27
28
↓
29
↓
30

---

# CONTROLE DE CONCORRÊNCIA

Antes de iniciar duas tasks simultaneamente, verifique os arquivos que poderão ser alterados.

Evite permitir que dois workers modifiquem simultaneamente hotspots como:

package.json
package-lock.json
yarn.lock
pnpm-lock.yaml
App.jsx
App.tsx
firebase config
GoogleService-Info.plist
google-services.json
Android Gradle files
iOS Podfile
Firestore Rules
Storage Rules
navigation root

Quando existir risco significativo de colisão, execute as tasks sequencialmente.

---

# GIT

Não faça alterações diretamente em main.

Utilize uma branch de integração:

epic/firebase-mobile-refactor

Workers devem trabalhar em worktrees/branches isoladas.

Quando uma task depender de outra, NÃO considere apenas a hierarquia visual parent/child das worktrees.

A nova task deve começar a partir de uma referência Git que contenha efetivamente as alterações da dependência.

Após a conclusão de um conjunto coerente:

1. validar diff;
2. rodar testes;
3. validar typecheck;
4. validar lint;
5. revisar alterações;
6. integrar na branch epic/firebase-mobile-refactor;
7. somente então liberar tasks dependentes.

---

# CONTRATO DE SAÍDA DE CADA WORKER

Nenhuma task poderá ser marcada como concluída apenas porque o agente declarou que terminou.

Cada worker deverá fornecer:

TASK:
STATUS:
SUMMARY:
FILES_CHANGED:
TESTS_EXECUTED:
TEST_RESULTS:
TYPECHECK:
LINT:
BUILD:
RISKS:
KNOWN_LIMITATIONS:
MIGRATION_NOTES:
COMMIT_SHA:
BLOCKERS:

Caso alguma validação não possa ser executada, explicar explicitamente por quê.

---

# CHECKPOINTS ORCA

Os workers devem atualizar os checkpoints das suas worktrees durante mudanças relevantes.

Utilize os mecanismos oficiais do Orca para indicar estados como:

todo
in-progress
in-review
completed

Não marcar completed antes da revisão.

---

# DEFINITION OF DONE

Uma task somente pode entrar em completed quando:

- implementação estiver presente;
- diff tiver sido analisado;
- nenhuma alteração não relacionada tiver sido introduzida;
- testes relevantes estiverem passando;
- typecheck estiver passando quando existente;
- lint estiver passando quando existente;
- riscos conhecidos estiverem registrados;
- commit estiver criado;
- dependências continuarem válidas.

---

# REVIEW GATE

Mudanças de alto risco exigem review adicional.

Considere alto risco:

Firebase initialization
Authentication
Firestore writes
financial calculations
Cloud Functions
notification routing
Firestore Rules
Storage Rules
native Android configuration
native iOS configuration

Para essas alterações:

IMPLEMENTADOR
↓
REVIEWER
↓
TESTES
↓
INTEGRATION BRANCH

O mesmo agente que implementou não deve ser a única fonte de validação.

---

# PRIMEIRA EXECUÇÃO

Não comece implementando Firebase.

Primeiro execute somente:

TASK 1 — Auditoria baseline e mapa de impacto

e

TASK 2 — Matriz de imports Firebase Web SDK

Depois produza um relatório consolidado contendo:

- arquitetura encontrada;
- arquivos afetados;
- hotspots;
- dependências reais;
- risco de conflito;
- Firebase APIs utilizadas;
- estratégia atual de notifications;
- estrutura de orders;
- Cloud Functions existentes;
- rules existentes;
- estrutura Redux;
- scripts disponíveis;
- testes disponíveis;
- Android/iOS/EAS setup.

Com base na auditoria, compare o DAG planejado com o código real.

Se encontrar uma dependência incorreta na lista acima, ajuste o DAG e registre a justificativa.

Depois da auditoria, inicie a primeira onda de workers.

---

# PRINCÍPIO PRINCIPAL

Otimize para:

CORREÇÃO
> SEGURANÇA
> INTEGRIDADE DOS DADOS
> TESTABILIDADE
> MANUTENIBILIDADE
> PARALELISMO
> VELOCIDADE

Não paralelize trabalho apenas porque existem agentes disponíveis.

Paralelize somente quando as mudanças forem realmente independentes.