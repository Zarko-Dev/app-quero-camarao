# Chat Estilo WhatsApp + Notificações Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar `MyChats` e `PublicationChat` com visual estilo WhatsApp (avatar, check de leitura real, filtro Todas/Não lidas) e corrigir o fluxo de notificações push de chat (banner aparece em foreground, toque navega direto pra conversa, notificação é suprimida quando o chat já está aberto).

**Architecture:** Duas partes independentes que compartilham dois utilitários puros novos (`chatReadStatus`, `activeChatTracker`). Parte 1 (UI) modifica `PublicationChat` e `MyChats` (index + styles) e o controller `Chat` (para expor `lastSeenAt` do chat e gravar `lastMessageSenderId`). Parte 2 (notificações) modifica `sendNotification`, `Chat/index.js` (payload), `App.jsx` (handler + listener) e `routes/index.jsx` (expõe `navigationRef` para navegar fora da árvore de componentes).

**Tech Stack:** React Native (Expo), styled-components/native, Firebase Firestore (`firebase/firestore` client SDK), `expo-notifications`, `@react-navigation/native` v7, `@expo/vector-icons` (Feather). Testes: `node --test` sobre arquivos `tests/*.test.cjs` (só para lógica pura, sem Firebase/RN — não há setup de teste de componente neste repo).

**Referência:** `docs/superpowers/specs/2026-07-25-chat-whatsapp-style-design.md`

---

## Convenção do repositório (leia antes de começar)

Utilitários puros que precisam de teste automatizado usam `module.exports` no final do arquivo (não `export const`), mesmo sendo consumidos via `import { fn } from "./file"` no app — o Metro/Babel faz a interop, e isso permite `require()` direto em `node --test`. Veja `src/utils/drawEligibility.js` e `src/utils/appUpdatePrompt.js` como exemplos já existentes. Siga esse padrão nos Tasks 1 e 2.

---

### Task 1: Utilitário `chatReadStatus`

**Files:**
- Create: `src/utils/chatReadStatus.js`
- Test: `tests/chatReadStatus.test.cjs`

- [ ] **Step 1: Escrever o teste (vai falhar — o arquivo ainda não existe)**

```js
// tests/chatReadStatus.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { getMessageReadStatus } = require("../src/utils/chatReadStatus");

const ts = (ms) => ({ toMillis: () => ms });

test("getMessageReadStatus retorna read quando a mensagem foi enviada antes do lastSeenAt do outro usuário", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(1000) }, { buyer1: ts(2000) }, "buyer1"),
        "read",
    );
});

test("getMessageReadStatus retorna read quando os timestamps são iguais", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(2000) }, { buyer1: ts(2000) }, "buyer1"),
        "read",
    );
});

test("getMessageReadStatus retorna sent quando a mensagem foi enviada depois do lastSeenAt do outro usuário", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(3000) }, { buyer1: ts(2000) }, "buyer1"),
        "sent",
    );
});

test("getMessageReadStatus retorna sent quando o outro usuário não tem entrada em lastSeenAt", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(1000) }, {}, "buyer1"),
        "sent",
    );
});

test("getMessageReadStatus retorna sent quando lastSeenAt é undefined", () => {
    assert.equal(
        getMessageReadStatus({ createdAt: ts(1000) }, undefined, "buyer1"),
        "sent",
    );
});

test("getMessageReadStatus retorna sent quando a mensagem não tem createdAt", () => {
    assert.equal(
        getMessageReadStatus({}, { buyer1: ts(2000) }, "buyer1"),
        "sent",
    );
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `node --test tests/chatReadStatus.test.cjs`
Expected: FAIL — `Cannot find module '../src/utils/chatReadStatus'`

- [ ] **Step 3: Implementar o utilitário**

```js
// src/utils/chatReadStatus.js
const toMillis = (value) => {
    if (!value) return null;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") return value.toDate().getTime();
    return null;
};

const getMessageReadStatus = (message, lastSeenAt, otherUserId) => {
    const seenMs = toMillis(lastSeenAt?.[otherUserId]);
    const msgMs = toMillis(message?.createdAt);

    if (seenMs === null || msgMs === null) return "sent";

    return msgMs <= seenMs ? "read" : "sent";
};

