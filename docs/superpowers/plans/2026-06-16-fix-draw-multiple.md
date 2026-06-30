# Fix: Múltiplos Sorteios ao Vivo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir 4 bugs que surgem ao criar/usar 2+ sorteios ao vivo simultaneamente.

**Architecture:** Bugs são todos de referência de dados incorreta. Bug A e B: `executeDrawPrizeLive` e `handleReloadDataDrawerPrizeLive` chamam `getActiveDrawPrizeLive()` (retorna o 1° sorteio ativo) em vez de `getDrawPrizeLiveById(drawerPrizeLiveId)` (o sorteio focado). Bug C: `handleShowWinners` no cliente chama `.toDate()` em objetos que já são `Date`. Bug D: `isWinner` em Parabéns chama `.includes(uid)` em array de objetos (sempre `false`). Feature: indicados já salvos devem aparecer cinza no Parabéns.

**Tech Stack:** React Native, Firebase Firestore, Node test runner (`node --test`)

---

## File Map

- Modify: `src/pages/Admin/DrawPrizeLive/index.jsx` (bugs A + B)
- Modify: `src/pages/DrawerPrizeLiveClient/index.jsx` (bug C)
- Modify: `src/pages/Admin/Parabens/index.jsx` (bug D + feature gray-out)
- Modify: `src/pages/Admin/Parabens/styles.js` (feature gray-out styles)
- Create: `src/utils/safeToDate.cjs` (utility para bug C)
- Create: `src/utils/isWinnerInDraw.cjs` (utility para bug D)
- Create: `tests/safeToDate.test.cjs`
- Create: `tests/isWinnerInDraw.test.cjs`

---

### Task 1: Bug A — executeDrawPrizeLive usa o sorteio errado

**Contexto:** Na linha 515 de `DrawPrizeLive/index.jsx`, `executeDrawPrizeLive` chama `getActiveDrawPrizeLive()`, que retorna o **primeiro** sorteio ativo do Firestore — não necessariamente o sorteio focado. Com 2 sorteios ativos, sorteia os participantes errados.

**Files:**
- Modify: `src/pages/Admin/DrawPrizeLive/index.jsx:511-585`

- [ ] **Step 1: Localizar o trecho com bug**

Abra `src/pages/Admin/DrawPrizeLive/index.jsx` e encontre `executeDrawPrizeLive` (~linha 511). O trecho problemático:

```js
const responseActiveDrawPrizeLive = await getActiveDrawPrizeLive();
const previousWinners = responseActiveDrawPrizeLive.data.winners ?? []
const usersWinner = []

const response = await getDataUserByIds(
    responseActiveDrawPrizeLive.data.participants,
)
```

- [ ] **Step 2: Aplicar o fix — usar drawerPrizeLiveId em vez de getActiveDrawPrizeLive**

Substituir o bloco acima (dentro de `executeDrawPrizeLive`) por:

```js
const responseActiveDrawPrizeLive = await getDrawPrizeLiveById(drawerPrizeLiveId);
if (responseActiveDrawPrizeLive.error) {
    Toast.show({ type: "error", text1: "Erro ao carregar sorteio. Tente novamente." });
    setLoadingInitDrawPrize(false);
    return;
}
const previousWinners = responseActiveDrawPrizeLive.data.winners ?? []
const usersWinner = []

const response = await getDataUserByIds(
    responseActiveDrawPrizeLive.data.participants,
)
```

- [ ] **Step 3: Verificar que `getDrawPrizeLiveById` já está importado no topo do arquivo**

```js
import {
    // ... outros imports já existentes ...
    getDrawPrizeLiveById,
    // ...
} from "../../../controllers/DrawPrizes/live";
```

Se não estiver, adicionar ao bloco de imports existente.

- [ ] **Step 4: Verificar manualmente (não há teste automatizado para esta função — ela chama Firebase direto)**

Criar 2 sorteios ativos no app. Focar no sorteio B. Clicar "Sortear". Confirmar que os participantes sorteados são do sorteio B, não do A.

---

### Task 2: Bug B — handleReloadDataDrawerPrizeLive usa o sorteio errado

