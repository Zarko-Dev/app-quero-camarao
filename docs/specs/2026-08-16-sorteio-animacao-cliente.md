# Spec: Correções do Sorteio ao Vivo — Animação + Limpeza

**Data:** 2026-08-16  
**Solicitante:** Pedro Roger  
**Status:** Aprovado para implementação

---

## Contexto

O app tem dois lados para o fluxo de sorteio ao vivo:
- **Admin** (`DrawPrizeWinnersResult`) — tela que exibe o resultado com animação completa (loading → win → continuous).
- **Cliente** (`DrawerPrizeLiveClient`) — tela de lista de sorteios em que o participante se inscreveu. Atualmente não tem animação alguma quando o resultado é revelado; ao clicar em "Ver ganhadores" navega para a lista genérica de usuários (`admin.usersList`).

Há também uma tela órfã (`DrawPrizeNewWinnerResult`) que nunca recebe navegação de entrada.

---

## Escopo

### Item 1 — Commit do trabalho pendente

Antes de qualquer mudança nova, commitar os arquivos de sorteio já modificados/novos no working tree em commits lógicos. Escopo exato:

**Modificados:**
- `src/controllers/DrawPrizes/delete.js`
- `src/controllers/DrawPrizes/get.js`
- `src/controllers/DrawPrizes/live.js`
- `src/pages/Admin/DrawPrizeHistory/index.jsx` + `styles.js`
- `src/pages/Admin/DrawPrizeLive/index.jsx`
- `src/pages/Admin/DrawPrizeNewWinnerResult/index.jsx`
- `src/pages/Admin/DrawPrizeWinnersResult/index.jsx`
- `src/pages/DrawerPrizeLiveClient/index.jsx` + `styles.js`
- `src/utils/multipleLiveDraws.js`
- `tests/multipleLiveDraws.test.cjs`

**Não rastreados (novos):**
- `src/controllers/DrawPrizes/helpers.js`
- `src/utils/drawPrizeSelection.js`

**Fora de escopo do commit:** todos os outros arquivos modificados no working tree (trabalho de outra tarefa em andamento — não tocar).

Sugestão de agrupamento lógico:
1. Controllers + helpers: `delete.js`, `get.js`, `live.js`, `helpers.js`
2. Utils + testes: `multipleLiveDraws.js`, `drawPrizeSelection.js`, `tests/multipleLiveDraws.test.cjs`
3. Pages Admin: `DrawPrizeHistory`, `DrawPrizeLive`, `DrawPrizeNewWinnerResult`, `DrawPrizeWinnersResult`
4. Pages Client: `DrawerPrizeLiveClient`

---

### Item 2 — Animação de celebração para o cliente

**Problema:** Quando o admin encerra um sorteio e revela vencedores, o participante (`DrawerPrizeLiveClient`) não vê nenhuma animação. Ele apenas enxerga o botão "Ver ganhadores" e, ao clicar, vai para uma lista genérica sem celebração.

**Solução:** O participante deve ver a mesma sequência de animação que o admin vê em `DrawPrizeWinnersResult`:
1. `lottieLoadingDrawPrize` (loop: false, speed: 0.4, 350×350, duração ~7s)
2. `lottieWinDrawPrize` (loop: false, speed: 0.7, 500×500, duração ~2.5s)
3. `lottieContinousWinDrawPrize` (loop: true, speed: 1, 500×500, permanente)

**Implementação esperada:**
- Extrair a lógica da sequência de animação de `DrawPrizeWinnersResult` para um utilitário reutilizável (ex: `src/utils/drawAnimationSequence.js` ou hook `src/hooks/useDrawAnimation.js`). O utilitário deve ser testável com `node --test` (arquivo `.cjs` em `tests/`).
- `DrawerPrizeLiveClient` deve usar esse utilitário/hook ao navegar para a tela de resultado do cliente. Ao clicar em "Ver ganhadores" num sorteio encerrado, o cliente deve ver a animação completa antes de ver a lista de ganhadores — mesmo comportamento que o admin, sem os controles administrativos (sem share por WhatsApp individual, sem botão excluir sorteio).
- `DrawPrizeWinnersResult` deve ser atualizado para usar o mesmo utilitário (sem duplicação).

**Dados disponíveis no cliente:** o objeto do sorteio (`item`) já contém `winners[]` com objetos completos de usuário (conforme schema Firestore). A tela de resultado do cliente pode exibir: nome, foto (`userImage` ou avatar gerado), cidade/estado.

**Critérios de aceite:**
- Clicar em "Ver ganhadores" num sorteio encerrado inicia a sequência loading → win → continuous.
- A lista de vencedores aparece após ~7s (junto com a transição para `lottieWinDrawPrize`), igualando o comportamento do admin.
- A lógica da sequência está em módulo separado, sem duplicação entre admin e cliente.
- Teste unitário cobre a sequência de estados (timings, transições de key/loop/speed).
- Não há acesso a dados reais do Firestore durante os testes.

---

### Item 3 — Remoção da tela órfã DrawPrizeNewWinnerResult

**Problema:** `DrawPrizeNewWinnerResult` tem TODO na linha 1 indicando que não tem navegação de entrada. Pedro confirmou: pode remover.

**Arquivos a deletar:**
- `src/pages/Admin/DrawPrizeNewWinnerResult/index.jsx`
- `src/pages/Admin/DrawPrizeNewWinnerResult/styles.js`

**Mudanças em rotas:**
- `src/routes/index.jsx`: remover import (`DrawPrizeNewWinnerResult`) e a `<Screen>` que usa `component={DrawPrizeNewWinnerResult}` (linha ~277).
- `src/routes/dataRoutes.js`: remover a chave `drawPrizeNewWinnerResult: "Draw Prize New Winner Result"` (linha 60).

**Verificação:** grep por `DrawPrizeNewWinnerResult` e `drawPrizeNewWinnerResult` em todo o projeto deve retornar zero resultados após a remoção.

---

## O que está fora de escopo

- Nenhuma alteração em dados reais do Firestore.
- Não criar nova rota de deep link para a tela de resultado do cliente.
- Não alterar o fluxo do admin (apenas refatorar para reusar o utilitário extraído).
- Não fazer build nem deploy — app em produção, só código.

---

## Ordem de execução recomendada

1. Commit do trabalho pendente (item 1).
2. Extração do utilitário de animação + teste (base do item 2).
3. Integração do utilitário em `DrawPrizeWinnersResult` + `DrawerPrizeLiveClient` (item 2 completo).
4. Remoção da tela órfã (item 3).
5. Commit final das novas mudanças.
