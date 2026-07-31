# Fase 6 — Avaliação cliente↔produtor + Camarão vendido — Design Spec

## Goal
Itens 13 e 14: avaliação mútua (1–5 estrelas + comentário opcional, 1 por negociação, liberada só após encerramento, média calculada no SERVIDOR) e fluxo "camarão vendido" (confirmação, fecha todas as conversas do anúncio, bloqueia mensagens, move pra Encerradas, libera avaliação, mantém histórico). Inclui o débito da Fase 3: contadores de não lidas passam a ignorar conversas encerradas.

Decisões (execução contínua autorizada):
- **Ponto de entrada do "vendido"**: menu de 3 pontos do chat (visível só pro vendedor) ganha "Marcar como vendido" — contextual, sem mexer nas telas de gestão de anúncios. Confirmação com o texto do item 14.
- **Encerramento client-side** (batch): com as regras do Firestore hoje abertas, uma Cloud Function não adicionaria segurança real; a autoridade de servidor entra na fase de segurança (item 20) junto com as regras. A média de avaliação, porém, JÁ nasce server-side (exigência explícita do item 13): Cloud Function trigger.
- **Uma avaliação por negociação**: doc id determinístico `${chatId}_${safeRaterId}` na collection `ratings` — reenvio sobrescreveria o próprio doc (impedido no cliente com checagem prévia; a função recalcula de qualquer forma, então nunca infla a contagem).
- **Deploy da function NÃO é feito automaticamente** — o código fica pronto em `functions/src/ratings.js` e o deploy fica listado como pendência final pro usuário (mexe em produção).
- Comentários das avaliações são armazenados mas ainda não listados no perfil (fase futura); perfil/header/cards mostram média + contagem reais.

## A. Dados

- `ratings/{chatId_safeRaterId}`: `{ chatId, publicationId, raterId, ratedId, stars (1-5), comment (string, pode vazia), createdAt }`. `models.ratings = "ratings"`.
- `users/{id}` ganha (escritos SÓ pela function): `ratingAverage` (number, 1 casa), `ratingCount` (int).
- `shrimpPonds/{id}` ganha `sold: true, soldAt` ao vender.
- `chats/{id}`: `status: "closed"`, `closedAt`, `closedReason: "sold"`.

## B. Cloud Function — `functions/src/ratings.js`

- `onRatingWritten`: trigger v2 `onDocumentWritten("ratings/{ratingId}")` (firebase-functions ^4.9 suporta API v2). Recalcula do zero: query `ratings` por `ratedId == <do doc>`, soma/conta, grava `ratingAverage` (arredondada a 1 casa) e `ratingCount` em `users/{ratedId}`. Recompute-from-scratch (não incremental) → idempotente e à prova de edição/correção de avaliação.
- Registrada em `functions/src/index.js` com UMA linha de require/export no final, sem tocar no restante do arquivo (contém WIP de pagamentos do usuário).
- Deploy: manual/pendente (`firebase deploy --only functions:onRatingWritten`).

## C. Controllers (client)

`src/controllers/Chat/ratings.js` (novo):
- `submitRating({ chatId, publicationId, raterId, ratedId, stars, comment })` → `setDoc(ratings/${chatId}_${safe(raterId)})`, retorna bool.
- `getMyRating(chatId, raterId)` → getDoc do id determinístico; retorna doc ou null.

`src/controllers/Chat/sold.js` (novo):
- `markPublicationSold(publicationId)` → `updateDoc(shrimpPonds/{id}, { sold: true, soldAt })`.
- `closeChatsForPublication(publicationId)` → query chats `publicationId ==`, `writeBatch` com `{ status: "closed", closedAt, closedReason: "sold" }` (chunks 450). Retorna contagem fechada.

`src/controllers/Chat/index.js`:
- `sendChatMessage`: guard novo no início do update path — se o doc existente tem `status === "closed"`, retorna `false` sem gravar (bloqueio de envio; UI nem deixa chegar aqui, é cinto de segurança).
- `countUnreadChats` e `subscribeUnreadChatsCount`: pular chats com `status === "closed"` (débito da Fase 3 — alinha badge do header/ícone/push com a aba Ativas).

`src/utils/ratingLabel.js` (CJS + teste): `formatRatingLabel(average, count)` → `"⭐ Sem avaliações"` quando count vazio/0; `"⭐ 4,8 • 12 avaliações"` (vírgula pt-BR, singular "1 avaliação").

## D. UI

**PublicationChat:**
- Menu 3 pontos: quando `myId === sellerId && !publicationData?.sold`, ação extra "Marcar como vendido" → `Alert` de confirmação ("Este camarão foi vendido. Deseja encerrar todas as conversas ligadas a este anúncio?") → `markPublicationSold` + `closeChatsForPublication` → Toast "Anúncio marcado como vendido".
- Chat encerrado (`chatMeta?.status === "closed"`): input some, no lugar `ClosedBar` ("🔒 Conversa encerrada — este anúncio foi vendido") + botão "Avaliar {nome}" quando `getMyRating` ainda null (estado `myRating` carregado quando o chat estiver closed). Ações de mensagem continuam (copiar etc.), mas Responder/Encaminhar seguem funcionais só p/ leitura — Responder desabilitado em chat closed (não há envio).
- Header: `⭐ Sem avaliações` vira real — a tela já busca o doc do outro usuário (resolvedSellerName)? Só busca o seller. Ampliar: buscar o doc do OUTRO participante (`otherUserId`) e guardar `otherUserRating {average, count}`; linha usa `formatRatingLabel`.
- `RatingModal` (novo componente `src/components/RatingModal/index.jsx`): modal central com 5 estrelas tocáveis (Feather `star` preenchida/contorno, dourado `#f5a623`), `TextInput` multiline opcional "Comentário (opcional)", botões Cancelar/Enviar (enviar desabilitado sem estrela). `onSubmit(stars, comment)`.

**UserProfile:** troca o placeholder por `formatRatingLabel(profile?.ratingAverage, profile?.ratingCount)`.

**MyChats:** cards mostram a avaliação real do outro participante: state `ratingsByUser` (map), efeito que busca `getDoc(users/{otherId})` uma vez por id único visível (cache em ref), linha usa `formatRatingLabel`. Falha → mantém "Sem avaliações".

## Error handling
- `submitRating`/`markPublicationSold`/`closeChats` falham → Toast "Não foi possível concluir", Sentry.
- Function ausente (deploy pendente): avaliações são gravadas mas média não atualiza — UI continua mostrando o que existir em `users`; sem crash. Pendência de deploy listada no relatório final.
- Chat fechado corrida: guard no controller retorna false → Toast genérico do fluxo de envio (sem crash).

## Testing
- `tests/ratingLabel.test.cjs` (0/1/12 avaliações, arredondamento vírgula).
- `tests/ratingsAggregate.test.cjs`: lógica pura de agregação extraída em `functions/src/ratingsAggregate.js` (CJS puro: `computeAggregate(ratingsArray)` → {average, count}) usada pela function e testável com node --test.
- Suíte mantém baseline (+ novos). Manual: fluxo vendido completo, bloqueio de envio, avaliação 1x por lado, média no perfil/header/cards após function (ou manualmente setada p/ teste), contadores ignorando encerradas.
