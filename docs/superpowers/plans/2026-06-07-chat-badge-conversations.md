# Chat Badge + Minhas Conversas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar badge de mensagens não lidas na top bar, tela "Minhas Conversas" estilo OLX, e ajustar botões do card (WA = só ícone, CHAT = botão largo).

**Architecture:** Chat controller ganha funções de `lastSeenAt`, listagem por usuário e snapshot de última mensagem. Um hook `useUnreadChatsCount` alimenta o badge do Header em tempo real via duas queries Firestore (buyer + seller). MyChats screen lista todas as conversas com merge das duas queries.

**Tech Stack:** React Native + Expo, Firebase Firestore (onSnapshot, duas queries OR), styled-components/native, react-navigation, Redux (dataUser do login state)

---

## File Map

| Arquivo | Ação |
|---|---|
| `src/controllers/Chat/index.js` | Adicionar `markChatAsSeen`, `subscribeUnreadChatsCount`, `subscribeMyChats`. Atualizar `sendChatMessage` para salvar `lastMessage`, `lastMessageAt`, `sellerName`, `buyerName`, `publicationTitle` |
| `src/hooks/useUnreadChatsCount.js` | Novo hook — duas queries onSnapshot, soma não lidas |
| `src/components/Header/index.jsx` | Adicionar badge de chat usando hook + navegar para MyChats |
| `src/components/Header/styles.js` | Adicionar `ChatButton` e `ChatBadge` styled components |
| `src/pages/MyChats/index.jsx` | Nova tela lista de conversas |
| `src/pages/MyChats/styles.js` | Styled components da tela |
| `src/pages/PublicationChat/index.jsx` | Chamar `markChatAsSeen` ao montar |
| `src/components/CardPublicationShrimp/index.jsx` | Ajustar botão WA (só ícone) e CHAT (flex:1 + texto "CHAT") |
| `src/routes/dataRoutes.js` | Adicionar `myChats: "My Chats"` |
| `src/routes/index.jsx` | Registrar screen `MyChats` |
| `tests/chatController.test.cjs` | Testes unitários das funções puras do controller |

---

## Task 1: Atualizar `sendChatMessage` para salvar snapshot da última mensagem

**Files:**
- Modify: `src/controllers/Chat/index.js`
- Test: `tests/chatController.test.cjs`

O `sendChatMessage` precisa salvar no documento raiz: `lastMessage`, `lastMessageAt`, `sellerName`, `buyerName`, `publicationTitle`. Isso permite listar conversas sem ler a subcoleção de mensagens.

- [ ] **Step 1: Criar arquivo de teste**

Criar `tests/chatController.test.cjs`:

```js
// Testa funções puras do controller (sem Firebase)
let passed = 0, failed = 0;
function assert(cond, label) {
    if (cond) { console.log(`  ✅ ${label}`); passed++; }
    else { console.error(`  ❌ FAIL: ${label}`); failed++; }
}

// chatDocId logic (extraída para teste)
const chatDocId = (publicationId, buyerId) =>
    `${publicationId}_${String(buyerId).replace(/[@.]/g, "_")}`;

console.log("\nchatDocId:");
assert(chatDocId("pub1", "user@email.com") === "pub1_user_email_com", "replaces @ and .");
assert(chatDocId("pub1", "simple") === "pub1_simple", "no special chars unchanged");
assert(chatDocId("abc", "a@b.c.d") === "abc_a_b_c_d", "multiple special chars");

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
```

- [ ] **Step 2: Rodar teste para confirmar passa**

```bash
node tests/chatController.test.cjs
```

Expected: `3 tests: 3 passed, 0 failed`

- [ ] **Step 3: Atualizar `sendChatMessage` no controller**

Substituir o conteúdo de `src/controllers/Chat/index.js`:

