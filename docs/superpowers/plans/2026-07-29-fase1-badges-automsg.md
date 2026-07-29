# Fase 1 — Badges de Não Lidas + Trava da Mensagem Automática — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ícone de conversas da home em círculo verde com badge vermelho "99+", item "Conversas" no drawer com o mesmo contador, badge de não lidas no ícone do app no sistema (sync local + campo `badge` no push), e trava persistente `autoMessageSentAt` para a mensagem automática do botão CHAT.

**Architecture:** Um util puro (`formatUnreadBadge`) alimenta um componente compartilhado `UnreadBadge` usado no Header e no Drawer. Um componente sem UI (`BadgeSync`) dentro do Provider redux sincroniza `setBadgeCountAsync` com o contador em tempo real; o push de mensagem nova passa a carregar `badge` calculado por consulta pontual (`countUnreadChats`) no momento do envio. A trava da mensagem automática grava `autoMessageSentAt` no doc do chat e o guard do auto-send checa esse campo via o `onChatMeta` já existente.

**Tech Stack:** React Native (Expo), styled-components/native, redux (`useSelector`), Firebase Firestore client SDK, expo-notifications ~0.31, @react-navigation/drawer. Testes: `node --test tests/*.test.cjs` (NUNCA `yarn test:unit` — quebrado por lockfile neste ambiente).

**Spec:** `docs/superpowers/specs/2026-07-29-fase1-badges-automsg-design.md`

---

## Convenções do repo (leia antes)

- Utils puros testáveis usam `module.exports` (CJS) no fim do arquivo, consumidos via `import` no app (interop Babel/Metro). Exemplos: `src/utils/chatReadStatus.js`, `src/utils/drawEligibility.js`.
- Suíte de testes: `node --test tests/*.test.cjs` → baseline atual 125/128 passando (3 falhas pré-existentes não relacionadas em `sharingWinnerFix.test.cjs`/`winnerShareMessage.test.cjs`).
- Lint: cada arquivo tem baseline própria de erros pré-existentes; critério é "nenhum erro NOVO". Compare com `git show HEAD:<path>` lintado se em dúvida.
- **`src/pages/PublicationChat/index.jsx` tem hunks NÃO COMMITADOS do usuário** (gesto de travar gravação de áudio, `recordingGesture.cjs`). Não tocar nesses trechos; ao commitar o arquivo, esses hunks entram junto — isso é aceito pelo usuário (decisão em sessão anterior), apenas não os altere.
- Commits direto na branch `main` (autorizado pelo usuário).

---

### Task 1: Util `formatUnreadBadge` (TDD)

**Files:**
- Create: `src/utils/formatUnreadBadge.js`
- Test: `tests/formatUnreadBadge.test.cjs`

- [ ] **Step 1: Escrever o teste (falha — arquivo não existe)**

```js
// tests/formatUnreadBadge.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { formatUnreadBadge } = require("../src/utils/formatUnreadBadge");

test("retorna vazio para zero", () => {
    assert.equal(formatUnreadBadge(0), "");
});

test("retorna vazio para negativo", () => {
    assert.equal(formatUnreadBadge(-3), "");
});

test("retorna vazio para NaN/undefined/null", () => {
    assert.equal(formatUnreadBadge(NaN), "");
    assert.equal(formatUnreadBadge(undefined), "");
    assert.equal(formatUnreadBadge(null), "");
});

test("retorna o número como texto de 1 a 99", () => {
    assert.equal(formatUnreadBadge(1), "1");
    assert.equal(formatUnreadBadge(42), "42");
    assert.equal(formatUnreadBadge(99), "99");
});

test("retorna 99+ acima de 99", () => {
    assert.equal(formatUnreadBadge(100), "99+");
    assert.equal(formatUnreadBadge(1500), "99+");
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `node --test tests/formatUnreadBadge.test.cjs`
Expected: FAIL — `Cannot find module '../src/utils/formatUnreadBadge'`

- [ ] **Step 3: Implementar**

```js
// src/utils/formatUnreadBadge.js
const formatUnreadBadge = (count) => {
    const n = Number(count);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n > 99) return "99+";
    return String(n);
};

