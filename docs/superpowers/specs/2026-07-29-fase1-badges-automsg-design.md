# Fase 1 — Badges de não lidas + trava da mensagem automática — Design Spec

## Goal
Quatro entregas curtas construídas sobre o chat já existente:
1. Ícone de conversas da home maior, com círculo verde, ícone branco e badge vermelho de não lidas (1–99, depois "99+").
2. Item "Conversas" no menu lateral com o mesmo contador.
3. Badge de não lidas no ícone do aplicativo no sistema (iOS sempre; Android quando o launcher suportar), sincronizado com a leitura das mensagens.
4. Mensagem automática do botão CHAT enviada no máximo uma vez por cliente+anúncio, com trava persistente no banco (template atual com emojis mantido).

Contexto: o app já tem `useUnreadChatsCount` (hook com onSnapshot em tempo real), o botão de chat no `Header` com badge verde pequeno, push de mensagem nova com payload `data`, e auto-send guardado apenas por "o chat já tem mensagens".

---

## A. Ícone de conversas na home

**Arquivos:** `src/components/Header/index.jsx`, `src/components/Header/styles.js`, novo util `src/utils/formatUnreadBadge.js` + teste.

- `ChatButton` vira um círculo verde: `width/height 40px`, `border-radius: 20px`, `background-color: ${({ theme }) => theme.colors.green}` (usar o verde do theme, mesmo já usado no `ChatBadge` atual), centralizado.
- Ícone `Feather message-circle` branco, `size 22`, dentro do círculo (sem `position: absolute` — o truque atual existia para sobrepor o Badge do paper; a nova estrutura usa um wrapper).
- Badge vermelho (`background-color: #e53935`) posicionado absoluto no canto superior direito do círculo (`top: -4px; right: -4px`), `min-width 18px`, texto branco bold ~10px, `paddingHorizontal 4`, `border-radius 9`. Substitui o `Badge` do react-native-paper por um `View`+`Text` styled próprio (`UnreadCountBadge`/`UnreadCountText`) para controlar o "99+" e o posicionamento.
- Texto do badge: `formatUnreadBadge(count)` → `""` p/ count <= 0 (badge oculto), `String(count)` p/ 1–99, `"99+"` p/ count > 99.
- Comportamento de toque inalterado (`navigation.navigate(dataRoutes.myChats)`), visível só autenticado.

### `src/utils/formatUnreadBadge.js` (CJS, padrão do repo p/ utils testáveis)
```js
const formatUnreadBadge = (count) => {
    const n = Number(count);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n > 99) return "99+";
    return String(n);
};

module.exports = { formatUnreadBadge };
```
Teste `tests/formatUnreadBadge.test.cjs`: 0/negativo/NaN → "", 1 → "1", 99 → "99", 100 → "99+".

---

## B. "Conversas" no menu lateral

**Arquivo:** `src/components/DrawerContent/index.jsx`.

- Novo `DrawerItem` logo após o `DrawerItemList` (antes do item Admin): label "Conversas", ícone `Feather message-circle`, `onPress: () => navigation.navigate(dataRoutes.myChats)`.
- Contador: o componente chama `useUnreadChatsCount()` e, se `> 0`, renderiza o mesmo badge vermelho. O badge vira componente compartilhado `src/components/UnreadBadge/index.jsx` (recebe `count`, aplica `formatUnreadBadge`, não renderiza nada com count <= 0) usado tanto no Header quanto no Drawer — nada de export cruzado entre styles de componentes diferentes.
- O label do DrawerItem aceita função `({ color }) => <View row>…</View>` — badge vai ao lado do texto.
- Visível apenas autenticado (o Drawer já é área autenticada; confirmar no plano e não renderizar se não houver usuário no estado de login).

---

## C. Badge no ícone do aplicativo (sistema)

**Arquivos:** `App.jsx`, `src/controllers/Chat/index.js`, novo componente sem UI `src/components/BadgeSync/index.jsx`. O `BadgeSync` precisa do estado redux (o hook `useUnreadChatsCount` usa `useSelector`), então é renderizado dentro do `ProviderRedux` no `App.jsx` (ao lado de `<ContentStatusBar />`), retornando `null`.