module.exports = {
    getMessageReadStatus,
};
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `node --test tests/chatReadStatus.test.cjs`
Expected: PASS — 6 testes, 0 falhas

- [ ] **Step 5: Commit**

```bash
git add src/utils/chatReadStatus.js tests/chatReadStatus.test.cjs
git commit -m "feat: add getMessageReadStatus util for chat read receipts"
```

---

### Task 2: Utilitário `activeChatTracker`

**Files:**
- Create: `src/utils/activeChatTracker.js`
- Test: `tests/activeChatTracker.test.cjs`

- [ ] **Step 1: Escrever o teste (vai falhar)**

```js
// tests/activeChatTracker.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { setActiveChatId, getActiveChatId } = require("../src/utils/activeChatTracker");

test("getActiveChatId retorna null antes de qualquer set", () => {
    assert.equal(getActiveChatId(), null);
});

test("setActiveChatId guarda o id do chat", () => {
    setActiveChatId("pub1_buyer1");
    assert.equal(getActiveChatId(), "pub1_buyer1");
});

test("setActiveChatId(null) limpa o chat ativo", () => {
    setActiveChatId("pub1_buyer1");
    setActiveChatId(null);
    assert.equal(getActiveChatId(), null);
});

test("setActiveChatId(undefined) também limpa o chat ativo", () => {
    setActiveChatId("pub1_buyer1");
    setActiveChatId(undefined);
    assert.equal(getActiveChatId(), null);
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `node --test tests/activeChatTracker.test.cjs`
Expected: FAIL — `Cannot find module '../src/utils/activeChatTracker'`

- [ ] **Step 3: Implementar o utilitário**

```js
// src/utils/activeChatTracker.js
let activeChatId = null;

const setActiveChatId = (id) => {
    activeChatId = id ?? null;
};

const getActiveChatId = () => activeChatId;

module.exports = {
    setActiveChatId,
    getActiveChatId,
};
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `node --test tests/activeChatTracker.test.cjs`
Expected: PASS — 4 testes, 0 falhas

- [ ] **Step 5: Commit**

```bash
git add src/utils/activeChatTracker.js tests/activeChatTracker.test.cjs
git commit -m "feat: add activeChatTracker util to track the currently open chat"
```

---

### Task 3: `sendNotification` aceita payload de dados

**Files:**
- Modify: `src/services/ExpoNotification/sendNotification.js`

Sem teste automatizado — o arquivo faz `fetch` real para a Expo Push API e o repo não tem mock de `fetch` configurado (consistente com o resto do código: nada que toque rede/Firebase tem teste `node --test`). Verificação é por leitura + lint.

- [ ] **Step 1: Adicionar parâmetro `data` opcional ao payload**

Arquivo completo depois da mudança:

```js
// src/services/ExpoNotification/sendNotification.js
import * as Sentry from "@sentry/react-native";

export const sendNotification = async (token, title, body, data = {}) => {
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

- [ ] **Step 2: Confirmar que o único outro chamador continua funcionando**

Run: `grep -rn "sendNotification(" src --include="*.js" --include="*.jsx" | grep -v "sendNotification.js"`
Expected: só `src/controllers/Chat/index.js` aparece — será atualizado no Task 4. Como `data` tem default `{}`, chamadas com 3 argumentos continuam válidas.

- [ ] **Step 3: Lint**

Run: `npx eslint src/services/ExpoNotification/sendNotification.js`
Expected: sem novos erros além dos já pré-existentes no arquivo (rode `git stash && npx eslint src/services/ExpoNotification/sendNotification.js` antes, se quiser comparar a baseline)

- [ ] **Step 4: Commit**

```bash
git add src/services/ExpoNotification/sendNotification.js
git commit -m "feat: allow sendNotification to carry a data payload"
```

---

### Task 4: Controller `Chat` — `lastMessageSenderId`, payload de notificação e `onChatMeta`

**Files:**
- Modify: `src/controllers/Chat/index.js:26-97` (`sendChatMessage`)
- Modify: `src/controllers/Chat/index.js:99-111` (`subscribeToChat`)

**Por que `lastMessageSenderId`:** o spec previa mostrar o check de leitura na prévia da última mensagem em `MyChats`, mas o documento do chat (`chats/{chatId}`) hoje só guarda o texto da última mensagem (`lastMessage`), não quem a enviou. O código atual em `MyChats/index.jsx` já tenta aproximar isso com `item.sellerId === myId && !unread` — um heurística incorreta (confunde "não lida" com "enviada por mim"). Para o check de leitura funcionar corretamente é necessário saber com certeza quem mandou a última mensagem, então este task grava `lastMessageSenderId` no documento do chat. Task 10 corrige o `MyChats` para usar esse campo em vez da heurística antiga.

- [ ] **Step 1: Gravar `lastMessageSenderId` ao criar/atualizar o chat**

Em `sendChatMessage`, troque o bloco `if (!snap.exists()) { ... } else { ... }` (linhas 47-68 do arquivo atual):

```js
        if (!snap.exists()) {
            await setDoc(chatRef, {
                id,
                publicationId,
                sellerId,
                buyerId,
                sellerName,
                buyerName,
                publicationTitle,
                lastMessage,
                lastMessageAt: serverTimestamp(),
                lastMessageSenderId: senderId,
                lastSeenAt: {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } else {
            await updateDoc(chatRef, {
                lastMessage,
                lastMessageAt: serverTimestamp(),
                lastMessageSenderId: senderId,
                updatedAt: serverTimestamp(),
            });
        }
```

- [ ] **Step 2: Passar `data` estruturado pro `sendNotification`**

Troque o bloco final de `sendChatMessage` (linhas 81-90 do arquivo atual):

```js
        const recipientId = senderId === sellerId ? buyerId : sellerId;
        const senderNameForNotification = senderId === sellerId ? sellerName : buyerName;
        const tokenResult = await getUserNotificationToken(recipientId);
        if (!tokenResult.error && tokenResult.data) {
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
            );
        }
```

(Só renomeei a variável local `senderName` pra `senderNameForNotification` pra não colidir com o parâmetro `sellerName`/`buyerName` já existentes — o nome antigo `senderName` era um pouco confuso ao lado de `sellerName`.)

- [ ] **Step 3: `subscribeToChat` também assina o documento pai do chat (pra expor `lastSeenAt`)**

Troque a função inteira (linhas 99-111 do arquivo atual):

```js
export const subscribeToChat = ({ publicationId, buyerId, onMessages, onChatMeta, onError }) => {
    const id = chatDocId(publicationId, buyerId);
    console.log("[Chat] subscribeToChat id=", id, "publicationId=", publicationId, "buyerId=", buyerId);
    const q = query(messagesRef(id), orderBy("createdAt", "asc"));
    const unsubMessages = onSnapshot(q, (snap) => {
        console.log("[Chat] snapshot docs=", snap.docs.length);
        onMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => {
        console.error("[Chat] subscribeToChat error:", error.code, error.message);
        Sentry.captureException(error);
        onError?.(error);
    });

    const chatRef = doc(firestore, models.chats, id);
    const unsubChat = onSnapshot(chatRef, (snap) => {
        if (snap.exists()) {
            onChatMeta?.(snap.data());
        }
    });

    return () => {
        unsubMessages();
        unsubChat();
    };
};
```

`onChatMeta` é opcional (`?.`) pra não quebrar nenhum outro chamador que ainda não passe esse callback.

- [ ] **Step 4: Lint**

Run: `npx eslint src/controllers/Chat/index.js`
Expected: sem novos erros além da baseline pré-existente

- [ ] **Step 5: Rodar a suíte de testes pura pra garantir que nada quebrou**

Run: `yarn test:unit`
Expected: todos os testes existentes continuam passando (este arquivo não é importado diretamente por nenhum teste, mas roda a suíte inteira por segurança)

- [ ] **Step 6: Commit**

```bash
git add src/controllers/Chat/index.js
git commit -m "feat: track lastMessageSenderId and expose chat lastSeenAt via onChatMeta"
```

---

### Task 5: Expor `navigationRef` em `routes/index.jsx`

**Files:**
- Modify: `src/routes/index.jsx:1` (import)
- Modify: `src/routes/index.jsx:48-51` (declaração do ref + `NavigationContainer`)

- [ ] **Step 1: Importar `createNavigationContainerRef` e criar o ref**

Troque a linha 1:

```js
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
```

Troque as linhas 48-51 (de `const { Navigator, Screen } = ...` até a abertura do `NavigationContainer`):

```js
const { Navigator, Screen } = createNativeStackNavigator();

export const navigationRef = createNavigationContainerRef();

export const Routes = () => (
    <NavigationContainer ref={navigationRef} linking={linking}>
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/routes/index.jsx`
Expected: sem novos erros além da baseline

- [ ] **Step 3: Commit**

```bash
git add src/routes/index.jsx
git commit -m "feat: export navigationRef for navigation outside the component tree"
```

---

### Task 6: `App.jsx` — banner correto, supressão no chat aberto e navegação ao tocar

**Files:**
- Modify: `App.jsx:19` (import de `Notifications` já existe, adicionar novos imports)
- Modify: `App.jsx:36-42` (handler)
- Modify: `App.jsx` (novo `useEffect` de navegação)

- [ ] **Step 1: Adicionar imports necessários**

Depois da linha `import { InternetInfo } from "./src/components/InternetInfo";` (linha 34), adicione:

```js
import { Routes, navigationRef } from "./src/routes";
import { dataRoutes } from "./src/routes/dataRoutes";
import { getActiveChatId } from "./src/utils/activeChatTracker";
```

E remova a linha antiga `import { Routes } from "./src/routes";` (linha 28) — ela vira redundante com a nova acima. (Se preferir manter só uma linha, uma alternativa é editar a linha 28 diretamente para `import { Routes, navigationRef } from "./src/routes";` e não duplicar o import.)

- [ ] **Step 2: Corrigir o handler de notificação pra usar os campos atuais + suprimir quando o chat está aberto**

Troque o bloco (linhas 36-42):

```js
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const chatId = notification.request?.content?.data?.chatId;
        const isActiveChat = Boolean(chatId) && chatId === getActiveChatId();

        return {
            shouldShowBanner: !isActiveChat,
            shouldShowList: !isActiveChat,
            shouldPlaySound: !isActiveChat,
            shouldSetBadge: !isActiveChat,
        };
    },
});
```

- [ ] **Step 3: Adicionar navegação ao tocar na notificação (app quente e app frio)**

Dentro do componente `App`, logo depois do `useEffect` de permissões (que termina em `}, []);` — no arquivo atual esse é o `useEffect` das linhas 75-115), adicione um novo `useEffect`:

```jsx
    useEffect(() => {
        const navigateToChatFromNotificationData = (data) => {
            if (!data || data.type !== "chat" || !data.publicationId) return;

            let attempts = 0;
            const tryNavigate = () => {
                if (navigationRef.isReady()) {
                    navigationRef.navigate(dataRoutes.publicationChat, {
                        publication: { id: data.publicationId },
                        sellerId: data.sellerId,
                        buyerId: data.buyerId,
                        sellerName: data.sellerName,
                        buyerName: data.buyerName,
                        chatId: data.chatId,
                    });
                    return;
                }
                attempts += 1;
                if (attempts < 10) setTimeout(tryNavigate, 300);
            };
            tryNavigate();
        };

        Notifications.getLastNotificationResponseAsync().then((response) => {
            navigateToChatFromNotificationData(response?.notification?.request?.content?.data);
        });

        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            navigateToChatFromNotificationData(response?.notification?.request?.content?.data);
        });

        return () => subscription.remove();
    }, []);