module.exports = { formatUnreadBadge };
```

- [ ] **Step 4: Rodar e confirmar 5 testes passando**

Run: `node --test tests/formatUnreadBadge.test.cjs`
Expected: PASS — 5 testes, 0 falhas

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatUnreadBadge.js tests/formatUnreadBadge.test.cjs
git commit -m "feat: add formatUnreadBadge util (1-99, 99+)"
```

---

### Task 2: Componente `UnreadBadge` + redesign do botão do Header

**Files:**
- Create: `src/components/UnreadBadge/index.jsx`
- Modify: `src/components/Header/index.jsx`
- Modify: `src/components/Header/styles.js`

- [ ] **Step 1: Criar o componente compartilhado**

```jsx
// src/components/UnreadBadge/index.jsx
import { Text, View } from "react-native";

import { formatUnreadBadge } from "../../utils/formatUnreadBadge";

export const UnreadBadge = ({ count, style }) => {
    const label = formatUnreadBadge(count);

    if (!label) return null;

    return (
        <View
            style={[
                {
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#e53935",
                    paddingHorizontal: 4,
                    alignItems: "center",
                    justifyContent: "center",
                },
                style,
            ]}
        >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                {label}
            </Text>
        </View>
    );
};
```

- [ ] **Step 2: Redesenhar `ChatButton` em `src/components/Header/styles.js`**

Troque os blocos `ChatButton` e `ChatBadge` atuais (fim do arquivo) por apenas:

```js
export const ChatButton = styled.TouchableOpacity`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: ${({ theme }) => theme.colors.green};
    justify-content: center;
    align-items: center;
`;
```

Remova o export `ChatBadge` inteiro (era o `Badge` do react-native-paper; o único consumidor é o Header, atualizado no próximo step). O import `{ Badge } from "react-native-paper"` no topo do arquivo continua usado pelo `NotificationBadge` — NÃO remova o import.

- [ ] **Step 3: Atualizar `src/components/Header/index.jsx`**

Arquivo completo depois da mudança:

```jsx
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useUnreadChatsCount } from "../../hooks/useUnreadChatsCount";
import { dataRoutes } from "../../routes/dataRoutes";
import { UnreadBadge } from "../UnreadBadge";
import logo from "../../assets/images/logo.png";
import {
    ChatButton,
    Container,
    LogoImage,
    MenuButton,
    RightSpacer,
} from "./styles";

export const Header = (props) => {
    const { navigation } = props;
    const loginState = useSelector((state) => state.login);
    const unreadCount = useUnreadChatsCount();

    const handleOpenDrawer = () => navigation.openDrawer();
    const handleOpenChats = () => navigation.navigate(dataRoutes.myChats);

    const isAuthenticated = loginState?.isAuthenticated ?? false;

    return (
        <Container>
            <MenuButton onPress={handleOpenDrawer}>
                <Feather name="menu" size={24} color="white" />
            </MenuButton>
            <LogoImage source={logo} />
            {isAuthenticated ? (
                <ChatButton onPress={handleOpenChats}>
                    <Feather name="message-circle" size={22} color="white" />
                    <UnreadBadge
                        count={unreadCount}
                        style={{ position: "absolute", top: -4, right: -4 }}
                    />
                </ChatButton>
            ) : (
                <RightSpacer />
            )}
        </Container>
    );
};
```

(Diferenças vs atual: import de `UnreadBadge`, remoção do import `ChatBadge`, ícone sem `position: "absolute"`, badge novo posicionado absoluto no canto do círculo.)

- [ ] **Step 4: Lint**

Run: `npx eslint src/components/UnreadBadge/index.jsx src/components/Header/index.jsx src/components/Header/styles.js`
Expected: sem erros novos vs baseline (Header hoje linta limpo; UnreadBadge novo deve lintar limpo).

