# Chat Badge + Minhas Conversas — Design Spec

## Goal
Melhorar o sistema de chat interno: botão WA vira ícone, botão CHAT ocupa a largura, badge de não lidas na top bar em tempo real, e tela "Minhas Conversas" mostrando todas as conversas do usuário (como comprador ou vendedor).

## Architecture

Quatro partes independentes:

1. **CardPublicationShrimp** — ajuste visual dos botões
2. **Header** — badge de não lidas em tempo real
3. **MyChats screen** — tela de lista de conversas
4. **Chat controller** — funções novas: `lastSeenAt`, contagem não lidas, listagem de chats por usuário

---

## Data Model

### `chats/{chatId}` (existente, adicionar campo)
```
{
  id: string,
  publicationId: string,
  sellerId: string,        // email do vendedor
  buyerId: string,         // email do comprador
  sellerName?: string,
  buyerName?: string,
  publicationTitle?: string,
  lastMessage?: string,    // snapshot da última mensagem (para listar sem ler subcoleção)
  lastMessageAt?: Timestamp,
  lastSeenAt: {            // NOVO — controle de lidas por usuário
    [userId: string]: Timestamp
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `chats/{chatId}/messages/{messageId}` (existente)
```
{
  senderId: string,
  text: string,
  createdAt: Timestamp,
}
```

**lastSeenAt logic:**
- Ao abrir uma conversa → `updateDoc(chatRef, { ['lastSeenAt.{meuId}']: serverTimestamp() })`
- Não lidas = mensagens onde `createdAt > lastSeenAt[meuId]` e `senderId !== meuId`
- Para o badge global: contar chats onde `lastMessageAt > lastSeenAt[meuId]` e `lastMessage` existe

---

## Components

### 1. CardPublicationShrimp — botões
- Botão WA: remove texto "Falar com o Produtor", mantém só ícone FontAwesome whatsapp, tamanho fixo 48x44px, fundo verde #25d366
- Botão CHAT: `flex: 1`, fundo #36536e, ícone message-square + texto "CHAT", visível apenas quando `dataUser?.email !== item.userId`

### 2. Header — badge
- Novo controller: `subscribeUnreadChatsCount(userId, onCount)` — onSnapshot em chats onde `sellerId == userId` OU `buyerId == userId`, conta chats onde `lastMessageAt > lastSeenAt[userId]`
- Como Firestore não suporta OR direto em queries antigas, fazer **duas queries** (uma por `buyerId`, outra por `sellerId`) e somar
- Header recebe contagem via hook `useUnreadChatsCount()`
- Badge some quando count === 0
- Tap navega para `dataRoutes.myChats`

### 3. MyChats screen (`src/pages/MyChats/`)
- Duas queries Firestore: `where("buyerId","==",myId)` + `where("sellerId","==",myId)`, merge e sort por `lastMessageAt desc`
- `onSnapshot` em tempo real para ambas
- Lista com: avatar (inicial do nome), nome do outro usuário, nome da publicação (`publicationTitle`), última mensagem (`lastMessage`), horário, badge de não lidas
- Tap num item → navega para `PublicationChat` com os params corretos
- Estado vazio: "Você ainda não tem conversas"

### 4. PublicationChat — marcar como lida
- Ao montar a tela (`useEffect`) → chama `markChatAsSeen(chatId, myId)`
- `markChatAsSeen` faz `updateDoc` com `lastSeenAt.{myId}: serverTimestamp()`

### 5. sendChatMessage — snapshot da última mensagem
- Ao enviar, atualiza também `lastMessage: text`, `lastMessageAt: serverTimestamp()` no documento raiz do chat
- Salvar `sellerName`, `buyerName`, `publicationTitle` na criação do chat para exibir na lista sem queries extras

---

## File Map

| Arquivo | Ação |
|---|---|
| `src/controllers/Chat/index.js` | Adicionar: `markChatAsSeen`, `subscribeUnreadChatsCount`, `subscribeMyChats`. Atualizar: `sendChatMessage` (lastMessage + lastMessageAt + nomes) |
| `src/components/Header/index.jsx` | Adicionar badge com `useUnreadChatsCount` hook |
| `src/hooks/useUnreadChatsCount.js` | Novo hook — duas queries onSnapshot, soma contagem |
| `src/pages/MyChats/index.jsx` | Nova tela de lista de conversas |
| `src/pages/MyChats/styles.js` | Styled components da tela |
| `src/pages/PublicationChat/index.jsx` | Chamar `markChatAsSeen` ao montar |
| `src/components/CardPublicationShrimp/index.jsx` | Ajustar botões WA (só ícone) e CHAT (flex:1 + texto) |
| `src/routes/dataRoutes.js` | Adicionar `myChats: "My Chats"` |
| `src/routes/index.jsx` | Registrar `MyChats` screen |

---

## Navigation Flow

```
Top bar badge (3) → tap → MyChats screen
MyChats → tap numa conversa → PublicationChat (existente)
Card publicação → botão CHAT → PublicationChat
```

---

## Error Handling
- Se query Firestore falhar: lista vazia, sem crash
- Se `lastSeenAt` não existe ainda pro usuário: todos os chats contam como não lidos
- Se `publicationTitle` não foi salvo (chats antigos): exibir "Publicação"
