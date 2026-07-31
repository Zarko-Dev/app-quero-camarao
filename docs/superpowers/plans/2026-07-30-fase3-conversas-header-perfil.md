# Fase 3 — Conversas + Cabeçalho Rico + Perfil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tela "Conversas" com abas Ativas/Não lidas/Encerradas e cards ricos (cidade + resumo do anúncio + slot de avaliação, não lidas primeiro), cabeçalho do chat com 3 linhas + menu de 3 pontos, e tela de perfil público.

**Architecture:** `sendChatMessage` denormaliza `publicationLocation`/`publicationSummary` (e `status: "active"` na criação) no doc do chat; a lista lê esses campos com fallback pro layout antigo. Dois utils puros novos (`publicationSummary`, `chatListSort`) + conversão do `formatKilo` para CJS testável. Perfil público é tela nova (`UserProfile`) lendo `users/{id}` + `getUserPublications` existente.

**Tech Stack:** React Native/Expo, styled-components, Firestore client SDK. Testes `node --test tests/*.test.cjs` (NUNCA `yarn test:unit`). Baseline: 140 testes, 137 pass, 3 falhas pré-existentes (winner-share).

**Spec:** `docs/superpowers/specs/2026-07-30-fase3-conversas-header-perfil-design.md`

---

### Task 1: `formatKilo` → CJS + teste

**Files:**
- Modify: `src/utils/formatKilo.js`
- Test: `tests/formatKilo.test.cjs`

Comportamento atual (preservar exatamente, apenas robustecer a entrada com `String()`): valor com vírgula vira ponto; se contém ponto, retorna como está; senão formata pt-BR.

- [ ] **Step 1: Teste**

```js
// tests/formatKilo.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { formatKilo } = require("../src/utils/formatKilo");

test("inteiro em string ganha separador de milhar pt-BR", () => {
    assert.equal(formatKilo("2000"), "2.000");
    assert.equal(formatKilo("1500"), "1.500");
});

test("valor com ponto é retornado como está", () => {
    assert.equal(formatKilo("1.5"), "1.5");
});

test("vírgula vira ponto e é retornado como está", () => {
    assert.equal(formatKilo("1,5"), "1.5");
});

test("número (não-string) não quebra", () => {
    assert.equal(formatKilo(2000), "2.000");
});
```

- [ ] **Step 2:** `node --test tests/formatKilo.test.cjs` → FAIL (`export const` não é `require`-ável / formatKilo undefined)

- [ ] **Step 3: Converter para CJS** — arquivo completo:

```js
// src/utils/formatKilo.js
const formatKilo = (value) => {
    const formatValue = String(value ?? "").replace(",", ".");

    if (formatValue.indexOf(".") !== -1) {
        return formatValue;
    }

    return Number(formatValue).toLocaleString("pt-BR");
};

module.exports = { formatKilo };
```

(Os 6 componentes que fazem `import { formatKilo }` continuam funcionando via interop Babel/Metro — mesmo padrão de `chatReadStatus`.)

- [ ] **Step 4:** `node --test tests/formatKilo.test.cjs` → PASS (4 testes). Rodar também a suíte inteira para garantir nada quebrou.

- [ ] **Step 5:** `npx eslint src/utils/formatKilo.js` (limpo) e commit:

```bash
git add src/utils/formatKilo.js tests/formatKilo.test.cjs
git commit -m "refactor: convert formatKilo to testable CJS with input coercion"
```

---

### Task 2: `buildPublicationSummary` (TDD)

**Files:**
- Create: `src/utils/publicationSummary.js`
- Test: `tests/publicationSummary.test.cjs`

- [ ] **Step 1: Teste**