- [ ] **Step 5: Commit**

```bash
git add src/components/UnreadBadge/index.jsx src/components/Header/index.jsx src/components/Header/styles.js
git commit -m "feat: green chat icon with red 99+ unread badge in header"
```

---

### Task 3: Item "Conversas" no menu lateral

**Files:**
- Modify: `src/components/DrawerContent/index.jsx`

- [ ] **Step 1: Adicionar o DrawerItem com contador**

Arquivo completo depois da mudança (base atual tem 61 linhas; mudanças: imports novos, hook, e o bloco `DrawerItem` "Conversas" dentro do scroll, após o `DrawerItemList`):

```jsx
import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from "@react-navigation/drawer";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { BackAdminButton } from "./components/BackAdminButton";
import { ExitUserButton } from "./components/ExitUserButton";
import { Profile } from "./components/Profile";
import { dataRoutes } from "../../routes/dataRoutes";
import { useUnreadChatsCount } from "../../hooks/useUnreadChatsCount";
import { UnreadBadge } from "../UnreadBadge";

export const DrawerContent = (props) => {
    const { navigation, backAdmin, state, descriptors } = props;
    const loginState = useSelector((s) => s.login);
    const unreadCount = useUnreadChatsCount();

    const isAuthenticated = loginState?.isAuthenticated ?? false;

    // Separate admin route from the rest
    const adminRouteName = dataRoutes.admin.navigation; // "Admin:Navigation"
    const filteredRoutes = state.routes.filter((r) => r.name !== adminRouteName);
    const adminRoute = state.routes.find((r) => r.name === adminRouteName);

    const filteredState = {
        ...state,
        routes: filteredRoutes,
        index: Math.min(
            state.index,
            Math.max(0, filteredRoutes.length - 1),
        ),
    };

    return (
        <>
            <Profile navigation={navigation} />
            <DrawerContentScrollView
                {...props}
                state={filteredState}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
            >
                <DrawerItemList {...props} state={filteredState} />
                {isAuthenticated && (
                    <DrawerItem
                        label={({ color }) => (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Text style={{ color }}>Conversas</Text>
                                <UnreadBadge count={unreadCount} />
                            </View>
                        )}
                        icon={({ size, color }) => (
                            <Feather name="message-circle" size={size} color={color} />
                        )}
                        onPress={() => navigation.navigate(dataRoutes.myChats)}
                    />
                )}
            </DrawerContentScrollView>
            {adminRoute && (
                <DrawerItem
                    label={
                        descriptors[adminRoute.key]?.options?.drawerLabel ??
                        descriptors[adminRoute.key]?.options?.title ??
                        "Administrador"
                    }
                    icon={({ size, color }) => (
                        <Feather name="settings" size={size} color={color} />
                    )}
                    onPress={() => navigation.navigate(adminRoute.name)}
                    style={{ marginBottom: 0 }}
                />
            )}
            {backAdmin ? (
                <BackAdminButton navigation={navigation} />
            ) : (
                <ExitUserButton navigation={navigation} />
            )}
        </>
    );
};
```

Nota: `dataRoutes.myChats` é a rota "My Chats" registrada no stack raiz; a navegação a partir do drawer sobe pro navegador pai automaticamente (nested navigation do react-navigation).

- [ ] **Step 2: Lint**

Run: `npx eslint src/components/DrawerContent/index.jsx`
Expected: sem erros novos vs baseline (rode `git show HEAD:src/components/DrawerContent/index.jsx` num arquivo temporário e linte para comparar, se houver erros).

- [ ] **Step 3: Commit**

```bash
git add src/components/DrawerContent/index.jsx
git commit -m "feat: add Conversas item with unread badge to drawer menu"
```

---

### Task 4: `BadgeSync` — badge do ícone do app com o app aberto