```js
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const chatDocId = (publicationId, buyerId) =>
    `${publicationId}_${String(buyerId).replace(/[@.]/g, "_")}`;

const messagesRef = (chatId) =>
    collection(firestore, models.chats, chatId, "messages");

export const sendChatMessage = async ({
    publicationId,
    sellerId,
    buyerId,
    senderId,
    text,
    sellerName = "",
    buyerName = "",
    publicationTitle = "",
}) => {
    try {
        const id = chatDocId(publicationId, buyerId);
        const chatRef = doc(firestore, models.chats, id);
        const snap = await getDoc(chatRef);
        const trimmed = text.trim();

        if (!snap.exists()) {
            await setDoc(chatRef, {
                id,
                publicationId,
                sellerId,
                buyerId,
                sellerName,
                buyerName,
                publicationTitle,
                lastMessage: trimmed,
                lastMessageAt: serverTimestamp(),
                lastSeenAt: {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } else {
            await updateDoc(chatRef, {
                lastMessage: trimmed,
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        await addDoc(messagesRef(id), {
            senderId,
            text: trimmed,
            createdAt: serverTimestamp(),
        });

        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const subscribeToChat = ({ publicationId, buyerId, onMessages }) => {
    const id = chatDocId(publicationId, buyerId);
    const q = query(messagesRef(id), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
        onMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
};

export const markChatAsSeen = async (chatId, userId) => {
    try {
        const chatRef = doc(firestore, models.chats, chatId);
        await updateDoc(chatRef, {
            [`lastSeenAt.${userId.replace(/[@.]/g, "_")}`]: serverTimestamp(),
        });
    } catch (error) {
        Sentry.captureException(error);
    }
};

export const subscribeUnreadChatsCount = (userId, onCount) => {
    const safeId = userId.replace(/[@.]/g, "_");
    const ref = collection(firestore, models.chats);

    const qBuyer = query(ref, where("buyerId", "==", userId));
    const qSeller = query(ref, where("sellerId", "==", userId));

    let buyerChats = [];
    let sellerChats = [];

    const compute = () => {
        const all = [...buyerChats, ...sellerChats];
        const count = all.filter((chat) => {
            const lastSeen = chat.lastSeenAt?.[safeId];
            const lastMsg = chat.lastMessageAt;
            if (!lastMsg) return false;
            if (!lastSeen) return true;
            const seenMs = lastSeen?.toMillis?.() ?? 0;
            const msgMs = lastMsg?.toMillis?.() ?? 0;
            return msgMs > seenMs && chat.lastMessage;
        }).length;
        onCount(count);
    };

    const unsubBuyer = onSnapshot(qBuyer, (snap) => {
        buyerChats = snap.docs.map((d) => d.data());
        compute();
    });

    const unsubSeller = onSnapshot(qSeller, (snap) => {
        sellerChats = snap.docs.map((d) => d.data());
        compute();
    });

    return () => {
        unsubBuyer();
        unsubSeller();
    };
};

export const subscribeMyChats = (userId, onChats) => {
    const ref = collection(firestore, models.chats);
    const qBuyer = query(ref, where("buyerId", "==", userId));
    const qSeller = query(ref, where("sellerId", "==", userId));

    let buyerChats = [];
    let sellerChats = [];

    const merge = () => {
        const seen = new Set();
        const all = [...buyerChats, ...sellerChats].filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
        });
        all.sort((a, b) => {
            const ta = a.lastMessageAt?.toMillis?.() ?? 0;
            const tb = b.lastMessageAt?.toMillis?.() ?? 0;
            return tb - ta;
        });
        onChats(all);
    };

    const unsubBuyer = onSnapshot(qBuyer, (snap) => {
        buyerChats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        merge();
    });

    const unsubSeller = onSnapshot(qSeller, (snap) => {
        sellerChats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        merge();
    });

    return () => {
        unsubBuyer();
        unsubSeller();
    };
};
```

- [ ] **Step 4: Commit**

```bash
git add src/controllers/Chat/index.js tests/chatController.test.cjs
git commit -m "feat: extend chat controller with lastSeenAt, unread count, and chat listing"
```

