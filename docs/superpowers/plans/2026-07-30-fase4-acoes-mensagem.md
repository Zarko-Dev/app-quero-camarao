# Fase 4 — Ações de Mensagem + Entrega + Responder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menu de segurar mensagem (responder/copiar/encaminhar/apagar-pra-mim/apagar-pra-todos/denunciar), estados 🕐/✓/✓✓/✓✓-verde com "entregue" confirmado pelo aparelho do destinatário, resposta com prévia (menu + swipe).

**Architecture:** Ver spec `docs/superpowers/specs/2026-07-30-fase4-acoes-mensagem-design.md`. Novos: `src/utils/messageStatus.js`, `src/utils/messagePreview.js`, `src/controllers/Chat/messageActions.js`, `src/pages/PublicationChat/MessageActionsSheet.jsx`, `src/pages/PublicationChat/ForwardModal.jsx`. Modificados: `models.js` (+reports), `Chat/index.js` (replyTo/forwarded/pending/getMyChats), `PublicationChat/index.jsx` + `styles.js`.

**Tech Stack:** expo-clipboard ~7.1, react-native-gesture-handler ~2.24 (`Swipeable`), Firestore `writeBatch`. Testes `node --test tests/*.test.cjs`; baseline 155/152/3.

---

### Task 1: Utils `messageStatus` + `messagePreview` (TDD)

**Files:** Create `src/utils/messageStatus.js`, `src/utils/messagePreview.js`; tests `tests/messageStatus.test.cjs`, `tests/messagePreview.test.cjs`.

- [ ] **Step 1: Testes**

```js
// tests/messageStatus.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { getMessageDeliveryStatus } = require("../src/utils/messageStatus");

const ts = (ms) => ({ toMillis: () => ms });

test("pending quando hasPendingWrites", () => {
    assert.equal(
        getMessageDeliveryStatus({ pending: true, createdAt: null }, {}, "u@x.com"),
        "pending",
    );
});

test("sent sem entrega nem leitura", () => {
    assert.equal(
        getMessageDeliveryStatus({ createdAt: ts(100), deliveredTo: {} }, {}, "u@x.com"),
        "sent",
    );
});

test("delivered com deliveredTo do outro (chave sanitizada)", () => {
    assert.equal(
        getMessageDeliveryStatus(
            { createdAt: ts(100), deliveredTo: { u_x_com: ts(150) } },
            {},
            "u@x.com",
        ),
        "delivered",
    );
});

test("read quando lastSeenAt do outro >= createdAt (ganha de delivered)", () => {
    assert.equal(
        getMessageDeliveryStatus(
            { createdAt: ts(100), deliveredTo: { u_x_com: ts(150) } },
            { u_x_com: ts(200) },
            "u@x.com",
        ),
        "read",
    );
});

test("não lida se visto antes da mensagem", () => {
    assert.equal(
        getMessageDeliveryStatus(
            { createdAt: ts(300), deliveredTo: { u_x_com: ts(350) } },
            { u_x_com: ts(200) },
            "u@x.com",
        ),
        "delivered",
    );
});
```

```js
// tests/messagePreview.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { buildMessagePreview } = require("../src/utils/messagePreview");

test("texto curto passa direto", () => {
    assert.equal(buildMessagePreview({ text: "olá" }), "olá");
});

test("texto longo trunca em 80 com reticências", () => {
    const long = "a".repeat(100);
    assert.equal(buildMessagePreview({ text: long }), `${"a".repeat(77)}...`);
});

test("tipos de mídia", () => {
    assert.equal(buildMessagePreview({ imageUrl: "x" }), "📷 Foto");
    assert.equal(buildMessagePreview({ audioUrl: "x" }), "🎵 Áudio");
    assert.equal(buildMessagePreview({ fileUrl: "x" }), "📎 Documento");
});

test("vazio vira string vazia", () => {
    assert.equal(buildMessagePreview({}), "");
    assert.equal(buildMessagePreview(null), "");
});
```

- [ ] **Step 2:** FAIL esperado; implementar:

```js
// src/utils/messageStatus.js
const toMillis = (value) => {
    if (!value) return null;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") return value.toDate().getTime();
    return null;
};

const sanitizeUserId = (userId) => String(userId).replace(/[@.]/g, "_");

const getMessageDeliveryStatus = (message, lastSeenAt, otherUserId) => {
    if (message?.pending) return "pending";

    const safeOther = sanitizeUserId(otherUserId);
    const seenMs = toMillis(lastSeenAt?.[safeOther]);
    const msgMs = toMillis(message?.createdAt);

    if (seenMs !== null && msgMs !== null && msgMs <= seenMs) return "read";
    if (message?.deliveredTo?.[safeOther]) return "delivered";
    return "sent";
};

module.exports = { getMessageDeliveryStatus };
```

```js
// src/utils/messagePreview.js
const buildMessagePreview = (message) => {
    if (!message) return "";
    if (message.audioUrl) return "🎵 Áudio";
    if (message.imageUrl) return "📷 Foto";
    if (message.fileUrl) return "📎 Documento";
    const text = String(message.text || "");
    if (text.length <= 80) return text;
    return `${text.slice(0, 77)}...`;
};

module.exports = { buildMessagePreview };
```

- [ ] **Step 3:** PASS; lint limpo; commit `feat: add messageStatus and messagePreview utils`.

---

### Task 2: Controller — `messageActions.js`, models, sendChatMessage, subscribe pending, getMyChats

**Files:** Modify `src/services/Firebase/models.js`, `src/controllers/Chat/index.js`; Create `src/controllers/Chat/messageActions.js`.

- [ ] **Step 1:** `models.js`: adicionar `reports: "reports",` na lista (ler o arquivo para seguir o formato).

- [ ] **Step 2:** `src/controllers/Chat/messageActions.js`:

```js
import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

const safeId = (userId) => String(userId).replace(/[@.]/g, "_");

const messageRef = (chatId, messageId) =>
    doc(firestore, models.chats, chatId, "messages", messageId);

export const deleteMessageForMe = async (chatId, messageId, userId) => {
    try {
        await updateDoc(messageRef(chatId, messageId), {
            [`deletedFor.${safeId(userId)}`]: true,
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const deleteMessageForEveryone = async (chatId, messageId) => {
    try {
        await updateDoc(messageRef(chatId, messageId), {
            deletedForEveryone: true,
            deletedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const reportMessage = async ({ chatId, messageId, reportedBy, reportedUserId, preview }) => {
    try {
        await addDoc(collection(firestore, models.reports), {
            chatId,
            messageId,
            reportedBy,
            reportedUserId,
            preview: preview || "",
            createdAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};

export const markMessagesDelivered = async (chatId, messageIds, userId) => {
    try {
        const field = `deliveredTo.${safeId(userId)}`;
        for (let i = 0; i < messageIds.length; i += 450) {
            const batch = writeBatch(firestore);
            messageIds.slice(i, i + 450).forEach((messageId) => {
                batch.update(messageRef(chatId, messageId), {
                    [field]: serverTimestamp(),
                });
            });
            await batch.commit();
        }
        return true;
    } catch (error) {
        Sentry.captureException(error);
        return false;
    }
};
```

(Se o eslint reclamar de `await` em loop (`no-await-in-loop`), trocar por acumular promises e `Promise.all`.)

- [ ] **Step 3:** `Chat/index.js`:
  - `sendChatMessage` params: `replyTo = null,` e `forwarded = false,` (após `publicationSummary`). No `msgData`, após a cadeia if/else de tipo: `if (replyTo) msgData.replyTo = replyTo;` e `if (forwarded) msgData.forwarded = true;`.
  - `subscribeToChat`: o `onSnapshot` de mensagens ganha `{ includeMetadataChanges: true }` como 2º arg (query, options, callback, error) e o map vira `({ id: d.id, pending: d.metadata.hasPendingWrites, ...d.data() })`.
  - Nova função `getMyChats(userId)` (one-shot, mesmo merge/dedup/sort do `subscribeMyChats`, com `getDocs`):

```js
export const getMyChats = async (userId) => {
    try {
        const ref = collection(firestore, models.chats);
        const [buyerSnap, sellerSnap] = await Promise.all([
            getDocs(query(ref, where("buyerId", "==", userId))),
            getDocs(query(ref, where("sellerId", "==", userId))),
        ]);
        const seen = new Set();
        const all = [...buyerSnap.docs, ...sellerSnap.docs]
            .filter((d) => {
                if (seen.has(d.id)) return false;
                seen.add(d.id);
                return true;
            })
            .map((d) => ({ id: d.id, ...d.data() }));
        all.sort((a, b) => (b.lastMessageAt?.toMillis?.() ?? 0) - (a.lastMessageAt?.toMillis?.() ?? 0));
        return all;
    } catch (error) {
        Sentry.captureException(error);
        return [];
    }
};
```