**Files:**
- Create: `src/components/BadgeSync/index.jsx`
- Modify: `App.jsx` (remover reset do badge no startup; renderizar BadgeSync)

- [ ] **Step 1: Criar o componente**

```jsx
// src/components/BadgeSync/index.jsx
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

import { useUnreadChatsCount } from "../../hooks/useUnreadChatsCount";

export const BadgeSync = () => {
    const unreadCount = useUnreadChatsCount();

    useEffect(() => {
        Notifications.setBadgeCountAsync(unreadCount).catch(() => {});
    }, [unreadCount]);

    return null;
};
```

(`.catch(() => {})` silencioso é intencional: em Androids sem suporte a badge a promise pode rejeitar, e isso é o comportamento esperado da plataforma, não um erro a reportar.)

- [ ] **Step 2: Atualizar `App.jsx`**

a) Remover a linha `await Notifications.setBadgeCountAsync(0);` do `useEffect` de startup (hoje logo após o `SystemUI.setBackgroundColorAsync` no bloco Android) — ela apagaria o badge correto a cada abertura; o `BadgeSync` passa a ser a única fonte do valor.

b) Adicionar o import junto aos imports de componentes:

```js
import { BadgeSync } from "./src/components/BadgeSync";
```

c) Renderizar dentro do `ProviderRedux` (precisa do redux para o hook), ao lado do `ContentStatusBar`:

```jsx
                    <ProviderRedux store={store}>
                        <ContentStatusBar />
                        <BadgeSync />
```

(restante do JSX inalterado)

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/BadgeSync/index.jsx App.jsx`
Expected: BadgeSync limpo; App.jsx apenas o erro pré-existente `'__DEV__' is not defined`.

- [ ] **Step 4: Commit**

```bash
git add src/components/BadgeSync/index.jsx App.jsx
git commit -m "feat: sync app icon badge with unread chats count"
```

---

### Task 5: Badge no push — `countUnreadChats` + campo `badge` no envio

**Files:**
- Modify: `src/services/ExpoNotification/sendNotification.js`
- Modify: `src/controllers/Chat/index.js`

- [ ] **Step 1: `sendNotification` ganha parâmetro `badge`**

Arquivo completo depois da mudança:

```js
// src/services/ExpoNotification/sendNotification.js
import * as Sentry from "@sentry/react-native";

export const sendNotification = async (token, title, body, data = {}, badge = null) => {
    try {
        const resultNotification = await (
            await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: token,
                    title,
                    sound: "default",
                    body,
                    channelId: "notifications-app",
                    data,
                    ...(badge != null ? { badge } : {}),
                }),
            })
        ).json();

        console.log(resultNotification);

        return resultNotification;
    } catch (error) {
        Sentry.captureException(error);

        return null;
    }
};
```

(Chamadas existentes com 3 ou 4 argumentos continuam válidas — `badge` default `null` omite o campo.)

- [ ] **Step 2: `countUnreadChats` no controller**

Em `src/controllers/Chat/index.js`:

a) Adicionar `getDocs` ao import de `firebase/firestore` (lista já tem `addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where` — inserir `getDocs` em ordem alfabética após `getDoc`).

b) Nova função exportada (colocar após `markChatAsSeen`):

```js
export const countUnreadChats = async (userId) => {
    try {
        const safeId = String(userId).replace(/[@.]/g, "_");
        const ref = collection(firestore, models.chats);
        const [buyerSnap, sellerSnap] = await Promise.all([
            getDocs(query(ref, where("buyerId", "==", userId))),
            getDocs(query(ref, where("sellerId", "==", userId))),
        ]);

        const seen = new Set();
        let count = 0;

        [...buyerSnap.docs, ...sellerSnap.docs].forEach((d) => {
            if (seen.has(d.id)) return;
            seen.add(d.id);
            const chat = d.data();
            if (!chat.lastMessageAt || !chat.lastMessage) return;
            const lastSeen = chat.lastSeenAt?.[safeId];
            if (!lastSeen) {
                count += 1;
                return;
            }
            const seenMs = lastSeen?.toMillis?.() ?? 0;
            const msgMs = chat.lastMessageAt?.toMillis?.() ?? 0;
            if (msgMs > seenMs) count += 1;
        });

        return count;
    } catch (error) {
        Sentry.captureException(error);
        return null;
    }
};
```

(Mesma semântica de não-lida de `subscribeUnreadChatsCount`, versão one-shot. Retorna `null` em erro — o chamador então envia o push sem badge.)

- [ ] **Step 3: Wiring no `sendChatMessage`**

No bloco final de `sendChatMessage` (o que monta e envia a notificação), calcular o badge após a escrita da mensagem e passá-lo como 5º argumento:

```js
        const recipientId = senderId === sellerId ? buyerId : sellerId;
        const senderNameForNotification = senderId === sellerId ? sellerName : buyerName;
        const tokenResult = await getUserNotificationToken(recipientId);
        if (!tokenResult.error && tokenResult.data) {
            const unreadBadge = await countUnreadChats(recipientId);
            await sendNotification(
                tokenResult.data,
                senderNameForNotification || "Nova mensagem",
                lastMessage.length > 80 ? lastMessage.slice(0, 77) + "..." : lastMessage,
                {
                    type: "chat",
                    chatId: id,
                    publicationId,
                    sellerId,
                    buyerId,
                    sellerName,
                    buyerName,
                },
                unreadBadge,
            );
        }