```

Esse efeito cobre dois casos:
- **App já aberto (quente):** o usuário toca na notificação → `addNotificationResponseReceivedListener` dispara → navega.
- **App fechado (frio):** o app abre por causa do toque → `getLastNotificationResponseAsync()` no mount recupera a resposta que originou a abertura → navega (com retry porque o `NavigationContainer` pode ainda não estar pronto nos primeiros ~300ms-3s de boot).

- [ ] **Step 4: Lint**

Run: `npx eslint App.jsx`
Expected: sem novos erros além da baseline

- [ ] **Step 5: Commit**

```bash
git add App.jsx
git commit -m "fix: show chat notification banner in foreground, navigate on tap, suppress when chat is open"
```

---

### Task 7: `PublicationChat/styles.js` — Avatar e footer de leitura da bolha

**Files:**
- Modify: `src/pages/PublicationChat/styles.js:33-38` (depois de `HeaderSubtitle`)
- Modify: `src/pages/PublicationChat/styles.js:63-68` (depois de `BubbleTime`)

- [ ] **Step 1: Adicionar `Avatar`/`AvatarText` depois de `HeaderSubtitle`**

Depois do bloco `HeaderSubtitle` (linha 38), adicione:

```js
export const Avatar = styled.View`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #f55b1f;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
`;