**Contexto:** Na linha ~590 de `DrawPrizeLive/index.jsx`, `handleReloadDataDrawerPrizeLive` também chama `getActiveDrawPrizeLive()`. Ao recarregar, sobrescreve o estado com dados do primeiro sorteio ativo, não do focado.

**Files:**
- Modify: `src/pages/Admin/DrawPrizeLive/index.jsx:587-614`

- [ ] **Step 1: Localizar `handleReloadDataDrawerPrizeLive`**

Encontrar (~linha 587):
```js
const handleReloadDataDrawerPrizeLive = async () => {
    setLoadingReloadDataDrawerPrizeLive(true);

    const [response] = await Promise.all([
        getActiveDrawPrizeLive(),
        loadActiveDraws(),
    ]);
```

- [ ] **Step 2: Aplicar o fix**

Substituir por:
```js
const handleReloadDataDrawerPrizeLive = async () => {
    setLoadingReloadDataDrawerPrizeLive(true);

    const [focusedResponse] = await Promise.all([
        getDrawPrizeLiveById(drawerPrizeLiveId),
        loadActiveDraws(),
    ]);

    if (!focusedResponse.error) {
        const response = focusedResponse;
        setDrawerCodeFixed(response.data.code);
        setDrawerNameFixed(response.data.name ?? response.data.names?.[0] ?? "");
        setDrawerThemeFixed(response.data.theme ?? "");
        setDrawerPrizeLiveId(response.data.id);
        setParticipants(response.data?.participants ?? []);
        setWinners(response.data?.winners ?? []);
        setCountPrizes(response.data?.participants?.length > 0 ? 1 : 0);

        Toast.show({ type: "success", text1: "Sorteio atualizado!" });
    } else {
        Toast.show({
            type: "error",
            text1: "Erro ao atualizar os dados do sorteio, tente novamente em instantes!",
        });
    }

    setLoadingReloadDataDrawerPrizeLive(false);
};
```

- [ ] **Step 3: Remover a referência antiga ao `response` do bloco `if (!response.error)` que existia**

Confirme que o bloco antigo foi completamente substituído (nenhuma referência a `getActiveDrawPrizeLive()` deve restar em `handleReloadDataDrawerPrizeLive`).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Admin/DrawPrizeLive/index.jsx
git commit -m "fix: use focused draw id in executeDrawPrizeLive and reload (fixes multi-draw bug)"
```

---

### Task 3: Utility safeToDate + Bug C — crash no cliente ao ver ganhadores

**Contexto:** Em `DrawerPrizeLiveClient/index.jsx` linha ~149, `handleShowWinners` chama `item.createdAt.toDate()` em todos os winners. Winners são armazenados já como `Date` (JS), não como `Timestamp` do Firestore. Resultado: crash `TypeError: item.createdAt.toDate is not a function` ao clicar "Ver ganhadores" do sorteio B.

**Files:**
- Create: `src/utils/safeToDate.cjs`
- Create: `tests/safeToDate.test.cjs`
- Modify: `src/pages/DrawerPrizeLiveClient/index.jsx:148-158`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/safeToDate.test.cjs`:
```js
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { safeToDate } = require("../src/utils/safeToDate.cjs");

test("converte Firestore Timestamp via .toDate()", () => {
    const ts = { toDate: () => new Date("2024-01-15T10:00:00Z") };
    assert.deepEqual(safeToDate(ts), new Date("2024-01-15T10:00:00Z"));
});

test("retorna JS Date diretamente sem converter", () => {
    const d = new Date("2024-06-01");
    assert.strictEqual(safeToDate(d), d);
});

test("retorna null para null", () => {
    assert.strictEqual(safeToDate(null), null);
});

test("retorna null para undefined", () => {
    assert.strictEqual(safeToDate(undefined), null);
});

test("retorna null se .toDate() não existe e valor não é Date", () => {
    assert.strictEqual(safeToDate("not a date"), null);
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```bash
node --test tests/safeToDate.test.cjs
```

Esperado: `Error: Cannot find module '../src/utils/safeToDate.cjs'`

- [ ] **Step 3: Criar `src/utils/safeToDate.cjs`**

```js
"use strict";

