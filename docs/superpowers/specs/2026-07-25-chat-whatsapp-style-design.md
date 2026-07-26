# Chat estilo WhatsApp + Notificações — Design Spec

## Goal
Redesenhar as telas de chat (`MyChats` e `PublicationChat`) para seguir o padrão visual de referência (avatar, hierarquia tipográfica, check de leitura estilo WhatsApp), adicionar filtro funcional de conversas não lidas, e corrigir/completar o comportamento de notificações push para mensagens de chat: banner aparece com o app aberto, toque leva direto para a conversa, e notificação é suprimida quando o usuário já está naquele chat.

Referência visual: mockups estilo app de mensagens (header com avatar + nome, bolhas laranja/branco, check ✓✓, lista de conversas com abas de filtro). Decisão de escopo (confirmada com o usuário): manter a estrutura de header atual do app (barra full-width, sem card flutuante, sem fundo escuro) — só ajustar conteúdo/hierarquia. Remover elementos que a referência mostra mas o app não suporta (status online, chamada de vídeo/voz, abas Groups/Work, FAB de "nova conversa").

## Architecture

Duas partes independentes:

1. **Chat UI redesign** — `MyChats` (lista) e `PublicationChat` (conversa), com check de leitura real
2. **Notificações de chat** — handler de notificação, payload com dados de navegação, listener de toque, supressão quando chat está aberto

---

## Parte 1 — Chat UI Redesign

### Data usada (já existe, sem mudança de schema)
- `chats/{chatId}.lastSeenAt[userId]` (Timestamp) — já gravado por `markChatAsSeen`
- `messages/{id}.createdAt`, `messages/{id}.senderId` — já existem

### Lógica de check de leitura (nova função utilitária)
Para uma mensagem minha (`senderId === myId`) numa conversa com o outro usuário `otherId`:
- **✓ cinza** (enviada): sempre que a mensagem existe (estado padrão)
- **✓✓ cinza** (entregue): a mensagem já chegou ao Firestore — equivalente ao estado "enviada" hoje, pois não há evento de "entregue" separado no modelo atual. Para simplificar, entregue = enviada (não há intermediário real disponível), então **na prática o app mostra apenas dois estados**: ✓ cinza (enviada) e ✓✓ laranja (lida).
- **✓✓ laranja** (lida): `message.createdAt <= chat.lastSeenAt[otherId]`

Nova função em `src/utils/chatReadStatus.js`:
```js
export const getMessageReadStatus = (message, lastSeenAt, otherUserId) => {
  const otherSeen = lastSeenAt?.[otherUserId];
  if (!otherSeen || !message?.createdAt) return "sent";
  const seenMs = otherSeen?.toMillis?.() ?? 0;
  const msgMs = message.createdAt?.toMillis?.() ?? 0;
  return msgMs <= seenMs ? "read" : "sent";
};
```
Retorna `"sent"` ou `"read"` — componente decide ícone/cor.

`subscribeToChat` precisa também expor o `lastSeenAt` do documento pai do chat (hoje só expõe `messages`). Ajustar controller para também assinar o doc do chat (ou reaproveitar `resolvedChatId` + um `onSnapshot` adicional) e repassar `lastSeenAt` para a tela.

### Componentes — PublicationChat
- `BubbleTime` (bolhas de texto/imagem/áudio, apenas quando `isMine`): adiciona ícone de check ao lado do horário.
  - `sent`: um ✓ Feather `check`, cor `rgba(255,255,255,0.7)` (mesma cor do horário)
  - `read`: dois ✓ (Feather `check-circle` não serve — usar dois ícones `check` sobrepostos ou um único ícone `check-check`-like feito com dois `Feather name="check"` posicionados) — usar abordagem simples: renderizar `✓✓` como texto/emoji não é ideal; usar dois `<Feather name="check" size={11} />` com `marginLeft: -6` no segundo, cor laranja clara `#ffd9c2` (contraste sobre fundo laranja da própria bolha)
- Header: adiciona `Avatar`/`AvatarText` (mesmo padrão de `MyChats/styles.js`) com a inicial do outro usuário, à esquerda do `HeaderInfo`. Remove qualquer menção a status online (não existe hoje, não adicionar).