export const AvatarText = styled(Text)`
    color: #fff;
    font-weight: 800;
    font-size: ${({ theme }) => theme.size.fontSize(15)};
`;
```

- [ ] **Step 2: Adicionar `BubbleFooter` depois de `BubbleTime`**

Depois do bloco `BubbleTime` (linha 68), adicione:

```js
export const BubbleFooter = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
`;
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/pages/PublicationChat/styles.js`
Expected: sem novos erros

- [ ] **Step 4: Commit**

```bash
git add src/pages/PublicationChat/styles.js
git commit -m "feat: add avatar and bubble footer styles to PublicationChat"
```

---

### Task 8: `PublicationChat/index.jsx` — avatar no header, check de leitura, chat ativo

**Files:**
- Modify: `src/pages/PublicationChat/index.jsx` (imports, estado, efeitos, `renderItem`, header)

- [ ] **Step 1: Atualizar imports**

Troque o bloco de import de `./styles` (linhas 14-38 do arquivo atual) adicionando `Avatar`, `AvatarText`, `BubbleFooter`:

```js
import {
    AttachButton,
    Avatar,
    AvatarText,
    AudioBubble,
    AudioDuration,
    AudioPlayButton,
    AudioWave,
    Bubble,
    BubbleFooter,
    BubbleText,
    BubbleTime,
    BubbleWrap,
    ChatInput,
    Container,
    FullscreenClose,
    FullscreenModal,
    Header,
    HeaderInfo,
    HeaderSubtitle,
    HeaderTitle,
    ImageBubble,
    InputRow,
    RecordButton,
    RecordingIndicator,
    RecordingText,
    SendButton,
} from "./styles";
```

Logo depois dos imports de controllers (depois da linha `import { uploadChatImage } from "../../controllers/Chat/uploadImage";`, linha 13), adicione:

```js
import { getMessageReadStatus } from "../../utils/chatReadStatus";
import { setActiveChatId } from "../../utils/activeChatTracker";
```

- [ ] **Step 2: Novo estado `lastSeenAt`**

Depois de `const [publicationData, setPublicationData] = useState(publication);` (linha 49), adicione:

```js
    const [lastSeenAt, setLastSeenAt] = useState({});
```

- [ ] **Step 3: Calcular `otherUserId`**

Depois da linha `const buyerId = paramBuyerId ?? myId;` (linha 68), adicione:

```js
    const otherUserId = myId === sellerId ? buyerId : sellerId;
```

- [ ] **Step 4: Passar `onChatMeta` pro `subscribeToChat` existente**

O `useEffect` de subscribeToChat (linhas 123-137 do arquivo atual) fica:

```js
    useEffect(() => {
        if (!publication.id || !buyerId) return;
        const unsub = subscribeToChat({
            publicationId: publication.id,
            buyerId,
            onMessages: (msgs) => {
                messagesReadyRef.current = true;
                setMessages([...msgs].reverse());
                if (myId && resolvedChatId) {
                    markChatAsSeen(resolvedChatId, myId);
                }
            },
            onChatMeta: (meta) => setLastSeenAt(meta?.lastSeenAt || {}),
        });
        return unsub;
    }, [publication.id, buyerId]);
```

- [ ] **Step 5: Marcar/limpar o chat ativo (usado pela supressão de notificação)**

Logo depois desse `useEffect` (antes do `useEffect(() => { return () => { stopSound(); }; }, []);` da linha 139-141), adicione:

```js
    useEffect(() => {
        if (!resolvedChatId) return undefined;
        setActiveChatId(resolvedChatId);
        return () => setActiveChatId(null);
    }, [resolvedChatId]);
```

- [ ] **Step 6: Componente local `ReadReceipt`**

