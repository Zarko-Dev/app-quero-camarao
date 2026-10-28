# Spec — Celebração Rica do Ganhador no Sorteio ao Vivo

**Data:** 2026-08-19  
**Automação:** quero-camarao-1787181349158  
**Contexto:** A entrega anterior (16/08) apenas reaproveitou a sequência Lottie básica já existente (loading → win → continuous) na tela do cliente. Pedro pediu algo mais elaborado/caprichado no momento da revelação do ganhador.

---

## Objetivo

Enriquecer a celebração do ganhador no sorteio ao vivo com: confetti Lottie sobreposto, entrada animada (spring/bounce) dos cards de ganhadores, e efeito de brilho/glow pulsante na foto. Sem instalar novas dependências nativas — usar apenas libs já instaladas.

---

## Arquivos Afetados

| Arquivo | Mudança |
|---|---|
| `src/utils/drawAnimationSequence.js` | Adicionar step `confetti`, novo TIMING, atualizar `buildAnimationSequence()` |
| `src/pages/Admin/DrawPrizeWinnersResult/index.jsx` | Integrar confetti overlay + animações de entrada nos cards |
| `src/pages/Admin/DrawPrizeWinnersResult/styles.js` | Novo `ConfettiOverlay` styled-component |
| `src/assets/lotties/lottieConfettiDrawPrize.json` | **Novo** arquivo Lottie de confetti/celebração (JSON, sem native dep) |

> `DrawerPrizeLiveClient` não precisa ser alterado — já navega para `DrawPrizeWinnersResult` via `dataRoutes.admin.drawPrizeWinnerResult` com `showOnlyResults: false`, herdando a animação automaticamente.

---

## Sequência de Animação Nova

```
loading (7s)
  ↓ +7s
win (2.5s) + [SIMULTÂNEO: confetti overlay aparece]
  ↓ +2.5s
confetti encerra / continuous inicia (loop)
```

TIMING atualizado em `drawAnimationSequence.js`:
```js
const TIMING = {
    LOADING_REVEAL_MS: 7000,
    WIN_TO_CONTINUOUS_MS: 2500,
    CONFETTI_DURATION_MS: 3000, // sobreposto ao step "win"
};
```

`buildAnimationSequence()` retorna 4 steps:
```js
[
  { step: "loading",    delayMs: 0 },
  { step: "win",        delayMs: TIMING.LOADING_REVEAL_MS },
  { step: "confetti",   delayMs: TIMING.LOADING_REVEAL_MS }, // simultâneo ao win
  { step: "continuous", delayMs: TIMING.LOADING_REVEAL_MS + TIMING.WIN_TO_CONTINUOUS_MS },
]
```

> O step "confetti" é um **overlay** (position: absolute, pointerEvents: none), não substitui o step "win" principal.

---

## Animações nos Cards de Ganhadores

Ao aparecer (`showResult` passa para `true`):

- Cada card de ganhador entra com **spring scale 0 → 1**, staggerado em **150ms por card** (card 0 entra em 0ms, card 1 em 150ms, etc.)
- A **foto do ganhador** tem um efeito de **glow pulsante** (Animated opacity 0.4 → 1.0 → 0.4, loop, 800ms de ciclo) via borda circular colorida com a cor `theme.colors.primary`
- Implementar com `Animated.Value` do react-native ou `useSharedValue` do `react-native-reanimated` (já instalado)

---

## Lottie de Confetti

- Baixar um JSON de confetti/celebração de lottiefiles.com (licença MIT/gratuita, ex: "confetti" ID: 1234 ou similar) e salvar como `src/assets/lotties/lottieConfettiDrawPrize.json`
- Se não encontrar JSON adequado gratuito, criar um Lottie JSON mínimo com partículas coloridas (burst animation)
- Dimensões: largura e altura 100% da tela (`width: "100%"`, `height: "100%"`) no overlay
- `loop: false`, `speed: 1`

---

## Critérios de Aceite