### Componentes — MyChats
- `ConvItem`: adiciona check de leitura na `ConvLastMsg` quando a última mensagem é minha (`item.sellerId === myId` ou equivalente já calculado) — reaproveita `getMessageReadStatus` adaptado para o nível de chat (comparar `lastMessageAt` com `lastSeenAt[otherId]`).
- Novo componente `FilterTabs` acima da lista: duas abas — "Todas" e "Não lidas" (contagem ao lado, ex: "Não lidas (3)"). Estado local `filter` (`"all" | "unread"`). Lista filtrada com `chats.filter((c) => filter === "all" || isUnread(c, safeId))`.
- Sem busca, sem FAB, sem abas Groups/Work (fora de escopo).
- Header (`ScreenHeader`): mantém estrutura atual, sem mudança estrutural — já está alinhado com a decisão B.

### File Map — Parte 1

| Arquivo | Ação |
|---|---|
| `src/utils/chatReadStatus.js` | Novo — `getMessageReadStatus(message, lastSeenAt, otherUserId)` |
| `tests/chatReadStatus.test.cjs` | Novo — testes do util (sent/read, sem lastSeenAt, mensagem sem createdAt) |
| `src/controllers/Chat/index.js` | `subscribeToChat` passa a também assinar o doc do chat pai e repassar `lastSeenAt` via callback (novo param `onChatMeta` ou incluir no mesmo callback) |
| `src/pages/PublicationChat/index.jsx` | Recebe `lastSeenAt` do chat, calcula status de leitura por mensagem, renderiza check nas bolhas próprias; adiciona `Avatar`/`AvatarText` no header |
| `src/pages/PublicationChat/styles.js` | Novos styled components: `ReadCheckWrap`, `Avatar`, `AvatarText` (reaproveitar visual de `MyChats`) |
| `src/pages/MyChats/index.jsx` | Adiciona `FilterTabs` (Todas/Não lidas) com estado local; check de leitura na prévia da última mensagem própria |
| `src/pages/MyChats/styles.js` | Novos styled components: `FilterTabsRow`, `FilterTab`, `FilterTabText` |

---

## Parte 2 — Notificações estilo WhatsApp

### Problema atual
- `App.jsx` usa `shouldShowAlert` (campo antigo do `expo-notifications`; a versão instalada, 0.31, espera `shouldShowBanner`/`shouldShowList` para exibir banner corretamente com o app em primeiro plano).
- Notificação de chat (`sendNotification` chamado dentro de `sendChatMessage`) não carrega nenhum dado estruturado (`data: {...}`) — só `title`/`body`/`sound`. Não há como saber, ao tocar, para qual chat navegar.
- Não existe listener de resposta a notificação (`addNotificationResponseReceivedListener`) em nenhum lugar do app — tocar numa notificação não navega para lugar nenhum específico.
- Não existe rastreamento de "qual chat está aberto agora" — não dá pra suprimir notificação do chat ativo.

### Mudanças

**1. Handler de notificação (`App.jsx`)**
```js
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});
```

**2. Payload de dados no envio (`src/services/ExpoNotification/sendNotification.js`)**
Adicionar parâmetro opcional `data`:
```js
export const sendNotification = async (token, title, body, data = {}) => {
  // ...body: JSON.stringify({ to: token, title, sound: "default", body, channelId: "notifications-app", data })
};
```

**3. Chamada em `sendChatMessage` (`src/controllers/Chat/index.js`)**
Passa `data` com o necessário para reconstruir a navegação:
```js
await sendNotification(tokenResult.data, senderName || "Nova mensagem", preview, {
  type: "chat",
  chatId: id,
  publicationId,
  sellerId,
  buyerId,
  sellerName,
  buyerName,
});
```

**4. Rastreamento de chat ativo**
Novo módulo simples `src/utils/activeChatTracker.js` — um valor em módulo (não precisa Redux) com getter/setter:
```js
let activeChatId = null;
export const setActiveChatId = (id) => { activeChatId = id; };
export const getActiveChatId = () => activeChatId;
```
`PublicationChat` chama `setActiveChatId(resolvedChatId)` no mount e `setActiveChatId(null)` no unmount (`useEffect` cleanup).

**5. Supressão + navegação — dois pontos de uso**