```

(Única mudança vs atual: a linha `const unreadBadge = ...` e o 5º argumento. O objeto `data` fica idêntico.)

- [ ] **Step 4: Lint + testes**

Run: `npx eslint src/services/ExpoNotification/sendNotification.js src/controllers/Chat/index.js`
Expected: sem erros novos (Chat/index.js tem 4 erros de baseline: nested ternary, string concat, 2x object-curly-newline).

Run: `node --test tests/*.test.cjs`
Expected: mesma baseline (3 falhas pré-existentes não relacionadas).

- [ ] **Step 5: Commit**

```bash
git add src/services/ExpoNotification/sendNotification.js src/controllers/Chat/index.js
git commit -m "feat: carry recipient unread count as badge in chat push notifications"
```

---

### Task 6: Trava persistente da mensagem automática

**Files:**
- Modify: `src/controllers/Chat/index.js` (nova função `markAutoMessageSent`)
- Modify: `src/pages/PublicationChat/index.jsx` (estado `chatMeta`, guard, gravação da trava)

**ATENÇÃO:** `src/pages/PublicationChat/index.jsx` contém hunks não commitados do usuário (gesto de gravação de áudio — `recordingGesture.cjs`, refs `recordingTouch*`, handlers `handleRecordTouch*`, estado `isRecordingLocked`). NÃO alterar esses trechos; eles entrarão no commit junto (aceito pelo usuário).

- [ ] **Step 1: `markAutoMessageSent` no controller**

Em `src/controllers/Chat/index.js`, após `countUnreadChats`:

```js
export const markAutoMessageSent = async (chatId) => {
    try {
        const chatRef = doc(firestore, models.chats, chatId);
        await updateDoc(chatRef, { autoMessageSentAt: serverTimestamp() });
    } catch (error) {
        Sentry.captureException(error);
    }
};
```

- [ ] **Step 2: `PublicationChat` — estado `chatMeta` no lugar de `lastSeenAt`**

a) Import: adicionar `markAutoMessageSent` ao import existente de `../../controllers/Chat`:

```js
import { sendChatMessage, subscribeToChat, markChatAsSeen, markAutoMessageSent, chatDocId } from "../../controllers/Chat";
```

b) Trocar o estado (hoje `const [lastSeenAt, setLastSeenAt] = useState({});`) por:

```js
    const [chatMeta, setChatMeta] = useState(null);

    const lastSeenAt = chatMeta?.lastSeenAt || {};
```

(A derivação `lastSeenAt` mantém todos os usos existentes — `getMessageReadStatus(item, lastSeenAt, otherUserId)` — sem mudança.)

c) No `useEffect` do `subscribeToChat`, trocar o callback:

```js
            onChatMeta: (meta) => setChatMeta(meta || null),
```

- [ ] **Step 3: Guard + gravação da trava no efeito de auto-send**

O efeito atual é:

```js
    useEffect(() => {
        if (!autoSend || !initialMessage || !myId || !buyerId || autoSentRef.current) return;
        if (!messagesReadyRef.current) return; // aguarda subscription carregar
        if (messages.length > 0) return; // chat já tem mensagens — não dispara de novo
        const effectiveSellerName = resolvedSellerName || sellerName || "";
        if (sellerId && !effectiveSellerName) return; // aguarda resolvedSellerName
        autoSentRef.current = true;
        sendChatMessage({
            publicationId: publication.id,
            sellerId,
            buyerId,
            senderId: myId,
            text: initialMessage,
            sellerName: effectiveSellerName,
            buyerName,
            publicationTitle: publication?.publicationTitle || publication?.location || "",
        });
    }, [myId, resolvedSellerName, messages]);
```

Trocar por:

```js
    useEffect(() => {
        if (!autoSend || !initialMessage || !myId || !buyerId || autoSentRef.current) return;
        if (!messagesReadyRef.current) return; // aguarda subscription carregar
        if (messages.length > 0) return; // chat já tem mensagens — não dispara de novo
        if (chatMeta?.autoMessageSentAt) return; // trava persistente: já enviada 1x p/ este cliente+anúncio
        const effectiveSellerName = resolvedSellerName || sellerName || "";
        if (sellerId && !effectiveSellerName) return; // aguarda resolvedSellerName
        autoSentRef.current = true;
        sendChatMessage({
            publicationId: publication.id,
            sellerId,
            buyerId,
            senderId: myId,
            text: initialMessage,
            sellerName: effectiveSellerName,
            buyerName,
            publicationTitle: publication?.publicationTitle || publication?.location || "",
        }).then((ok) => {
            if (ok && resolvedChatId) markAutoMessageSent(resolvedChatId);
        });
    }, [myId, resolvedSellerName, messages, chatMeta]);
```

(Duas mudanças de comportamento: o guard novo por `chatMeta?.autoMessageSentAt`, e o `.then` que grava a trava após envio bem-sucedido — `sendChatMessage` retorna `true`/`false`. `chatMeta` entra nas deps para o guard reavaliar quando o meta chegar; `autoSentRef` impede reenvio nesse re-run.)

- [ ] **Step 4: Lint + testes**

Run: `npx eslint src/controllers/Chat/index.js src/pages/PublicationChat/index.jsx`
Expected: sem erros novos vs baseline de cada arquivo (PublicationChat tem ~25 erros de baseline por causa dos hunks WIP do usuário; compare categorias, não conte apenas).

Run: `node --test tests/*.test.cjs`
Expected: mesma baseline.

- [ ] **Step 5: Commit**

```bash
git add src/controllers/Chat/index.js src/pages/PublicationChat/index.jsx
git commit -m "feat: persist autoMessageSentAt so auto message fires once per client+ad"
```

---

## Verificação manual (pós-implementação, simulador/dispositivo)

1. Home: ícone verde circular com badge vermelho; 0 não lidas → sem badge; 100+ → "99+".
2. Drawer: item "Conversas" com o mesmo contador; toque abre a lista.
3. iOS: badge no ícone do app acompanha o contador (abrir app → ler conversas → badge cai; zero → some). Android: depende do launcher.
4. Push com app fechado carrega badge (iOS).
5. Abrir chat pelo card (auto-send) → sair → reabrir pelo card → NÃO reenvia. Verificar `autoMessageSentAt` no doc do chat no Firestore.
