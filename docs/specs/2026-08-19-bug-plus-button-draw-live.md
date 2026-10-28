# Spec — Bug: botão "+" na tela "Sorteio Ativo" reverte imediatamente

Data: 2026-08-19
Tipo: bug fix
Arquivo central: `src/pages/Admin/DrawPrizeLive/index.jsx`

---

## Contexto

A tela Admin > Sorteio ao Vivo (`DrawPrizeLive`) tem dois estados visuais:

1. **Sem sorteio ativo** — exibe título "Informe o código do sorteio" + campos de código e nome + botão "Iniciar Sorteio".
2. **Com sorteio ativo** — exibe título "Sorteio Ativo" + código + participantes + controles de sorteio.

Quando há um sorteio ativo, o header exibe dois botões circulares laranja (`ReloadButton`):
- `+` (feather `plus`) — deveria colocar a tela em modo de criação de novo sorteio.
- `refresh-cw` — recarrega os dados do sorteio focado.

---

## Bug

**Sintoma (relatado em vídeo pelo cliente):** clicar no botão `+` com um sorteio ativo (ex: Podcast-2555) navega para a tela "Informe o código do sorteio" e imediatamente retorna ao "Sorteio Ativo" — aparência de loop.

**Causa raiz identificada:**

O handler `handleCreateNewDraw` (linha 226) limpa todo o estado local, incluindo `drawerPrizeLiveId = undefined`. Essa variável está na dep array do `useCallback` que alimenta o `useFocusEffect` (linha 132). Quando a dep muda, React Navigation re-executa o effect enquanto a tela está em foco. Como `drawerPrizeLiveId` agora é `undefined`, o effect chama `getActiveDrawPrizeLive()`, obtém o sorteio ativo (Podcast-2555) e restaura o estado — revertendo completamente a ação do `+` em milissegundos.

```
Usuário clica "+"
  → handleCreateNewDraw(): drawerPrizeLiveId = undefined
    → useCallback dep muda → useFocusEffect re-executa
      → getActiveDrawPrizeLive() retorna Podcast-2555
        → drawerCodeFixed = "2555", drawerPrizeLiveId = "xyz"
          → tela volta para "Sorteio Ativo"
```

**Não é regressão da automação sorteio-animacao:** a automação de 16/08 tocou em `DrawPrizeWinnersResult` e `drawAnimationSequence`. O `DrawPrizeLive` não foi alterado; a causa é estrutural e pré-existia.

---

## Comportamento esperado

Ao clicar em `+`:
- A tela deve exibir o estado "Informe o código do sorteio" (campos de código e nome).
- O admin pode digitar código + nome e clicar em "Iniciar Sorteio" para criar um segundo sorteio simultâneo.
- A tela permanece no estado de criação até que o admin (a) inicie o sorteio ou (b) recarregue a tela manualmente.

---

## Fix proposto

Desacoplar o `useFocusEffect` da variável de estado `drawerPrizeLiveId` usando um `useRef`:

1. Criar `drawerPrizeLiveIdRef = useRef(null)`, sincronizado com `drawerPrizeLiveId` via um `useEffect` simples.
2. Dentro do callback do `useFocusEffect`, ler `drawerPrizeLiveIdRef.current` em vez do estado.
3. Remover `drawerPrizeLiveId` da dep array do `useCallback` (o ref não é dep, é acesso direto).

Com isso, `useFocusEffect` só re-executa em eventos de foco (entrar na tela), não quando o estado muda internamente — que é o comportamento correto.

---

## Escopo

**Entra:**
- Correção do handler `handleCreateNewDraw` / `useFocusEffect` para não disparar reload ao limpar estado.

**Não entra:**
- Redesenho da UX do fluxo de criação de sorteio.
- Mudança na navegação para tela separada de criação.
- Qualquer alteração em `DrawPrizeWinnersResult`, `drawAnimationSequence` ou telas de cliente.

---

## Critérios de aceite

1. Admin está na tela "Sorteio Ativo" com sorteio ativo carregado.
2. Admin clica em `+`.
3. A tela exibe "Informe o código do sorteio" com os campos de código e nome — e permanece assim.
4. Admin digita um novo código + nome e clica "Iniciar Sorteio" → novo sorteio é criado com sucesso.
5. Clicar em `refresh-cw` continua funcionando normalmente (recarrega dados do sorteio focado).
6. Navegar para outra tab e voltar para a tela faz a tela recarregar normalmente (useFocusEffect ainda roda em focus).