/**
 * Converte um valor para Date, tolerando Firestore Timestamp, JS Date, ou null/undefined.
 */
const safeToDate = (val) => {
    if (val == null) return null;
    if (typeof val.toDate === "function") return val.toDate();
    if (val instanceof Date) return val;
    return null;
};

module.exports = { safeToDate };
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

```bash
node --test tests/safeToDate.test.cjs
```

Esperado: todos os 5 testes passando.

- [ ] **Step 5: Aplicar o fix em DrawerPrizeLiveClient**

Em `src/pages/DrawerPrizeLiveClient/index.jsx`, localizar `handleShowWinners` (~linha 148):

```js
const handleShowWinners = (winners) => {
    const fixWinners = winners.map((item) => ({
        ...item,
        createdAt: item.createdAt.toDate(),
        updatedAt: item.updatedAt.toDate(),
    }));

    navigation.navigate(dataRoutes.admin.usersList, {
        dataListUsers: fixWinners,
        noActions: true,
    });
};
```

Substituir por (inline, sem import do .cjs — React Native não suporta .cjs direto):

```js
const handleShowWinners = (winners) => {
    const safeDate = (val) => {
        if (val == null) return null;
        if (typeof val.toDate === "function") return val.toDate();
        if (val instanceof Date) return val;
        return null;
    };

    const fixWinners = winners.map((item) => ({
        ...item,
        createdAt: safeDate(item.createdAt),
        updatedAt: safeDate(item.updatedAt),
    }));

    navigation.navigate(dataRoutes.admin.usersList, {
        dataListUsers: fixWinners,
        noActions: true,
    });
};
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/safeToDate.cjs tests/safeToDate.test.cjs src/pages/DrawerPrizeLiveClient/index.jsx
git commit -m "fix: safe date conversion in handleShowWinners (fixes crash with 2 active draws)"
```

---

### Task 4: Utility isWinnerInDraw + Bug D — isWinner sempre false no Parabéns

**Contexto:** Em `Parabens/index.jsx` linha ~163, `isWinner` é calculado como:
```js
const isWinner = (draw.winners ?? []).includes(uid);
```
`draw.winners` é um array de **objetos** (não de strings), então `.includes(uid)` sempre retorna `false`. Nenhum participante fica marcado como vencedor, o badge "Vencedor" nunca aparece, e ex-vencedores podem ser re-selecionados.

**Files:**
- Create: `src/utils/isWinnerInDraw.cjs`
- Create: `tests/isWinnerInDraw.test.cjs`
- Modify: `src/pages/Admin/Parabens/index.jsx:163`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/isWinnerInDraw.test.cjs`:
```js
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isWinnerInDraw } = require("../src/utils/isWinnerInDraw.cjs");

const winners = [
    { uid: "uid-alice", email: "alice@test.com", name: "Alice" },
    { uid: "uid-bob", email: "bob@test.com", name: "Bob" },
];

test("retorna true quando uid bate com winner.uid", () => {
    assert.equal(isWinnerInDraw(winners, "uid-alice"), true);
});

test("retorna true quando uid bate com winner.email", () => {
    assert.equal(isWinnerInDraw(winners, "bob@test.com"), true);
});

test("retorna false quando uid não está na lista", () => {
    assert.equal(isWinnerInDraw(winners, "carol@test.com"), false);
});

test("retorna false para array vazio", () => {
    assert.equal(isWinnerInDraw([], "uid-alice"), false);
});

test("retorna false para null winners", () => {
    assert.equal(isWinnerInDraw(null, "uid-alice"), false);
});

test("retorna false para undefined winners", () => {
    assert.equal(isWinnerInDraw(undefined, "uid-alice"), false);
});
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
node --test tests/isWinnerInDraw.test.cjs
```

Esperado: `Error: Cannot find module '../src/utils/isWinnerInDraw.cjs'`

- [ ] **Step 3: Criar `src/utils/isWinnerInDraw.cjs`**

```js
"use strict";

/**
 * Verifica se um uid está na lista de winners de um sorteio.
 * winners é array de objetos { uid, email, ... }, não array de strings.
 */