---

## Task 2: Hook `useUnreadChatsCount`

**Files:**
- Create: `src/hooks/useUnreadChatsCount.js`

- [ ] **Step 1: Criar o diretório e o hook**

```bash
mkdir -p src/hooks
```

Criar `src/hooks/useUnreadChatsCount.js`:

```js
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { subscribeUnreadChatsCount } from "../controllers/Chat";

export const useUnreadChatsCount = () => {
    const { dataUser } = useSelector((state) => state.login);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const userId = dataUser?.email ?? dataUser?.uid;
        if (!userId) return;
        const unsub = subscribeUnreadChatsCount(userId, setCount);
        return unsub;
    }, [dataUser?.email, dataUser?.uid]);

    return count;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useUnreadChatsCount.js
git commit -m "feat: add useUnreadChatsCount hook for real-time unread badge"
```

---

## Task 3: Badge de chat no Header

**Files:**
- Modify: `src/components/Header/styles.js`
- Modify: `src/components/Header/index.jsx`

O Header já tem `NotificationsButton` e `NotificationBadge` comentados em `styles.js` — reusar o mesmo padrão para o chat.

- [ ] **Step 1: Adicionar styled components no styles.js**

Ler `src/components/Header/styles.js`. Adicionar ao final do arquivo:

```js
export const ChatButton = styled.TouchableOpacity`
    width: 13%;
    height: 100%;
    justify-content: center;
    align-items: center;
    margin-right: ${({ theme }) => theme.size.dimentionsSize(-1)};
`;

export const ChatBadge = styled(Badge)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3.5)};
    background-color: ${({ theme }) => theme.colors.primary};
`;
```

- [ ] **Step 2: Atualizar Header/index.jsx**

Substituir conteúdo de `src/components/Header/index.jsx`:

```jsx
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useUnreadChatsCount } from "../../hooks/useUnreadChatsCount";
import { dataRoutes } from "../../routes/dataRoutes";

import logo from "../../assets/images/logo.png";

import {
    ChatBadge,
    ChatButton,
    Container,
    LogoImage,
    MenuButton,
    RightSpacer,
} from "./styles";

export const Header = (props) => {
    const { navigation } = props;
    const { isAuthenticated } = useSelector((state) => state.login);
    const unreadCount = useUnreadChatsCount();

    const handleOpenDrawer = () => navigation.openDrawer();

    const handleOpenChats = () => navigation.navigate(dataRoutes.myChats);

    return (
        <Container>
            <MenuButton onPress={handleOpenDrawer}>
                <Feather name="menu" size={24} color="white" />
            </MenuButton>
            <LogoImage source={logo} />
            {isAuthenticated ? (
                <ChatButton onPress={handleOpenChats}>
                    <Feather
                        name="message-circle"
                        size={24}
                        color="white"
                        style={{ position: "absolute" }}
                    />
                    <ChatBadge visible={unreadCount > 0} size={21}>
                        {unreadCount}
                    </ChatBadge>
                </ChatButton>
            ) : (
                <RightSpacer />
            )}
        </Container>
    );
};
```

> **Nota:** `isAuthenticated` já existe no `login` reducer. Verifique o nome exato do campo — pode ser `isAuthenticated` ou outro. Leia `src/pages/Login/reducer.js` e ajuste se necessário.

- [ ] **Step 3: Verificar que `isAuthenticated` existe no reducer**

```bash
grep -n "isAuthenticated\|ISAUTHENTICATED" src/pages/Login/reducer.js
```

Se o campo tiver nome diferente, ajuste o `useSelector` no Header.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header/index.jsx src/components/Header/styles.js
git commit -m "feat: add unread chat badge to header"
```

---

## Task 4: Tela MyChats — Minhas Conversas

**Files:**
- Create: `src/pages/MyChats/index.jsx`
- Create: `src/pages/MyChats/styles.js`

- [ ] **Step 1: Criar styles.js**

Criar `src/pages/MyChats/styles.js`:

```js
import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f4f8fb;
`;

export const Header = styled.View`
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

export const HeaderSub = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #8fa3b2;
    margin-top: 2px;
`;

export const ConvItem = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    background-color: ${({ unread }) => (unread ? "#fff8f5" : "#fff")};
    border-bottom-width: 1px;
    border-bottom-color: #f0f5fb;
`;

export const Avatar = styled.View`
    width: 46px;
    height: 46px;
    border-radius: 23px;
    background-color: #f55b1f;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
`;

export const AvatarText = styled(Text)`
    color: #fff;
    font-weight: 800;
    font-size: ${({ theme }) => theme.size.fontSize(17)};
`;

export const ConvInfo = styled.View`
    flex: 1;
`;

export const ConvName = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: 700;
    color: #36536e;
`;

export const ConvPub = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #8fa3b2;
    margin-top: 1px;
`;

export const ConvLastMsg = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: ${({ unread }) => (unread ? "#36536e" : "#5f7b94")};
    font-weight: ${({ unread }) => (unread ? "600" : "400")};
    margin-top: 3px;
`;

export const ConvRight = styled.View`
    align-items: flex-end;
    gap: 4px;
`;

export const ConvTime = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    color: #8fa3b2;
`;

export const UnreadBadge = styled.View`
    background-color: #f55b1f;
    border-radius: 9px;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
`;

export const UnreadBadgeText = styled(Text)`
    color: #fff;
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    font-weight: 800;
`;

export const EmptyWrap = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 32px;
`;

export const EmptyText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #8fa3b2;
    text-align: center;
    margin-top: 12px;
`;
```

- [ ] **Step 2: Criar index.jsx**

Criar `src/pages/MyChats/index.jsx`:

```jsx
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";

import { subscribeMyChats } from "../../controllers/Chat";
import { dataRoutes } from "../../routes/dataRoutes";
import {
    Avatar,
    AvatarText,
    ConvInfo,
    ConvItem,
    ConvLastMsg,
    ConvName,
    ConvPub,
    ConvRight,
    ConvTime,
    Container,
    EmptyText,
    EmptyWrap,
    Header,
    HeaderSub,
    HeaderTitle,
    UnreadBadge,
    UnreadBadgeText,
} from "./styles";

const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts?.toDate?.() ?? new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return d.toLocaleDateString("pt-BR", { weekday: "short" });
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

const isUnread = (chat, safeId) => {
    const lastSeen = chat.lastSeenAt?.[safeId];
    const lastMsg = chat.lastMessageAt;
    if (!lastMsg || !chat.lastMessage) return false;
    if (!lastSeen) return true;
    return (lastMsg?.toMillis?.() ?? 0) > (lastSeen?.toMillis?.() ?? 0);
};

export const MyChats = ({ navigation }) => {
    const { dataUser } = useSelector((state) => state.login);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    const myId = dataUser?.email ?? dataUser?.uid;
    const safeId = myId?.replace(/[@.]/g, "_") ?? "";

    useEffect(() => {
        if (!myId) return;
        const unsub = subscribeMyChats(myId, (data) => {
            setChats(data);
            setLoading(false);
        });
        return unsub;
    }, [myId]);

    const unreadTotal = chats.filter((c) => isUnread(c, safeId)).length;

    const getOtherUser = (chat) => {
        if (chat.sellerId === myId) {
            return { name: chat.buyerName || "Comprador", id: chat.buyerId };
        }
        return { name: chat.sellerName || "Vendedor", id: chat.sellerId };
    };

    const handleOpen = (chat) => {
        navigation.navigate(dataRoutes.publicationChat, {
            publication: { id: chat.publicationId },
            sellerId: chat.sellerId,
            sellerName: chat.sellerName || "Vendedor",
            chatId: chat.id,
        });
    };

    if (loading) {
        return (
            <Container>
                <ActivityIndicator color="#f55b1f" style={{ flex: 1 }} />
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <HeaderTitle>Minhas Conversas</HeaderTitle>
                {unreadTotal > 0 && (
                    <HeaderSub>{unreadTotal} mensagem{unreadTotal > 1 ? "s" : ""} não lida{unreadTotal > 1 ? "s" : ""}</HeaderSub>
                )}
            </Header>
            {chats.length === 0 ? (
                <EmptyWrap>
                    <Feather name="message-circle" size={48} color="#c8d8e8" />
                    <EmptyText>Você ainda não tem conversas</EmptyText>
                </EmptyWrap>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const other = getOtherUser(item);
                        const unread = isUnread(item, safeId);
                        const initial = (other.name?.[0] ?? "?").toUpperCase();
                        return (
                            <ConvItem unread={unread} onPress={() => handleOpen(item)} activeOpacity={0.7}>
                                <Avatar>
                                    <AvatarText>{initial}</AvatarText>
                                </Avatar>
                                <ConvInfo>
                                    <ConvName numberOfLines={1}>{other.name}</ConvName>
                                    <ConvPub numberOfLines={1}>🦐 {item.publicationTitle || "Publicação"}</ConvPub>
                                    <ConvLastMsg unread={unread} numberOfLines={1}>
                                        {item.sellerId === myId && !unread ? `Você: ` : ""}{item.lastMessage || ""}
                                    </ConvLastMsg>
                                </ConvInfo>
                                <ConvRight>
                                    <ConvTime>{formatTime(item.lastMessageAt)}</ConvTime>
                                    {unread && (
                                        <UnreadBadge>
                                            <UnreadBadgeText>!</UnreadBadgeText>
                                        </UnreadBadge>
                                    )}
                                </ConvRight>
                            </ConvItem>
                        );
                    }}
                />
            )}
        </Container>
    );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/MyChats/index.jsx src/pages/MyChats/styles.js
git commit -m "feat: add MyChats screen with real-time conversation list"
```