- [ ] **Step 4:** Lint (baselines; nada novo) + testes (baseline) + commit `feat: message actions controller, delivery marks, reply/forward fields`.

---

### Task 3: Componentes `MessageActionsSheet` + `ForwardModal`

**Files:** Create `src/pages/PublicationChat/MessageActionsSheet.jsx`, `src/pages/PublicationChat/ForwardModal.jsx`.

Contratos (implementação livre seguindo padrões do arquivo/styles do app — Modal RN transparente, fundo `rgba(0,0,0,0.4)`, sheet branco com cantos 16px em cima, ancorado embaixo):

**MessageActionsSheet** props: `{ visible, onClose, actions }` onde `actions = [{ key, label, icon, destructive?, onPress }]`. Renderiza lista de linhas (ícone Feather + label, 48px de altura, destructive em `#e53935`), fecha no backdrop. Sem lógica de negócio — o pai monta as ações.

**ForwardModal** props: `{ visible, onClose, chats, onSelect, currentChatId }`. Lista as conversas (exceto `currentChatId`): avatar inicial + nome do outro participante (`sellerName`/`buyerName` — o pai passa `myId` OU os chats já vêm com `displayName` montado pelo pai; decisão: o pai monta `displayName` e passa `chats` prontos `[{ id, displayName, ...chatDoc }]`). Header "Encaminhar para...", vazio "Nenhuma outra conversa". `onSelect(chat)`.

- [ ] **Step:** Implementar, lint limpo, commit `feat: message actions sheet and forward modal components`.

---

### Task 4: Integração no `PublicationChat`

**Files:** Modify `src/pages/PublicationChat/index.jsx`, `src/pages/PublicationChat/styles.js`.

- [ ] **Step 1 — styles.js:** novos styled: `ReplyBar` (linha acima do input: fundo `#e9f5e4`, borda esquerda 3px `#4BB543`, padding 8, row), `ReplyBarText` (13, `#36536e`, flex 1), `QuoteBlock` (dentro da bolha: fundo `rgba(0,0,0,0.05)`, borda esquerda 3px `#4BB543`, radius 6, padding 6, margin-bottom 4), `QuoteName` (11 bold `#4BB543`), `QuoteText` (11, `#5f7b94`), `ForwardedLabel` (10 itálico `#8fa3b2`), `DeletedText` (13 itálico `#8fa3b2`).