**App aberto / segundo plano:**
- `BadgeSync` (componente sem UI dentro do Provider): usa `useUnreadChatsCount()` e roda `Notifications.setBadgeCountAsync(count)` num `useEffect` a cada mudança. Com count 0 o sistema remove o badge.
- Remover o `Notifications.setBadgeCountAsync(0)` incondicional do startup em `App.jsx:89` — ele apagaria o badge correto. (O decremento manual em `ReceivedNotifications/index.jsx:137` é de outra feature e fica intocado.)

**App fechado (push):**
- `sendNotification` já aceita payload extra; adicionar campo `badge` (número) no corpo enviado à Expo Push API quando fornecido: `...(badge != null ? { badge } : {})`.
- Em `sendChatMessage` (`src/controllers/Chat/index.js`): antes de enviar o push, calcular o total de conversas não lidas do destinatário com uma consulta pontual (`getDocs` das duas queries `buyerId==recipient` / `sellerId==recipient`, mesma lógica de `subscribeUnreadChatsCount` porém one-shot, extraída para função `countUnreadChats(userId)` no mesmo controller). O cálculo roda APÓS o addDoc/updateDoc da mensagem, então a conversa recém-atualizada já conta como não lida na própria consulta (o Firestore lê a escrita confirmada). Sem ajustes defensivos de +1.
- Falha no cálculo (erro de rede/permissão): enviar push sem `badge` (notificação continua chegando; badge apenas não atualiza). Try/catch com `Sentry.captureException`.
- Limitação documentada: Android depende do launcher (Samsung/Xiaomi mostram número, Pixel mostra ponto); iOS mostra sempre. É o "quando o sistema permitir" da especificação.

---

## D. Mensagem automática única por cliente+anúncio

**Arquivos:** `src/pages/PublicationChat/index.jsx`, `src/controllers/Chat/index.js`.

- Nova função no controller: `markAutoMessageSent(chatId)` → `updateDoc(chatRef, { autoMessageSentAt: serverTimestamp() })` com try/catch+Sentry (best-effort; se falhar, o guard por `messages.length` continua cobrindo).
- `PublicationChat`: o estado que hoje guarda só `lastSeenAt` do `onChatMeta` passa a guardar também `autoMessageSentAt` (renomear estado para `chatMeta` com o doc inteiro, derivando `lastSeenAt = chatMeta?.lastSeenAt || {}` — evita segundo estado).
- Guard do efeito de auto-send ganha a condição: `if (chatMeta?.autoMessageSentAt) return;` além das existentes (`messages.length > 0`, `autoSentRef`, `messagesReadyRef`).
- Após o `sendChatMessage` do auto-send resolver com sucesso, chamar `markAutoMessageSent(resolvedChatId)`.
- Sequenciamento: o guard atual espera `messagesReadyRef` (subscription de mensagens carregada). O `onChatMeta` pode chegar depois do primeiro snapshot de mensagens em chat NOVO (doc não existe ainda → `onChatMeta` não dispara). Isso é correto: chat novo → sem meta → sem `autoMessageSentAt` → envia. Chat existente → `messages.length > 0` já bloqueia antes mesmo do meta chegar. O campo protege o caso residual (ex.: futuras mensagens tombstone/limpeza) e reforça permanência entre reinstalações.
- Template da mensagem: INALTERADO (versão com emojis 🦐/📦/🌊 do build 108).

---

## Error handling
- `formatUnreadBadge`: entradas não numéricas → badge oculto.
- `countUnreadChats` falhou → push sem badge, Sentry.
- `markAutoMessageSent` falhou → sem crash; guard secundário (`messages.length`) segura o reenvio na prática.
- `setBadgeCountAsync` pode rejeitar em plataformas sem suporte → try/catch silencioso (comportamento esperado em alguns Androids).

## Testing
- `tests/formatUnreadBadge.test.cjs` (novo, node --test).
- Suíte existente continua verde (mesmas 3 falhas pré-existentes não relacionadas).
- Manual (item 21 da especificação geral): badge da home e do drawer com 0/1/5/100+ não lidas; badge do ícone do app no iOS (sempre) e Android (por launcher) com app aberto, em segundo plano e fechado; ler conversa → contadores caem; auto-send 1x (abrir chat pelo card, sair, reabrir → sem segunda mensagem; reinstalar → sem segunda mensagem).