---

## Task 5: Registrar rota MyChats

**Files:**
- Modify: `src/routes/dataRoutes.js`
- Modify: `src/routes/index.jsx`

- [ ] **Step 1: Adicionar rota em dataRoutes.js**

Ler `src/routes/dataRoutes.js`. Adicionar `myChats: "My Chats",` ao objeto `dataRoutes` (nível raiz, não dentro de `admin`):

```js
export const dataRoutes = {
    // ... existentes ...
    myChats: "My Chats",
    // ...
};
```

- [ ] **Step 2: Registrar screen em index.jsx**

Ler `src/routes/index.jsx`. Adicionar import:

```js
import { MyChats } from "../pages/MyChats";
```

Adicionar Screen dentro do `Navigator` (junto às demais screens):

```jsx
<Screen
    name={dataRoutes.myChats}
    component={MyChats}
    options={{ headerShown: false }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/dataRoutes.js src/routes/index.jsx
git commit -m "feat: register MyChats route in navigation"
```

---

## Task 6: `markChatAsSeen` no PublicationChat

**Files:**
- Modify: `src/pages/PublicationChat/index.jsx`

Ao abrir a conversa, marcar como lida para o usuário atual.

- [ ] **Step 1: Atualizar PublicationChat/index.jsx**

Ler o arquivo. Adicionar import de `markChatAsSeen`:

```js
import { sendChatMessage, subscribeToChat, markChatAsSeen } from "../../controllers/Chat";
```

Adicionar `chatId` ao destructuring de `route.params`:

```js
const { publication, sellerId, sellerName, chatId } = route.params;
```

No `useEffect` existente (que faz subscribe), adicionar chamada de `markChatAsSeen` quando há `chatId`:

```js
useEffect(() => {
    if (chatId && myId) {
        markChatAsSeen(chatId, myId);
    }

    const unsub = subscribeToChat({
        publicationId: publication.id,
        buyerId,
        onMessages: (msgs) => {
            setMessages([...msgs].reverse());
        },
    });
    return unsub;
}, [publication.id, buyerId]);
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/PublicationChat/index.jsx
git commit -m "feat: mark chat as seen when opening PublicationChat"
```