- [ ] **Step 2 — index.jsx:**
  - Imports: `* as Clipboard from "expo-clipboard"`, `{ Swipeable } from "react-native-gesture-handler"`, `Toast from "react-native-toast-message"`, utils (`getMessageDeliveryStatus`, `buildMessagePreview`), controller (`deleteMessageForMe`, `deleteMessageForEveryone`, `reportMessage`, `markMessagesDelivered`, `getMyChats` do index), componentes novos, styled novos.
  - `ReadReceipt` (module scope) vira 4 estados: `pending` → `<Feather name="clock" size={11} color="#8fa3b2" />`; `sent` → 1 check `#8fa3b2`; `delivered` → 2 checks `#8fa3b2`; `read` → 2 checks `#4BB543`. Todos os call sites trocam `getMessageReadStatus(item, lastSeenAt, otherUserId)` por `getMessageDeliveryStatus(item, lastSeenAt, otherUserId)` (remover import antigo se ficar sem uso).
  - Estados novos: `actionsFor` (mensagem do sheet), `replyingTo`, `forwardingMsg`, `forwardChats`.
  - Ref `deliveredMarkedRef = useRef(new Set())`. No `onMessages` do subscribe: após `setMessages`, coletar `msgs.filter((m) => m.senderId !== myId && !m.pending && !m.deliveredTo?.[mySafeId] && !deliveredMarkedRef.current.has(m.id))`; se houver e `myId`, adicionar ids ao Set e `markMessagesDelivered(resolvedChatId, ids, myId)` (mySafeId = `String(myId).replace(/[@.]/g, "_")`, calculado dentro do callback).
  - Filtro de render: `const visibleMessages = messages.filter((m) => !m.deletedFor?.[mySafeIdMemo])` (derivar `mySafeIdMemo` do myId no corpo) — a FlatList usa `visibleMessages`.
  - Long-press: cada bolha (nas 4 variantes) envolvida por `onLongPress={() => !item.deletedForEveryone && setActionsFor(item)}` — nas variantes com TouchableOpacity interno (imagem/arquivo) adicionar `onLongPress` no touchable interno; nas de texto/áudio envolver o conteúdo da `Bubble` num `TouchableOpacity activeOpacity={0.9}` com só onLongPress (sem onPress).
  - Tombstone: no topo do `renderItem`, `if (item.deletedForEveryone)` retorna bolha com `<DeletedText>🚫 Esta mensagem foi apagada</DeletedText>` + footer só com horário.
  - QuoteBlock: em todas as variantes, antes do conteúdo, `{item.replyTo ? (<QuoteBlock><QuoteName>{quoteName(item.replyTo)}</QuoteName><QuoteText numberOfLines={2}>{item.replyTo.preview}</QuoteText></QuoteBlock>) : null}` onde `quoteName(r) = r.senderId === myId ? "Você" : headerName`.
  - ForwardedLabel: `{item.forwarded ? <ForwardedLabel>↪ Encaminhada</ForwardedLabel> : null}` antes do conteúdo.
  - Swipe: envolver o `<BubbleWrap>` retornado de cada variante num `<Swipeable renderLeftActions={...ícone corner-up-left 20 cinza...} leftThreshold={40} friction={2} onSwipeableWillOpen={() => { swipeRef fecha; setReplyingTo(item); }}>` — usar um callback-ref por item para poder fechar (`ref={(r) => { if (r) swipeableRefs.current[item.id] = r; }}` e `swipeableRefs.current[item.id]?.close()`); não aplicar em tombstones.
  - ReplyBar acima do InputRow quando `replyingTo`: nome (`replyingTo.senderId === myId ? "Você" : headerName`) + `buildMessagePreview(replyingTo)` + X (`setReplyingTo(null)`).
  - `handleSend` inclui `...(replyingTo ? { replyTo: { id: replyingTo.id, senderId: replyingTo.senderId, preview: buildMessagePreview(replyingTo) } } : {})` e limpa `setReplyingTo(null)` após enviar.
  - Sheet de ações montado com base em `actionsFor`: Responder → `setReplyingTo(actionsFor)`; Copiar (só `actionsFor?.text`) → `Clipboard.setStringAsync(actionsFor.text)` + Toast "Copiado"; Encaminhar → `getMyChats(myId)` → montar `displayName` (`c.sellerId === myId ? c.buyerName : c.sellerName`) → `setForwardChats(...)`, `setForwardingMsg(actionsFor)`; Apagar para mim → confirm `Alert.alert` → `deleteMessageForMe(resolvedChatId, id, myId)`; Apagar para todos (só `actionsFor?.senderId === myId`) → confirm → `deleteMessageForEveryone`; Denunciar (só recebidas) → confirm → `reportMessage({ chatId: resolvedChatId, messageId, reportedBy: myId, reportedUserId: actionsFor.senderId, preview: buildMessagePreview(actionsFor) })` + Toast "Denúncia enviada". Toda ação fecha o sheet.
  - `onSelect` do ForwardModal: `sendChatMessage` pro chat destino com conteúdo da mensagem (text/imageUrl/audioUrl+audioDuration/fileUrl+fileName+fileSize), `forwarded: true`, ids do chat destino (`publicationId: chat.publicationId, sellerId: chat.sellerId, buyerId: chat.buyerId, senderId: myId, sellerName: chat.sellerName || "", buyerName: chat.buyerName || "", publicationTitle: chat.publicationTitle || "", publicationLocation: chat.publicationLocation || "", publicationSummary: chat.publicationSummary || ""`); fechar modal; Toast "Mensagem encaminhada".

- [ ] **Step 3:** Lint sem novos vs baseline (~25 index / 1 styles); `node --test` baseline; commit `feat: message long-press actions, delivery states, reply and forward in chat`.

---

## Verificação manual
Menu completo por tipo de mensagem; copiar; apagar pra mim/todos; denunciar cria doc em `reports`; responder via menu e swipe com citação; encaminhar; sequência 🕐→✓→✓✓→✓✓verde com 2 dispositivos; swipe não quebra scroll/toques; tombstone dos dois lados.