Antes de `const renderItem = ({ item }) => {` (linha 319), adicione:

```jsx
    const ReadReceipt = ({ status }) => (
        <View style={{ flexDirection: "row" }}>
            <Feather
                name="check"
                size={12}
                color={status === "read" ? "#ffd9c2" : "rgba(255,255,255,0.7)"}
            />
            {status === "read" && (
                <Feather
                    name="check"
                    size={12}
                    color="#ffd9c2"
                    style={{ marginLeft: -7 }}
                />
            )}
        </View>
    );
```

- [ ] **Step 7: Usar `BubbleFooter` + `ReadReceipt` nas 3 variações de mensagem**

Na branch de imagem (linhas 323-334), troque a linha do `BubbleTime`:

```jsx
        if (item.imageUrl) {
            return (
                <BubbleWrap isMine={isMine}>
                    <Bubble isMine={isMine} style={{ padding: 4 }}>
                        <TouchableOpacity onPress={() => setFullscreenImage(item.imageUrl)} activeOpacity={0.9}>
                            <ImageBubble source={{ uri: item.imageUrl }} resizeMode="cover" />
                        </TouchableOpacity>
                        <BubbleFooter style={{ paddingHorizontal: 6 }}>
                            <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                            {isMine && <ReadReceipt status={getMessageReadStatus(item, lastSeenAt, otherUserId)} />}
                        </BubbleFooter>
                    </Bubble>
                </BubbleWrap>
            );
        }
```

Na branch de áudio (linhas 336-351):

```jsx
        if (item.audioUrl) {
            return (
                <BubbleWrap isMine={isMine}>
                    <Bubble isMine={isMine}>
                        <AudioBubble>
                            <AudioPlayButton onPress={() => playAudio(item.id, item.audioUrl)} activeOpacity={0.7}>
                                <Feather name={isPlaying ? "pause" : "play"} size={20} color={isMine ? "#fff" : "#f55b1f"} />
                            </AudioPlayButton>
                            <AudioWave isMine={isMine} />
                            <AudioDuration isMine={isMine}>{formatDuration(item.audioDuration)}</AudioDuration>
                        </AudioBubble>
                        <BubbleFooter>
                            <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                            {isMine && <ReadReceipt status={getMessageReadStatus(item, lastSeenAt, otherUserId)} />}
                        </BubbleFooter>
                    </Bubble>
                </BubbleWrap>
            );
        }
```

Na branch de texto (linhas 353-360):

```jsx
        return (
            <BubbleWrap isMine={isMine}>
                <Bubble isMine={isMine}>
                    <BubbleText isMine={isMine}>{item.text}</BubbleText>
                    <BubbleFooter>
                        <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                        {isMine && <ReadReceipt status={getMessageReadStatus(item, lastSeenAt, otherUserId)} />}
                    </BubbleFooter>
                </Bubble>
            </BubbleWrap>
        );
```

- [ ] **Step 8: Avatar no header**

O bloco do `Header` (linhas 365-383) fica:

```jsx
            <Header>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <Avatar>
                    <AvatarText>{(headerName?.[0] ?? "?").toUpperCase()}</AvatarText>
                </Avatar>
                <HeaderInfo>
                    <HeaderTitle numberOfLines={1}>
                        {headerName}
                    </HeaderTitle>
                    {(publicationData?.location || publicationData?.shrimps?.length > 0) ? (
                        <HeaderSubtitle numberOfLines={1}>
                            {publicationData?.location ? `📍 ${publicationData.location}` : ""}
                            {publicationData?.location && publicationData?.shrimps?.length > 0 ? "  ·  " : ""}
                            {publicationData?.shrimps?.length > 0
                                ? `🦐 ${publicationData.shrimps.map((s) => `${s.grammage}g/${s.kilo}kg`).join(" · ")}`
                                : ""}
                        </HeaderSubtitle>
                    ) : null}
                </HeaderInfo>
            </Header>
```

Isso usa uma variável nova `headerName` em vez de repetir o ternário duas vezes. Adicione essa variável logo antes do `return (` da função (antes da linha 363):

```js
    const headerName = myId === sellerId
        ? (resolvedBuyerName || buyerName || "Comprador")
        : (resolvedSellerName || "Produtor");

    return (
```