```js
// tests/publicationSummary.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { buildPublicationSummary } = require("../src/utils/publicationSummary");

test("um item vira 'Xg • Ykg'", () => {
    assert.equal(buildPublicationSummary([{ grammage: 14, kilo: "1800" }]), "14g • 1.800kg");
});

test("vários itens separados por ' · '", () => {
    assert.equal(
        buildPublicationSummary([
            { grammage: 30, kilo: "2000" },
            { grammage: 28, kilo: "1500" },
        ]),
        "30g • 2.000kg · 28g • 1.500kg",
    );
});

test("kilo com ponto/vírgula preservado", () => {
    assert.equal(buildPublicationSummary([{ grammage: 10, kilo: "1,5" }]), "10g • 1.5kg");
});

test("vazio/ausente/malformado vira string vazia", () => {
    assert.equal(buildPublicationSummary([]), "");
    assert.equal(buildPublicationSummary(null), "");
    assert.equal(buildPublicationSummary(undefined), "");
    assert.equal(buildPublicationSummary("nope"), "");
});

test("itens sem grammage são ignorados", () => {
    assert.equal(
        buildPublicationSummary([{ kilo: "100" }, { grammage: 20, kilo: "500" }]),
        "20g • 500kg",
    );
});
```

- [ ] **Step 2:** FAIL esperado.

- [ ] **Step 3: Implementar**

```js
// src/utils/publicationSummary.js
const { formatKilo } = require("./formatKilo");

const buildPublicationSummary = (shrimps) => {
    if (!Array.isArray(shrimps)) return "";

    return shrimps
        .filter((s) => s && s.grammage != null)
        .map((s) => `${s.grammage}g • ${formatKilo(s.kilo)}kg`)
        .join(" · ");
};

module.exports = { buildPublicationSummary };
```

- [ ] **Step 4:** PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/utils/publicationSummary.js tests/publicationSummary.test.cjs
git commit -m "feat: add buildPublicationSummary util (grammage/kilo list)"
```

---

### Task 3: `chatListSort` (isUnread + sortChatsUnreadFirst) (TDD)

**Files:**
- Create: `src/utils/chatListSort.js`
- Test: `tests/chatListSort.test.cjs`

- [ ] **Step 1: Teste**

```js
// tests/chatListSort.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { isUnread, sortChatsUnreadFirst } = require("../src/utils/chatListSort");

const ts = (ms) => ({ toMillis: () => ms });

test("isUnread: sem lastSeen é não lida", () => {
    assert.equal(isUnread({ lastMessage: "oi", lastMessageAt: ts(100), lastSeenAt: {} }, "u"), true);
});

test("isUnread: mensagem depois do lastSeen é não lida", () => {
    assert.equal(
        isUnread({ lastMessage: "oi", lastMessageAt: ts(200), lastSeenAt: { u: ts(100) } }, "u"),
        true,
    );
});

test("isUnread: vista depois da mensagem é lida", () => {
    assert.equal(
        isUnread({ lastMessage: "oi", lastMessageAt: ts(100), lastSeenAt: { u: ts(200) } }, "u"),
        false,
    );
});

test("isUnread: sem lastMessage é lida", () => {
    assert.equal(isUnread({ lastMessageAt: ts(100), lastSeenAt: {} }, "u"), false);
});

test("sortChatsUnreadFirst: não lidas primeiro, depois data desc", () => {
    const read1 = { id: "r1", lastMessage: "a", lastMessageAt: ts(500), lastSeenAt: { u: ts(900) } };
    const read2 = { id: "r2", lastMessage: "b", lastMessageAt: ts(300), lastSeenAt: { u: ts(900) } };
    const unread1 = { id: "u1", lastMessage: "c", lastMessageAt: ts(400), lastSeenAt: {} };
    const unread2 = { id: "u2", lastMessage: "d", lastMessageAt: ts(200), lastSeenAt: {} };

    const sorted = sortChatsUnreadFirst([read2, unread2, read1, unread1], "u");
    assert.deepEqual(sorted.map((c) => c.id), ["u1", "u2", "r1", "r2"]);
});