a) **Supressão local (app em foreground):** o handler do `setNotificationHandler` não tem acesso fácil ao payload de forma síncrona simples para decidir por chat — a abordagem mais confiável é usar `addNotificationReceivedListener` (dispara mesmo com o app em foreground) combinado com `Notifications.dismissNotificationAsync` quando o `chatId` recebido bate com `getActiveChatId()`. Como o handler já decide mostrar o banner antes do listener rodar, a estratégia é:
   - `handleNotification` verifica `getActiveChatId()` contra o `data.chatId` do `notification.request.content.data` recebido como argumento da própria função — **o handler recebe a notification como argumento**, então dá pra decidir ali mesmo, sem precisar de listener + dismiss:
   ```js
   Notifications.setNotificationHandler({
       handleNotification: async (notification) => {
           const chatId = notification.request?.content?.data?.chatId;
           const isActiveChat = chatId && chatId === getActiveChatId();
           return {
               shouldShowBanner: !isActiveChat,
               shouldShowList: !isActiveChat,
               shouldPlaySound: !isActiveChat,
               shouldSetBadge: !isActiveChat,
           };
       },
   });
   ```

b) **Navegação ao tocar:** novo listener em `App.jsx` (ou hook dedicado `src/utils/hooks/useChatNotificationNavigation.js`) usando `addNotificationResponseReceivedListener`, precisa de acesso ao `navigation` — como `App.jsx` não tem `navigation` direto (está fora do `NavigationContainer`), usar um `navigationRef` (via `@react-navigation/native` `createNavigationContainerRef`) já exportado de `src/routes/index.jsx` (verificar se já existe; se não, criar) e chamar `navigationRef.navigate(dataRoutes.publicationChat, { publication: { id: data.publicationId }, sellerId: data.sellerId, buyerId: data.buyerId, sellerName: data.sellerName, buyerName: data.buyerName, chatId: data.chatId })`.
   - Tratar `getLastNotificationResponseAsync()` no mount também, para o caso do app abrir a frio a partir do toque na notificação.

### File Map — Parte 2

| Arquivo | Ação |
|---|---|
| `src/utils/activeChatTracker.js` | Novo — get/set do chat atualmente aberto |
| `src/services/ExpoNotification/sendNotification.js` | Adiciona parâmetro `data` no payload |
| `src/controllers/Chat/index.js` | `sendChatMessage` passa `data` (chatId, publicationId, sellerId, buyerId, nomes) para `sendNotification` |
| `App.jsx` | Atualiza `setNotificationHandler` (shouldShowBanner/List + supressão por chat ativo); adiciona listener de resposta à notificação com navegação via `navigationRef`; trata `getLastNotificationResponseAsync` no mount |
| `src/routes/index.jsx` | Expor `navigationRef` (criar com `createNavigationContainerRef` se ainda não existir) e usar no `NavigationContainer` |
| `src/pages/PublicationChat/index.jsx` | Chama `setActiveChatId(resolvedChatId)` no mount, `setActiveChatId(null)` no unmount |
| `tests/activeChatTracker.test.cjs` | Novo — testes do get/set |

---

## Error Handling
- `subscribeToChat`: se o doc do chat pai não existir ainda (primeira mensagem sendo criada), `lastSeenAt` fica `undefined` — `getMessageReadStatus` já trata isso retornando `"sent"`.
- Notificação sem `data.chatId` (ex.: notificações antigas já entregues antes do deploy, ou outros tipos de notificação não-chat): handler trata `chatId` undefined como "não é o chat ativo" → comportamento padrão (mostra notificação normalmente); listener de toque ignora navegação se faltar `publicationId`.
- `navigationRef` não pronto ainda (app frio, navegação não montou) ao processar `getLastNotificationResponseAsync`: aguardar `navigationRef.isReady()` antes de navegar (poll simples ou `useEffect` com dependência).
- Falha ao enviar push (token inválido, rede): já tratado hoje via `tokenResult.error` — não muda.

## Testing
- `tests/chatReadStatus.test.cjs`: mensagem lida (createdAt < lastSeenAt), não lida (createdAt > lastSeenAt), sem lastSeenAt, sem createdAt.
- `tests/activeChatTracker.test.cjs`: set/get/reset.
- Manual (fora do escopo de teste automatizado): verificar banner aparece em foreground fora do chat, não aparece dentro do chat, toque navega pro chat certo (app quente e frio).