- [ ] **Step 9: Lint**

Run: `npx eslint src/pages/PublicationChat/index.jsx`
Expected: sem novos erros além da baseline (compare com `git stash && npx eslint src/pages/PublicationChat/index.jsx` se quiser confirmar)

- [ ] **Step 10: Rodar a suíte de testes**

Run: `yarn test:unit`
Expected: todos os testes passam (nenhum teste importa este arquivo diretamente, é uma checagem de regressão geral)

- [ ] **Step 11: Commit**

```bash
git add src/pages/PublicationChat/index.jsx
git commit -m "feat: add avatar and read receipts to PublicationChat"
```

---

### Task 9: `MyChats/styles.js` — abas de filtro e linha do check de leitura

**Files:**
- Modify: `src/pages/MyChats/styles.js` (adicionar 4 styled components novos)

- [ ] **Step 1: Adicionar os styled components**

Depois do bloco `HeaderSub` (linha 29 do arquivo atual), adicione:

```js
export const FilterTabsRow = styled.View`
    flex-direction: row;
    gap: 8px;
    padding: 12px 16px 4px;
    background-color: #fff;
`;

export const FilterTab = styled.TouchableOpacity`
    padding: 6px 14px;
    border-radius: 16px;
    background-color: ${({ active }) => (active ? "#f55b1f" : "#f0f5fb")};
`;

export const FilterTabText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 700;
    color: ${({ active }) => (active ? "#fff" : "#5f7b94")};
`;
```

Depois do bloco `ConvRight` (linha 79-81 do arquivo atual), adicione:

```js
export const ConvTimeRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 4px;
`;
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/pages/MyChats/styles.js`
Expected: sem novos erros

- [ ] **Step 3: Commit**

```bash
git add src/pages/MyChats/styles.js
git commit -m "feat: add filter tabs and read-receipt row styles to MyChats"
```

---

### Task 10: `MyChats/index.jsx` — filtro Todas/Não lidas, check de leitura, corrigir prefixo "Você:"

**Files:**
- Modify: `src/pages/MyChats/index.jsx`

- [ ] **Step 1: Atualizar imports**

Troque as linhas 1-26 do arquivo atual:

```js
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { subscribeMyChats } from "../../controllers/Chat";
import { dataRoutes } from "../../routes/dataRoutes";
import { getMessageReadStatus } from "../../utils/chatReadStatus";
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
    ConvTimeRow,
    Container,
    EmptyText,
    EmptyWrap,
    FilterTab,
    FilterTabsRow,
    FilterTabText,
    ScreenHeader,
    HeaderSub,
    HeaderTitle,
    UnreadBadge,
    UnreadBadgeText,
} from "./styles";
```

- [ ] **Step 2: Componente local `ChatListReadReceipt`**

Depois da função `isUnread` (linha 43-51 do arquivo atual) e antes de `export const MyChats`, adicione:

```jsx
const ChatListReadReceipt = ({ status }) => (
    <View style={{ flexDirection: "row" }}>
        <Feather
            name="check"
            size={12}
            color={status === "read" ? "#f55b1f" : "#8fa3b2"}
        />
        {status === "read" && (
            <Feather
                name="check"
                size={12}
                color="#f55b1f"
                style={{ marginLeft: -7 }}
            />
        )}
    </View>
);
```

- [ ] **Step 3: Estado do filtro + função de id do outro usuário**

Dentro de `export const MyChats = ({ navigation }) => {`, depois de `const safeId = myId?.replace(/[@.]/g, "_") ?? "";` (linha 58), adicione:

```js
    const [filter, setFilter] = useState("all");
```

Depois da função `getOtherUser` (linhas 78-83), adicione:

```js
    const getOtherUserId = (chat) => (chat.sellerId === myId ? chat.buyerId : chat.sellerId);
```

- [ ] **Step 4: Lista filtrada**

Depois de `const unreadTotal = chats.filter((c) => isUnread(c, safeId)).length;` (linha 76), adicione:

```js
    const filteredChats = filter === "unread"
        ? chats.filter((c) => isUnread(c, safeId))
        : chats;
```

- [ ] **Step 5: Renderizar as abas e usar a lista filtrada**

