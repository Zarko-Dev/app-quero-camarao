# Fase 4 — Ações de mensagem + estados de entrega + responder — Design Spec

## Goal
Itens 8, 9 e 10 da especificação geral: menu ao segurar a mensagem (responder, copiar, encaminhar, apagar pra mim, apagar pra todos, denunciar), estados de confirmação honestos (🕐 enviando / ✓ enviada / ✓✓ entregue / ✓✓ verde lida — entregue confirmado pelo aparelho do destinatário, não pelo banco), e responder mensagem específica com prévia (por swipe ou pelo menu).

Decisões tomadas autonomamente (execução contínua autorizada pelo usuário): menu como Modal bottom-sheet próprio (Android não comporta 6 ações em Alert); swipe-to-reply com `Swipeable` do react-native-gesture-handler (~2.24 já instalado); copiar via `expo-clipboard` (~7.1 já instalado); denúncias numa collection nova `reports`; "apagar" mantém o doc no banco (tombstone), como o item 8 exige.

## A. Modelo de dados (subcoleção `messages` + collection nova)

Campos novos por mensagem (todos opcionais, mensagens antigas seguem válidas):
- `replyTo: { id, senderId, preview }` — prévia da mensagem respondida (`preview` = texto truncado 80 chars, ou "📷 Foto"/"🎵 Áudio"/"📎 Documento").
- `deletedFor: { [safeUserId]: true }` — apagar pra mim (o outro continua vendo).
- `deletedForEveryone: true` + `deletedAt` — apagar pra todos (só o autor pode); conteúdo NÃO é removido do doc (exigência: não apagar definitivamente).
- `forwarded: true` — mensagem encaminhada.
- `deliveredTo: { [safeUserId]: serverTimestamp }` — gravado pelo APARELHO DO DESTINATÁRIO ao receber a mensagem na subscription (writeBatch, só para mensagens do outro sem entrada minha). É isso que torna "entregue" honesto.

Collection `reports` (models.reports = "reports"): `{ chatId, messageId, reportedBy, reportedUserId, preview, createdAt }`.

`lastMessage` do chat NÃO muda ao apagar (limitação aceita nesta fase; a lista pode mostrar a prévia antiga).

## B. Controller (`src/controllers/Chat/messageActions.js` — novo arquivo)

- `deleteMessageForMe(chatId, messageId, userId)` → `updateDoc` `deletedFor.{safe}: true`.
- `deleteMessageForEveryone(chatId, messageId)` → `updateDoc` `{ deletedForEveryone: true, deletedAt: serverTimestamp() }`.
- `reportMessage({ chatId, messageId, reportedBy, reportedUserId, preview })` → `addDoc` em `reports`.
- `markMessagesDelivered(chatId, messageIds, userId)` → `writeBatch` com `deliveredTo.{safe}: serverTimestamp()` em cada; chunks de 450.
- Todos com try/catch + Sentry, retornos best-effort.
- `sendChatMessage` ganha params opcionais `replyTo = null` e `forwarded = false` (gravados no msgData quando presentes). `subscribeToChat` passa `{ includeMetadataChanges: true }` no onSnapshot de mensagens e inclui `pending: d.metadata.hasPendingWrites` em cada item.

Util puro novo `src/utils/messageStatus.js` (CJS + teste): `getMessageDeliveryStatus(message, lastSeenAt, otherUserId)` → `"pending" | "sent" | "delivered" | "read"`. Ordem: `message.pending` → pending; lida se `createdAt <= lastSeenAt[safeOther]` (reusa a sanitização); entregue se `deliveredTo[safeOther]`; senão sent. Substitui `getMessageReadStatus` nos usos do chat (o util antigo permanece para o MyChats, que só precisa de sent/read).

Util puro novo `src/utils/messagePreview.js` (CJS + teste): `buildMessagePreview(message)` → texto truncado 80 / "📷 Foto" / "🎵 Áudio" / "📎 Documento" (para replyTo e para denúncia).

## C. UI no `PublicationChat`

