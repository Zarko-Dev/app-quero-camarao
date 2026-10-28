# Gestão — Bug: botão "+" na tela "Sorteio Ativo" reverte imediatamente

Data: 2026-08-19
Fase: gestão
Automação: quero-camarao-1787180253295
Spec produto base: `docs/specs/2026-08-19-bug-plus-button-draw-live.md`

---

## Resumo executivo

Bug pré-existente (não regressão). O handler `handleCreateNewDraw` zera `drawerPrizeLiveId`, que está
na dep array do `useCallback` que envolve o `useFocusEffect`. A mudança dispara re-execução do effect
enquanto a tela está em foco, recarregando o sorteio ativo e revertendo o estado em milissegundos.

Arquivo único afetado: `src/pages/Admin/DrawPrizeLive/index.jsx`  
Linhas críticas: 76 (`useState drawerPrizeLiveId`), 107–133 (`useFocusEffect`), 226–235 (`handleCreateNewDraw`)

---

## Critérios de aceite (verificáveis)

| # | Cenário | Resultado esperado |
|---|---------|-------------------|
| AC-1 | Admin entra na tela com sorteio ativo (ex: Podcast-2555) | Tela exibe "Sorteio Ativo" com código e participantes |
| AC-2 | Admin clica no botão `+` (ícone `feather plus`, círculo laranja no header) | Tela exibe imediatamente "Informe o código do sorteio" com campos de código e nome em branco |
| AC-3 | Tela permanece em estado de criação após AC-2 (sem bounce de volta) | Tela permanece no estado de criação por pelo menos 5 segundos sem auto-revert |
| AC-4 | Admin preenche código + nome e clica "Iniciar Sorteio" em AC-2 | Novo sorteio é criado com sucesso; tela exibe "Sorteio Ativo" com o novo sorteio |
| AC-5 | Admin clica em `refresh-cw` com sorteio ativo | Dados do sorteio focado são recarregados normalmente |
| AC-6 | Admin navega para outra tab e volta para a tela | `useFocusEffect` re-executa e recarrega o sorteio normalmente |
| AC-7 | Nenhuma regressão em `DrawPrizeWinnersResult` nem `drawAnimationSequence` | Fluxo de ver ganhadores + animação de celebração continua funcionando |

---

## Passos para o dev (implementação)

### Passo 1 — Criar ref espelho de `drawerPrizeLiveId`

```jsx
// Adicionar logo após o useState existente de drawerPrizeLiveId (linha 76)
const drawerPrizeLiveIdRef = useRef(null);

// Adicionar useEffect de sincronização (antes do useFocusEffect):
useEffect(() => {
    drawerPrizeLiveIdRef.current = drawerPrizeLiveId ?? null;
}, [drawerPrizeLiveId]);
```

Garantir que `useRef` e `useEffect` estão no import do React no topo do arquivo.

### Passo 2 — Trocar acesso dentro do useFocusEffect

Na linha 113, substituir `drawerPrizeLiveId` por `drawerPrizeLiveIdRef.current`:

```jsx
// Antes:
drawerPrizeLiveId
    ? getDrawPrizeLiveById(drawerPrizeLiveId)
    : getActiveDrawPrizeLive(),

// Depois:
drawerPrizeLiveIdRef.current
    ? getDrawPrizeLiveById(drawerPrizeLiveIdRef.current)
    : getActiveDrawPrizeLive(),
```

### Passo 3 — Remover `drawerPrizeLiveId` da dep array do useCallback

Na linha 132, remover `drawerPrizeLiveId` das deps (manter apenas `loadActiveDraws`):

```jsx
// Antes:
}, [loadActiveDraws, drawerPrizeLiveId]),

// Depois:
}, [loadActiveDraws]),
```

### Passo 4 — Verificar imports

Confirmar que o import do React no topo inclui `useRef` e `useEffect`:

```jsx
import { useCallback, useEffect, useRef, useState } from "react";
```

### Passo 5 — Smoke test manual (obrigatório antes de fechar)

1. Emulador ou device com sorteio ativo.
2. Clicar `+` → confirmar que tela fica em criação (AC-2, AC-3).
3. Criar novo sorteio → confirmar AC-4.
4. Clicar `refresh-cw` → confirmar AC-5.
5. Navegar para outra tab e voltar → confirmar AC-6.
6. Abrir tela "Ver ganhadores" de qualquer sorteio → confirmar AC-7.

---

## Suposições registradas

- O comportamento esperado do `+` é entrar em modo de criação de novo sorteio (não navegar para
  tela separada). Baseado na leitura do código: `handleCreateNewDraw` limpa o estado local para
  exibir o formulário — não chama `navigation.navigate`. Sem outro referencial disponível.
- Não há teste automatizado para este fluxo. Smoke test manual cobre AC-1 a AC-7.
- Nenhuma mudança de UX está em escopo; o fix é puramente estrutural no hook.

---

## Risco residual

Baixo. A mudança de `useState` → `useRef` como fonte de verdade dentro do callback é padrão
documentado no React para evitar stale closures sem criar deps circulares. O `useEffect` de
sincronização garante que o ref está sempre atualizado antes de qualquer leitura externa.