Troque o bloco final do `return` (linhas 104-156 do arquivo atual):

```jsx
    return (
        <Container>
            <ScreenHeader>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <HeaderTitle>Minhas Conversas</HeaderTitle>
                {unreadTotal > 0 ? (
                    <HeaderSub>
                        {unreadTotal} mensagem{unreadTotal > 1 ? "s" : ""} não lida{unreadTotal > 1 ? "s" : ""}
                    </HeaderSub>
                ) : (
                    <HeaderSub />
                )}
            </ScreenHeader>
            {chats.length > 0 && (
                <FilterTabsRow>
                    <FilterTab active={filter === "all"} onPress={() => setFilter("all")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "all"}>Todas</FilterTabText>
                    </FilterTab>
                    <FilterTab active={filter === "unread"} onPress={() => setFilter("unread")} activeOpacity={0.7}>
                        <FilterTabText active={filter === "unread"}>
                            Não lidas{unreadTotal > 0 ? ` (${unreadTotal})` : ""}
                        </FilterTabText>
                    </FilterTab>
                </FilterTabsRow>
            )}
            {chats.length === 0 ? (
                <EmptyWrap>
                    <Feather name="message-circle" size={48} color="#c8d8e8" />
                    <EmptyText>Você ainda não tem conversas</EmptyText>
                </EmptyWrap>
            ) : filteredChats.length === 0 ? (
                <EmptyWrap>
                    <Feather name="check-circle" size={48} color="#c8d8e8" />
                    <EmptyText>Nenhuma conversa não lida</EmptyText>
                </EmptyWrap>
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const other = getOtherUser(item);
                        const unread = isUnread(item, safeId);
                        const lastMessageIsMine = item.lastMessageSenderId === myId;
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
                                        {lastMessageIsMine ? "Você: " : ""}{item.lastMessage || ""}
                                    </ConvLastMsg>
                                </ConvInfo>
                                <ConvRight>
                                    <ConvTimeRow>
                                        {lastMessageIsMine && item.lastMessage ? (
                                            <ChatListReadReceipt
                                                status={getMessageReadStatus(
                                                    { createdAt: item.lastMessageAt },
                                                    item.lastSeenAt,
                                                    getOtherUserId(item),
                                                )}
                                            />
                                        ) : null}
                                        <ConvTime>{formatTime(item.lastMessageAt)}</ConvTime>
                                    </ConvTimeRow>
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

- [ ] **Step 6: Lint**

Run: `npx eslint src/pages/MyChats/index.jsx`
Expected: sem novos erros além da baseline

- [ ] **Step 7: Rodar a suíte de testes**

Run: `yarn test:unit`
Expected: todos os testes passam

- [ ] **Step 8: Commit**

```bash
git add src/pages/MyChats/index.jsx
git commit -m "feat: add read receipts and unread filter tabs to MyChats"
```

---

## Verificação manual (fora do escopo de teste automatizado)

Não há setup de teste de componente React Native neste repo (sem Jest/RNTL configurado), então o seguinte precisa ser conferido manualmente no simulador/dispositivo depois que todos os tasks estiverem aplicados:

1. Abrir uma conversa em `PublicationChat` com dois usuários de teste — mandar mensagem de um lado, ver ✓ cinza; abrir a conversa do outro lado, voltar pro primeiro e ver o ✓✓ virar laranja.
2. Lista `MyChats`: alternar entre "Todas" e "Não lidas", confirmar que o filtro funciona e a contagem bate com o badge do header.
3. Prévia da última mensagem em `MyChats` mostra "Você: " só quando a última mensagem foi realmente enviada por mim (testar dos dois lados de uma conversa).
4. Com o app em primeiro plano e **fora** da tela de chat: mandar mensagem do outro usuário → banner de notificação aparece.
5. Com o app em primeiro plano e **dentro** daquele chat específico: mandar mensagem do outro usuário → notificação NÃO aparece (chat já está sendo visto).
6. Tocar numa notificação de chat com o app em background → abre direto na conversa certa.
7. Tocar numa notificação de chat com o app fechado (cold start) → abre e navega até a conversa certa (pode levar 1-2s a mais por causa do retry de `navigationRef.isReady()`).
