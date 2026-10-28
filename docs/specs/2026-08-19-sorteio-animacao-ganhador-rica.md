# Spec: Celebração Rica do Ganhador — Sorteio ao Vivo

**Data:** 2026-08-19
**Solicitante:** Pedro Roger
**Contexto:** A entrega anterior (`quero-camarao-sorteio-animacao`, 16/08) apenas reaproveitou a
sequência lottie básica já existente (loading → win → continuous) na tela do cliente. Pedro confirmou
que o resultado ficou fraco; quer celebração mais elaborada no momento da revelação do ganhador.
**Status:** Aprovado para implementação

---

## Problema

A sequência atual (loading → win → continuous) é funcional, mas genérica: três lotties tocam em
sequência e pronto. Não há destaque visual ao nome/foto do ganhador, nenhuma sensação de surpresa ou
emoção no momento da revelação, e o layout dos cards aparece abruptamente.

---

## Objetivo

Tornar o momento de revelação do ganhador marcante para o participante (e para o admin que
acompanha ao vivo), sem quebrar a base técnica já construída e sem introduzir risco de regressão
em produção.

---

## Escopo

### O que entra

1. **Confete sobreposto no momento da revelação** — uma segunda `LottieView` com animação de confete
   é exibida como overlay (`StyleSheet.absoluteFill`) a partir do momento em que o ganhador aparece
   (`TIMING.LOADING_REVEAL_MS`), rodando por ~4s e some depois.

2. **Revelação sequencial dos cards** — os cards de ganhador aparecem um por vez com stagger de
   150 ms: slide-in a partir da direita + fade-in, usando `Animated.stagger` do React Native. Sem
   nova biblioteca.

3. **Pulso na foto/avatar do ganhador** — ao entrar em tela, a foto (ou avatar gerado) de cada
   ganhador executa 2 ciclos de escala (1.0 → 1.08 → 1.0) com `Animated.loop`, depois para.
   Efeito sutil de "destaque" sem ser excessivo.

4. **Asset lottie de confete** — adicionar `src/assets/lotties/lottieConfettiCelebration.json`
   (arquivo lottie gratuito de confete/celebração, obtido em lottiefiles.com). O dev deve selecionar
   um que: tenha fundo transparente, seja compacto (idealmente < 150 KB), use cores vibrantes mas
   compatíveis com o fundo branco/claro do app.

5. **Extensão de `drawAnimationSequence.js`** — adicionar `TIMING.CONFETTI_DURATION_MS: 4000`
   e exportar `buildConfettiSequence()` que retorna `{ startDelayMs: TIMING.LOADING_REVEAL_MS,
   durationMs: TIMING.CONFETTI_DURATION_MS }`. Isso mantém o utilitário como fonte de verdade dos
   timings.

### O que NÃO entra

- Som/áudio de celebração (risco de incomodar usuário com dispositivo no silencioso; produto não
  pediu explicitamente).
- Nova rota de navegação — cliente já acessa `DrawPrizeWinnersResult` via `handleShowWinners`.
- Alteração de dados no Firestore.
- Build ou deploy — dev entrega só código.
- Mudança no fluxo do admin (apenas enriquecimento visual, mesma lógica de negócio).

---

## Fluxo enriquecido

```
[Usuário clica "Ver ganhadores"]
    ↓
lottieLoadingDrawPrize (7 s, suspense)
    ↓ t=7s
lottieWinDrawPrize (2,5 s) +
lottieConfettiCelebration (overlay, 4 s) +  ← NOVO
Cards aparecem com stagger (um por vez)     ← NOVO
Foto de cada card pulsa 2x                 ← NOVO
    ↓ t=9,5s
lottieContinousWinDrawPrize (loop, permanente)
```

---

## Arquivos afetados

| Arquivo | Mudança |
|---|---|
| `src/utils/drawAnimationSequence.js` | Adicionar `TIMING.CONFETTI_DURATION_MS`, `buildConfettiSequence()` |
| `src/assets/lotties/lottieConfettiCelebration.json` | Novo asset (baixar do lottiefiles.com) |
| `src/pages/Admin/DrawPrizeWinnersResult/index.jsx` | Adicionar overlay confete + stagger nos cards + pulso nas fotos |
| `tests/drawAnimationSequence.test.cjs` | Testes para `buildConfettiSequence()` |

`DrawerPrizeLiveClient` **não precisa de mudança** — já delega para `DrawPrizeWinnersResult`.

---

## Critérios de aceite

1. Ao clicar "Ver ganhadores" num sorteio encerrado, a sequência loading → win → continuous ocorre
   como antes (timings inalterados: 7s e 2.5s).
2. No momento `t=7s`, confete aparece em overlay sobre a tela e desaparece após 4s.
3. Os cards de ganhadores aparecem com intervalo de ~150ms entre eles (stagger visível).
4. Cada foto/avatar do ganhador executa 2 ciclos de pulso de escala ao entrar na tela, depois para.
5. `buildConfettiSequence()` retorna `{ startDelayMs: 7000, durationMs: 4000 }`.
6. Testes unitários de `drawAnimationSequence.test.cjs` cobrem `buildConfettiSequence()` (ao menos:
   startDelayMs bate com LOADING_REVEAL_MS; durationMs bate com CONFETTI_DURATION_MS).
7. Suíte completa (`node --test tests/**/*.test.cjs`) passa sem regressão.
8. `showOnlyResults=true` (path do histórico) continua mostrando cards direto, sem confete nem
   stagger (esses efeitos só fazem sentido na revelação ao vivo).
9. Nenhuma alteração em dados reais do Firestore.

---

## Suposições do produto

- O asset de confete será buscado e adicionado pelo dev-frontend-mobile; Pedro revisa
  visualmente depois e pode pedir ajuste do arquivo se não gostar.
- As animações `Animated` do React Native (stagger/loop) são suficientes sem biblioteca extra;
  caso o dev identifique limitação técnica, deve registrar no findings da fase de revisão.
- O comportamento para admin e cliente é idêntico (ambos acessam `DrawPrizeWinnersResult`),
  sem diferenciação de UI entre os dois perfis nesta feature.