const isWinnerInDraw = (winners, uid) => {
    if (!Array.isArray(winners) || !uid) return false;
    return winners.some((w) => w.uid === uid || w.email === uid);
};

module.exports = { isWinnerInDraw };
```

- [ ] **Step 4: Rodar para confirmar que passa**

```bash
node --test tests/isWinnerInDraw.test.cjs
```

Esperado: todos os 6 testes passando.

- [ ] **Step 5: Aplicar o fix no Parabéns**

Em `src/pages/Admin/Parabens/index.jsx`, dentro do map de `visibleParticipants` (~linha 160), localizar:

```js
const isWinner = (draw.winners ?? []).includes(uid);
```

Substituir por (inline, sem import do .cjs):

```js
const isWinner = (draw.winners ?? []).some(
    (w) => w.uid === uid || w.email === uid,
);
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/isWinnerInDraw.cjs tests/isWinnerInDraw.test.cjs src/pages/Admin/Parabens/index.jsx
git commit -m "fix: correct isWinner check in Parabens (winners is array of objects, not ids)"
```

---

### Task 5: Feature — Participantes já indicados ficam cinza no Parabéns

**Contexto:** Quando o admin abre o Parabéns após já ter salvado indicados, os participantes indicados aparecem com checkbox marcado — mas visualmente idênticos aos "recém-selecionados nesta sessão". O admin não sabe quem já foi processado.

**Solução:** Rastrear `savedIndicated` como um `useRef` (não muda com toggle), separado do `selected` (muda). Participantes em `savedIndicated` recebem fundo cinza + badge "Indicado". Ainda são clicáveis (para corrigir erros).

**Files:**
- Modify: `src/pages/Admin/Parabens/index.jsx`
- Modify: `src/pages/Admin/Parabens/styles.js`

- [ ] **Step 1: Adicionar o import de `useRef` no Parabéns**

Em `src/pages/Admin/Parabens/index.jsx`, garantir que `useRef` está no import do React:

```js
import { useCallback, useMemo, useRef, useState } from "react";
```

- [ ] **Step 2: Adicionar os novos styled-components ao styles.js**

Em `src/pages/Admin/Parabens/styles.js`, adicionar ao final do arquivo:

```js
export const IndicadoBadge = styled.View`
    background-color: #e8e8e8;
    border-radius: 6px;
    padding: 1px 7px;
    margin-left: 8px;
`;

export const IndicadoBadgeText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    font-weight: 700;
    color: #888;
`;
```

- [ ] **Step 3: Adicionar `isAlreadySaved` ao `ParticipantItem` styled-component**

Em `src/pages/Admin/Parabens/styles.js`, localizar `ParticipantItem`:

```js
export const ParticipantItem = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 11px 16px;
    border-top-width: 1px;
    border-top-color: #f0f0f0;
    background-color: ${({ selected }) => (selected ? "#fff8f5" : "#fff")};
    opacity: ${({ isWinner }) => (isWinner ? 0.65 : 1)};
`;
```

Substituir por:
```js
export const ParticipantItem = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 11px 16px;
    border-top-width: 1px;
    border-top-color: #f0f0f0;
    background-color: ${({ selected, isAlreadySaved }) =>
        isAlreadySaved ? "#f5f5f5" : selected ? "#fff8f5" : "#fff"};
    opacity: ${({ isWinner }) => (isWinner ? 0.65 : 1)};
`;
```

- [ ] **Step 4: Atualizar o import no DrawSection para incluir os novos badges**

Em `src/pages/Admin/Parabens/index.jsx`, adicionar ao bloco de imports dos styled-components:

```js
import {
    // ... todos os existentes ...
    IndicadoBadge,
    IndicadoBadgeText,
} from "./styles";
```

- [ ] **Step 5: Adicionar `savedIndicated` ref no DrawSection**

Em `src/pages/Admin/Parabens/index.jsx`, dentro do componente `DrawSection`, após a linha:
```js
const [searchQuery, setSearchQuery] = useState("");
```

Adicionar:
```js
const savedIndicated = useRef(new Set(draw.indicatedParticipants ?? []));
```

- [ ] **Step 6: Atualizar handleSave para sincronizar savedIndicated**