- **ReadReceipt** vira 4 estados: `pending` → Feather `clock` 12 cinza; `sent` → 1 check cinza; `delivered` → 2 checks cinza; `read` → 2 checks verdes.
- **Long-press** em qualquer bolha (própria ou recebida) abre `MessageActionsSheet` (componente novo `src/pages/PublicationChat/MessageActionsSheet.jsx`): Modal transparente ancorado embaixo, lista de ações com ícones Feather. Ações: Responder (sempre), Copiar (só texto), Encaminhar (sempre, exceto apagadas), Apagar para mim (sempre), Apagar para todos (só minhas), Denunciar (só recebidas). Mensagens apagadas-para-todos não abrem menu.
- **Tombstone**: mensagem com `deletedForEveryone` renderiza bolha com `🚫 Esta mensagem foi apagada` em itálico cinza, mantendo o horário no footer mas sem checks. Mensagens com `deletedFor[me]` são filtradas fora da lista.
- **Responder**: estado `replyingTo`; barra de prévia acima do input (nome + prévia + X pra cancelar); `handleSend` inclui `replyTo: { id, senderId, preview }`. Bolha com `replyTo` mostra bloco de citação (borda esquerda 3px verde/cinza, nome + prévia, fonte menor) acima do conteúdo.
- **Swipe-to-reply**: cada bolha envolvida em `Swipeable` (RNGH) com `renderLeftActions` = ícone `corner-up-left`; `onSwipeableWillOpen` → seta `replyingTo` e fecha o swipe (`ref.close()`). `friction={2}`, `leftThreshold={40}`. O `GestureHandlerRootView` já existe? Verificar App (gesture-handler importado em App via "react-native-gesture-handler" no topo — Swipeable requer GestureHandlerRootView no RN moderno; adicionar wrapper no PublicationChat Container se necessário).
- **Encaminhar**: `ForwardModal` (componente novo): lista as outras conversas do usuário (via `subscribeMyChats` one-shot/getDocs — reusar `subscribeMyChats` com unsubscribe imediato é feio; criar `getMyChats(userId)` one-shot no controller reaproveitando a lógica). Tocar numa conversa → `sendChatMessage` pro chat destino com o conteúdo da mensagem (text/imageUrl/audioUrl+duration/fileUrl+name+size), `forwarded: true`, e os campos de denormalização do chat destino (do doc do chat destino). Fecha modal, Toast "Mensagem encaminhada".
- **Marcar entregue**: no `onMessages` do subscribe, coletar mensagens do outro sem `deliveredTo[mySafe]` e sem `pending`, chamar `markMessagesDelivered` (fire-and-forget, com guard pra não repetir ids já marcados via ref Set).
- Bolha encaminhada: label pequena `↪ Encaminhada` em cinza acima do conteúdo.

## D. Fora de escopo (mantido para fases seguintes)
- Encaminhar para múltiplos chats de uma vez; apagar mensagens em lote; editar mensagem; denúncia com motivo/categoria (grava preview simples); atualizar `lastMessage` do chat ao apagar a última.

## Error handling
- Ações best-effort: falha → Toast "Não foi possível concluir" (padrão Toast já usado no app), Sentry no controller.
- Clipboard/copy: só habilitado quando `item.text` existe.
- `markMessagesDelivered` nunca bloqueia a UI; erros silenciosos (Sentry).
- Swipe não interfere no scroll da lista (threshold) nem nos toques existentes (fullscreen de imagem, play de áudio, abrir documento).

## Testing
- `tests/messageStatus.test.cjs`: pending/sent/delivered/read + sanitização de email + precedência (lida ganha de entregue).
- `tests/messagePreview.test.cjs`: texto curto, truncado 80, foto/áudio/documento, vazio.
- Suíte mantém baseline. Manual: menu completo nas próprias/recebidas, copiar, apagar pra mim (some só pra mim), apagar pra todos (tombstone nos dois lados), denunciar (doc em reports), responder por menu e por swipe (prévia na bolha), encaminhar pra outra conversa, relógio→✓→✓✓→✓✓ verde na sequência real.