---

## Task 7: Ajustar botões do CardPublicationShrimp

**Files:**
- Modify: `src/components/CardPublicationShrimp/index.jsx`

Botão WA → só ícone (sem texto "Falar com o Produtor"). Botão CHAT → `flex: 1` com texto "CHAT".

- [ ] **Step 1: Ler a área dos botões**

```bash
grep -n "Falar com\|ButtonBuy\|Conversar\|CHAT\|whatsapp" src/components/CardPublicationShrimp/index.jsx | head -20
```

- [ ] **Step 2: Atualizar o botão WA**

Encontrar o bloco do botão "Falar com o Produtor". Substituir para mostrar só ícone:

```jsx
<ButtonBuy
    onPress={handleRedirectPage}
    style={{ width: 52, flex: undefined, paddingHorizontal: 0, justifyContent: "center" }}
>
    {!isLoadingTalkProductor ? (
        <FontAwesome name="whatsapp" size={26} color="white" />
    ) : (
        <ActivityIndicator animating size={20} color="white" />
    )}
</ButtonBuy>
```

- [ ] **Step 3: Atualizar o botão CHAT**

Encontrar o TouchableOpacity do "Conversar". Substituir para ocupar o espaço restante com texto "CHAT":

```jsx
{dataUser?.email !== item.userId && (
    <TouchableOpacity
        onPress={() =>
            navigation.navigate(dataRoutes.publicationChat, {
                publication: item,
                sellerId: item.userId,
                sellerName: item.sellerName ?? "Produtor",
            })
        }
        activeOpacity={0.8}
        style={{
            flex: 1,
            height: 44,
            backgroundColor: "#36536e",
            borderRadius: 8,
            paddingHorizontal: 10,
            marginLeft: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
        }}
    >
        <Feather name="message-circle" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
            CHAT
        </Text>
    </TouchableOpacity>
)}
```

- [ ] **Step 4: Também passar `sellerName` e `publicationTitle` ao navegar para o chat**

No `sendChatMessage` chamado de outros lugares precisamos passar os nomes. No botão CHAT do card, o `navigation.navigate` já passa `sellerName`. Garantir que quando `sendChatMessage` for chamado no `PublicationChat`, passe os dados corretos.

Ler `src/pages/PublicationChat/index.jsx` e atualizar o `handleSend`:

```js
const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    await sendChatMessage({
        publicationId: publication.id,
        sellerId,
        buyerId,
        senderId: myId,
        text: trimmed,
        sellerName: sellerName || "",
        buyerName: dataUser?.name || "",
        publicationTitle: publication?.publicationTitle || publication?.location || "",
    });
};
```

- [ ] **Step 5: Commit**

```bash
git add src/components/CardPublicationShrimp/index.jsx src/pages/PublicationChat/index.jsx
git commit -m "feat: WA button icon-only, CHAT button full-width, pass names to sendChatMessage"
```

---

## Self-Review

| Requisito do spec | Task |
|---|---|
| Botão WA = só ícone | Task 7 |
| Botão CHAT = flex:1 + texto | Task 7 |
| Badge não lidas na top bar em tempo real | Tasks 1, 2, 3 |
| Badge some quando 0 | Task 3 (`visible={unreadCount > 0}`) |
| Tap no badge → MyChats | Task 3 |
| MyChats lista buyer + seller | Task 1 (`subscribeMyChats`) |
| Ordenado por mais recente | Task 1 (sort por `lastMessageAt`) |
| Conversas não lidas destacadas | Task 4 |
| `lastSeenAt` atualizado ao abrir chat | Task 6 |
| `lastMessage` snapshot no documento | Task 1 (`sendChatMessage`) |
| `sellerName`, `buyerName`, `publicationTitle` salvos | Tasks 1, 7 |
| Rota `myChats` registrada | Task 5 |