test("sortChatsUnreadFirst: não muta o array original e aceita vazio", () => {
    const arr = [];
    assert.deepEqual(sortChatsUnreadFirst(arr, "u"), []);
    const one = [{ id: "x", lastMessage: "a", lastMessageAt: ts(1), lastSeenAt: {} }];
    const out = sortChatsUnreadFirst(one, "u");
    assert.notEqual(out, one);
});
```

- [ ] **Step 2:** FAIL esperado.

- [ ] **Step 3: Implementar**

```js
// src/utils/chatListSort.js
const isUnread = (chat, safeId) => {
    const lastSeen = chat.lastSeenAt?.[safeId];
    const lastMsg = chat.lastMessageAt;
    if (!lastMsg || !chat.lastMessage) return false;
    if (!lastSeen) return true;
    const seenMs = lastSeen?.toMillis?.() ?? 0;
    const msgMs = lastMsg?.toMillis?.() ?? 0;
    return msgMs > seenMs;
};

const sortChatsUnreadFirst = (chats, safeId) => [...chats].sort((a, b) => {
    const unreadA = isUnread(a, safeId);
    const unreadB = isUnread(b, safeId);
    if (unreadA !== unreadB) return unreadA ? -1 : 1;
    const ta = a.lastMessageAt?.toMillis?.() ?? 0;
    const tb = b.lastMessageAt?.toMillis?.() ?? 0;
    return tb - ta;
});

module.exports = { isUnread, sortChatsUnreadFirst };
```

- [ ] **Step 4:** PASS (6 testes).

- [ ] **Step 5: Commit**

```bash
git add src/utils/chatListSort.js tests/chatListSort.test.cjs
git commit -m "feat: add chatListSort util (isUnread + unread-first ordering)"
```

---

### Task 4: Denormalização no controller

**Files:**
- Modify: `src/controllers/Chat/index.js` (`sendChatMessage` apenas)

- [ ] **Step 1:** Params novos após `fileSize = null,`:

```js
    publicationLocation = "",
    publicationSummary = "",
```

- [ ] **Step 2:** No `setDoc` (chat novo), adicionar após `publicationTitle,`:

```js
                publicationLocation,
                publicationSummary,
                status: "active",
```

- [ ] **Step 3:** No `updateDoc` (chat existente), adicionar após `lastMessageSenderId: senderId,` (só grava quando não-vazio, auto-corrigindo chats antigos; `status` NÃO entra aqui):

```js
                ...(publicationLocation ? { publicationLocation } : {}),
                ...(publicationSummary ? { publicationSummary } : {}),