### AC-01 — Sequência de animação
Ao acessar "Ver ganhadores" com `showOnlyResults: false`, a sequência observada deve ser:
1. Lottie loading exibido por ~7s
2. Lottie win exibido + confetti sobreposto aparecem simultaneamente
3. ~2.5s depois: confetti encerra, Lottie continuous inicia em loop
4. Cards de ganhadores aparecem durante o step "win"

### AC-02 — Entrada animada dos cards
Cada card de ganhador entra com animação scale (spring bounce) staggerada em 150ms por card. O primeiro card aparece imediatamente ao `showResult=true`.

### AC-03 — Glow pulsante na foto
A foto do ganhador tem borda circular colorida (`theme.colors.primary`) com opacidade pulsante em loop enquanto a tela estiver visível.

### AC-04 — Confetti é overlay não-bloqueante
O Lottie de confetti usa `position: absolute` e `pointerEvents: none`, não bloqueia toque nos cards.

### AC-05 — `showOnlyResults: true` não animado
Quando `showOnlyResults: true`, nenhuma animação de entrada é executada — cards aparecem estáticos como antes.

### AC-06 — Fonte única de verdade
Toda lógica de timing e steps permanece em `src/utils/drawAnimationSequence.js`. Nenhuma constante de tempo hardcoded fora desse arquivo.

### AC-07 — Sem dependências novas nativas
Nenhum pacote adicionado ao `package.json`. Usar apenas: `lottie-react-native`, `react-native-reanimated`, `react-native` Animated API.

### AC-08 — Cleanup de timers
O `useEffect` que dispara a sequência retorna um cleanup que cancela todos os `setTimeout` pendentes, prevenindo memory leak ao sair da tela durante a animação.

### AC-09 — Cliente herda celebração
A tela do cliente (`DrawerPrizeLiveClient → "Ver ganhadores"`) exibe a mesma celebração rica sem alterações na tela de lista (apenas `DrawPrizeWinnersResult` foi modificada).

---

## Suposições

1. `DrawerPrizeLiveClient` usa a mesma `DrawPrizeWinnersResult` (confirmado: `navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, { drawerPrizeLiveId, showOnlyResults: false })`). Nenhuma duplicação necessária.
2. Sound (`expo-av`) é opcional e não entra nos ACs desta entrega. Pode ser adicionado em iteração futura.
3. O JSON de confetti será obtido de lottiefiles.com com licença gratuita. Se não encontrado, o dev deve criar um JSON mínimo funcional.
4. `react-native-reanimated` já está instalado (v3.17.4) e pode ser usado sem novo build.

---

## Passos para o Dev (dev-frontend-mobile)

**Passo 1** — Obter/criar `lottieConfettiDrawPrize.json` e adicionar em `src/assets/lotties/`

**Passo 2** — Atualizar `drawAnimationSequence.js`:
  - Adicionar `CONFETTI_DURATION_MS` em `TIMING`
  - Adicionar `animationSteps.confetti`
  - Atualizar `buildAnimationSequence()` com o step confetti simultâneo ao win

**Passo 3** — Atualizar `DrawPrizeWinnersResult/index.jsx`:
  - Importar `lottieConfettiDrawPrize`
  - Adicionar state `showConfetti` (boolean)
  - No `useEffect` da sequência, detectar step "confetti" → setar `showConfetti=true`, depois de `CONFETTI_DURATION_MS` → `showConfetti=false`
  - Adicionar `ConfettiOverlay` (position absolute, pointerEvents none) condicional a `showConfetti`
  - Implementar `Animated.Value` por card para entrada spring com stagger
  - Implementar glow pulsante na `UserImage`

**Passo 4** — Atualizar `styles.js`:
  - Adicionar `ConfettiOverlay`: `position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;`
  - Ajustar `UserImage` para aceitar wrapper com glow (se necessário)

**Passo 5** — Testar:
  - Fluxo admin: sorteio ao vivo → resultado → animação completa
  - Fluxo cliente: lista de sorteios → "Ver ganhadores" → mesma animação
  - Fluxo `showOnlyResults: true`: sem animação
  - Navegar para fora durante animação: sem crash/leak