Localizar `handleSave`:
```js
const handleSave = async () => {
    setSaving(true);
    const ids = Array.from(selected);
    const ok = await saveIndicatedParticipants(draw.id, ids);
    setSaving(false);
    if (ok) {
        Toast.show({ type: "success", text1: "Indicados salvos com sucesso!" });
        onSaved?.();
    } else {
        Toast.show({ type: "error", text1: "Erro ao salvar indicados" });
    }
};
```

Substituir por:
```js
const handleSave = async () => {
    setSaving(true);
    const ids = Array.from(selected);
    const ok = await saveIndicatedParticipants(draw.id, ids);
    setSaving(false);
    if (ok) {
        savedIndicated.current = new Set(ids);
        Toast.show({ type: "success", text1: "Indicados salvos com sucesso!" });
        onSaved?.();
    } else {
        Toast.show({ type: "error", text1: "Erro ao salvar indicados" });
    }
};
```

- [ ] **Step 7: Atualizar o render do ParticipantItem para usar isAlreadySaved e mostrar badge**

Localizar o bloco do map de `visibleParticipants`, onde `ParticipantItem` é renderizado:

```js
const uid = p.uid || p.email || p.cpf;
const isSelected = selected.has(uid);
const isWinner = (draw.winners ?? []).some(   // já corrigido na Task 4
    (w) => w.uid === uid || w.email === uid,
);
return (
    <ParticipantItem
        key={uid}
        selected={isSelected}
        isWinner={isWinner}
        onPress={() => !isWinner && toggleParticipant(uid)}
        activeOpacity={isWinner ? 1 : 0.7}
    >
```

Substituir por:
```js
const uid = p.uid || p.email || p.cpf;
const isSelected = selected.has(uid);
const isAlreadySaved = savedIndicated.current.has(uid);
const isWinner = (draw.winners ?? []).some(
    (w) => w.uid === uid || w.email === uid,
);
return (
    <ParticipantItem
        key={uid}
        selected={isSelected && !isAlreadySaved}
        isWinner={isWinner}
        isAlreadySaved={isAlreadySaved && !isWinner}
        onPress={() => !isWinner && toggleParticipant(uid)}
        activeOpacity={isWinner ? 1 : 0.7}
    >
```

- [ ] **Step 8: Adicionar o badge "Indicado" no corpo do ParticipantItem**

Localizar o bloco onde `WinnerBadge` e `ShareWinnerButton` são renderizados:
```js
{isWinner && (
    <WinnerBadge>
        <WinnerBadgeText>Vencedor</WinnerBadgeText>
    </WinnerBadge>
)}
```

Adicionar ANTES desse bloco:
```js
{isAlreadySaved && !isWinner && (
    <IndicadoBadge>
        <IndicadoBadgeText>Indicado</IndicadoBadgeText>
    </IndicadoBadge>
)}
```

- [ ] **Step 9: Verificar visualmente**

Abrir Parabéns com um sorteio que já tem `indicatedParticipants` salvos. Confirmar:
- Participantes já indicados aparecem com fundo cinza claro e badge "Indicado"
- Participantes vencedores aparecem com badge "Vencedor" e opacity reduzida
- Participantes normais aparecem com fundo branco/laranja ao selecionar

- [ ] **Step 10: Commit**

```bash
git add src/pages/Admin/Parabens/index.jsx src/pages/Admin/Parabens/styles.js
git commit -m "feat: gray out already-saved indicated participants in Parabens"
```

---

## Self-Review

**Spec coverage:**
- ✅ Erro quando fizer dois sorteios → Tasks 1 + 2
- ✅ Clicou sorteio A/B ver ganhadores corretos → Task 3 (crash fix libera o fluxo)
- ✅ Tirar da lista quem já ganhou → Task 4 (isWinner fix) + já existia `buildEligibleParticipants`
- ✅ Ficar cinza quem já clicou para ganhar no Parabéns → Task 5

**Placeholder scan:** Nenhum placeholder encontrado — todos os steps têm código real.

**Type consistency:** `safeDate` inline em DrawerPrizeLiveClient, `isWinnerInDraw` inline em Parabens — nomes consistentes com os .cjs utilitários criados.