```

- [ ] **Step 4:** Lint (baseline 3 erros, nada novo) + `node --test tests/*.test.cjs` (baseline) + commit:

```bash
git add src/controllers/Chat/index.js
git commit -m "feat: denormalize publication location/summary and status on chat doc"
```

---

### Task 5: Rota e tela `UserProfile`

**Files:**
- Modify: `src/routes/dataRoutes.js` (nova rota)
- Modify: `src/routes/index.jsx` (registrar Screen)
- Create: `src/pages/UserProfile/index.jsx`
- Create: `src/pages/UserProfile/styles.js`

- [ ] **Step 1:** Em `dataRoutes.js`, após `myChats: "My Chats",`:

```js
    userProfile: "User Profile",
```

- [ ] **Step 2:** Em `routes/index.jsx`: import `import { UserProfile } from "../pages/UserProfile";` junto aos demais; registrar após o Screen de `myChats`:

```jsx
            <Screen
                name={dataRoutes.userProfile}
                component={UserProfile}
                options={{ headerShown: false }}
            />
```

- [ ] **Step 3:** `src/pages/UserProfile/styles.js`:

```js
import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f4f8fb;
`;

export const ScreenHeader = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: #fff;
    border-bottom-width: 1px;
    border-bottom-color: #e8eef4;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 800;
    color: #36536e;
`;

export const Content = styled.View`
    align-items: center;
    padding: 32px 24px;
`;

export const BigAvatar = styled.View`
    width: 88px;
    height: 88px;
    border-radius: 44px;
    background-color: #f55b1f;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
`;

export const BigAvatarText = styled(Text)`
    color: #fff;
    font-weight: 800;
    font-size: ${({ theme }) => theme.size.fontSize(32)};
`;

export const ProfileName = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: 800;
    color: #1e3a4f;
    text-align: center;
`;

export const RatingText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #b0a898;
    margin-top: 6px;
`;

export const InfoRow = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #5f7b94;
    margin-top: 12px;
    text-align: center;
`;

export const ErrorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #8fa3b2;
    text-align: center;
    margin-top: 40px;
`;
```

- [ ] **Step 4:** `src/pages/UserProfile/index.jsx`:

```jsx
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { getUserPublications } from "../../controllers/Publication/getUserPublications";
import {
    BigAvatar,
    BigAvatarText,
    Container,
    Content,
    ErrorText,
    HeaderTitle,
    InfoRow,
    ProfileName,
    RatingText,
    ScreenHeader,
} from "./styles";

const formatMemberSince = (createdAt) => {
    try {
        const d = createdAt?.toDate?.() ?? new Date(createdAt);
        if (Number.isNaN(d.getTime())) return "";
        const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        return `No Quero Camarão desde ${label}`;
    } catch {
        return "";
    }
};

export const UserProfile = ({ route, navigation }) => {
    const { userId, userName } = route.params ?? {};

    const [profile, setProfile] = useState(null);
    const [publicationsCount, setPublicationsCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setFailed(true);
            return;
        }
        getDoc(doc(firestore, models.users, userId))
            .then((snap) => {
                if (snap.exists()) setProfile(snap.data());
                else setFailed(true);
            })
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        if (!userId || profile?.userType !== "productor") return;
        getUserPublications(userId)
            .then((result) => {
                if (!result.error && Array.isArray(result.data)) {
                    setPublicationsCount(result.data.length);
                }
            })
            .catch(() => {});
    }, [userId, profile?.userType]);

    const displayName = profile?.name || userName || "Usuário";
    const initial = (displayName?.[0] ?? "?").toUpperCase();
    const city = profile?.address?.city || profile?.city || "";
    const state = profile?.address?.state || profile?.state || "";
    const memberSince = profile?.createdAt ? formatMemberSince(profile.createdAt) : "";

    return (
        <Container>
            <ScreenHeader>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <HeaderTitle>Perfil</HeaderTitle>
            </ScreenHeader>
            {loading ? (
                <ActivityIndicator color="#f55b1f" style={{ flex: 1 }} />
            ) : failed ? (
                <ErrorText>Perfil indisponível</ErrorText>
            ) : (
                <Content>
                    <BigAvatar>
                        <BigAvatarText>{initial}</BigAvatarText>
                    </BigAvatar>
                    <ProfileName>{displayName}</ProfileName>
                    <RatingText>⭐ Sem avaliações</RatingText>
                    {city ? (
                        <InfoRow>{`📍 ${city}${state ? `/${state}` : ""}`}</InfoRow>
                    ) : null}
                    {memberSince ? <InfoRow>{memberSince}</InfoRow> : null}
                    {publicationsCount != null && publicationsCount > 0 ? (
                        <InfoRow>{`🦐 ${publicationsCount} anúncio${publicationsCount > 1 ? "s" : ""}`}</InfoRow>
                    ) : null}
                </Content>
            )}
        </Container>
    );
};
```

(Nota: um ternário aninhado no JSX `loading ? ... : failed ? ... : ...` pode disparar `no-nested-ternary` — se disparar, reestruturar com early-ish rendering: extrair `renderBody()` com if/else em vez de disable comment.)

- [ ] **Step 5:** Lint nos 4 arquivos (nada novo) + commit:

```bash
git add src/routes/dataRoutes.js src/routes/index.jsx src/pages/UserProfile/index.jsx src/pages/UserProfile/styles.js
git commit -m "feat: public user profile screen with rating slot and member info"
```

---

### Task 6: Cabeçalho rico do chat + menu 3 pontos + envio denormalizado

**Files:**
- Modify: `src/pages/PublicationChat/index.jsx`
- Modify: `src/pages/PublicationChat/styles.js`

- [ ] **Step 1:** `styles.js` — novos styled components após `HeaderSubtitle`:

```js
export const HeaderRating = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    color: #b0a898;
    margin-top: 1px;
`;

export const HeaderTouchable = styled.TouchableOpacity`
    flex: 1;
    flex-direction: row;
    align-items: center;
`;

export const MenuButton = styled.TouchableOpacity`
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
`;
```

- [ ] **Step 2:** `index.jsx` — imports: adicionar `HeaderRating`, `HeaderTouchable`, `MenuButton` ao import de `./styles` (ordem alfabética); `import { buildPublicationSummary } from "../../utils/publicationSummary";` após o import de `formatFileSize`.

- [ ] **Step 3:** Derivar o resumo uma vez, antes do `headerName` (perto do fim do componente):

```js
    const publicationSummary = buildPublicationSummary(publicationData?.shrimps);
```

- [ ] **Step 4:** Todos os 4 pontos de `sendChatMessage` da tela (handleSend, pickAndSendImage, stopRecording/áudio, sendDocument) e o auto-send ganham, junto de `publicationTitle`:

```js
            publicationLocation: publicationData?.location || "",
            publicationSummary,
```

- [ ] **Step 5:** Novo handler do menu (após `sendDocument`):

```js
    const openHeaderMenu = () => {
        const details = [
            publicationData?.location ? `📍 ${publicationData.location}` : null,
            publicationSummary ? `🦐 ${publicationSummary}` : null,
        ].filter(Boolean).join("\n");
        const body = details || "Sem dados do anúncio";
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ["Cancelar", "Ver dados do anúncio"], cancelButtonIndex: 0 },
                (idx) => {
                    if (idx === 1) Alert.alert("Anúncio", body);
                },
            );
        } else {
            Alert.alert("Anúncio", body, [{ text: "OK" }], { cancelable: true });
        }
    };
```

- [ ] **Step 6:** Header JSX vira (substituindo o bloco `<Header>...</Header>` atual — mantém a seta, envolve avatar+infos num touchable pro perfil, adiciona rating e menu):

```jsx
            <Header>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <HeaderTouchable
                    activeOpacity={0.7}
                    onPress={() => {
                        if (otherUserId) {
                            navigation.navigate(dataRoutes.userProfile, {
                                userId: otherUserId,
                                userName: headerName,
                            });
                        }
                    }}
                >
                    <Avatar>
                        <AvatarText>{(headerName?.[0] ?? "?").toUpperCase()}</AvatarText>
                    </Avatar>
                    <HeaderInfo>
                        <HeaderTitle numberOfLines={1}>
                            {headerName}
                        </HeaderTitle>
                        <HeaderRating>⭐ Sem avaliações</HeaderRating>
                        {(publicationData?.location || publicationSummary) ? (
                            <HeaderSubtitle numberOfLines={1}>
                                {[publicationData?.location, publicationSummary].filter(Boolean).join(" • ")}
                            </HeaderSubtitle>
                        ) : null}
                    </HeaderInfo>
                </HeaderTouchable>
                <MenuButton onPress={openHeaderMenu} activeOpacity={0.7}>
                    <Feather name="more-vertical" size={20} color="#36536e" />
                </MenuButton>
            </Header>
```

Import de `dataRoutes` já existe? Verificar — o arquivo NÃO importa `dataRoutes` hoje; adicionar `import { dataRoutes } from "../../routes/dataRoutes";` junto aos imports locais.

- [ ] **Step 7:** Lint (sem novos vs baseline ~25) + `node --test tests/*.test.cjs` (baseline) + commit:

```bash
git add src/pages/PublicationChat/index.jsx src/pages/PublicationChat/styles.js
git commit -m "feat: rich 3-line chat header with profile tap and overflow menu"
```

---

### Task 7: Tela Conversas — 3 abas + cards ricos + ordenação

**Files:**
- Modify: `src/pages/MyChats/index.jsx`
- Modify: `src/pages/MyChats/styles.js`

- [ ] **Step 1:** `styles.js` — novo styled após `ConvPub`:

```js
export const ConvRating = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    color: #b0a898;
    margin-top: 1px;
`;
```

- [ ] **Step 2:** `index.jsx`:

a) Imports: `import { isUnread, sortChatsUnreadFirst } from "../../utils/chatListSort";` (e REMOVER a função local `isUnread` do arquivo); adicionar `ConvRating` ao import de styles.

b) Título: `<HeaderTitle>Conversas</HeaderTitle>`.

c) Estado do filtro: default vira `"active"`; valores: `"active" | "unread" | "closed"`.

d) Derivações substituem `filteredChats`:

```js
    const activeChats = chats.filter((c) => c.status !== "closed");
    const closedChats = chats.filter((c) => c.status === "closed");
    const unreadTotal = activeChats.filter((c) => isUnread(c, safeId)).length;

    let tabChats = activeChats;
    if (filter === "unread") tabChats = activeChats.filter((c) => isUnread(c, safeId));
    if (filter === "closed") tabChats = closedChats;

    const filteredChats = sortChatsUnreadFirst(tabChats, safeId);
```

e) Abas (substituem as duas atuais):

```jsx
                <FilterTabsRow>
                    <FilterTab active={filter === "active"} onPress={() => setFilter("active")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "active"}>Ativas</FilterTabText>
                    </FilterTab>
                    <FilterTab active={filter === "unread"} onPress={() => setFilter("unread")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "unread"}>
                            Não lidas{unreadTotal > 0 ? ` (${unreadTotal})` : ""}
                        </FilterTabText>
                    </FilterTab>
                    <FilterTab active={filter === "closed"} onPress={() => setFilter("closed")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "closed"}>Encerradas</FilterTabText>
                    </FilterTab>
                </FilterTabsRow>
```

f) Estados vazios por aba (substitui o bloco `filteredChats.length === 0` atual):

```jsx
            ) : filteredChats.length === 0 ? (
                <EmptyWrap>
                    <Feather
                        name={filter === "closed" ? "archive" : "check-circle"}
                        size={48}
                        color="#c8d8e8"
                    />
                    <EmptyText>
                        {filter === "closed"
                            ? "Conversas encerradas aparecerão aqui"
                            : "Nenhuma conversa não lida"}
                    </EmptyText>
                </EmptyWrap>
            ) : (
```

g) Card — entre `<ConvName>` e `<ConvLastMsg>` (substituindo a linha `ConvPub` atual):

```jsx
                                    <ConvRating numberOfLines={1}>⭐ Sem avaliações</ConvRating>
                                    <ConvPub numberOfLines={1}>
                                        {item.publicationLocation || item.publicationSummary
                                            ? [
                                                item.publicationLocation ? `📍 ${item.publicationLocation}` : null,
                                                item.publicationSummary ? `🦐 ${item.publicationSummary}` : null,
                                            ].filter(Boolean).join(" · ")
                                            : `🦐 ${item.publicationTitle || "Publicação"}`}
                                    </ConvPub>
```

- [ ] **Step 3:** Lint (sem novos; o `no-nested-ternary` do bloco de estados vazios já tem disable na linha da cadeia atual — reaproveitar a mesma estrutura/disable existente) + testes (baseline) + commit:

```bash
git add src/pages/MyChats/index.jsx src/pages/MyChats/styles.js
git commit -m "feat: Conversas screen with active/unread/closed tabs and rich cards"
```

---

## Verificação manual

1. Lista: título "Conversas", 3 abas; não lidas no topo em todas; Encerradas vazia com texto próprio; card com ⭐ e 📍/🦐 (e fallback do título em chats antigos).
2. Mandar mensagem num chat antigo → card ganha cidade/resumo (auto-correção).
3. Header do chat: 3 linhas, toque no nome abre perfil, menu 3 pontos mostra dados do anúncio.
4. Perfil: produtor (com contagem), cliente (sem contagem), usuário inexistente ("Perfil indisponível"), voltar funciona.
