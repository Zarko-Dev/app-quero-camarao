# Fase 3 — Tela Conversas (Ativas/Não lidas/Encerradas) + cabeçalho rico + perfil público — Design Spec

## Goal
Evoluir a lista de conversas (`MyChats`) para a tela "Conversas" com 3 abas e cards ricos (cidade, tamanho/quantidade, slot de avaliação, ordenação não-lidas-primeiro), enriquecer o cabeçalho do `PublicationChat` (avaliação, cidade, resumo do anúncio, menu de 3 pontos com "Ver anúncio", toque no nome abre perfil) e criar a tela de perfil público simples. Itens 3 e 4 da especificação geral.

Decisões fechadas com o usuário: slot de estrelas mostra "⭐ Sem avaliações" discreto até a Fase 6; cidade/tamanho/quantidade denormalizados no doc do chat na hora do envio de mensagem; abas Ativas/Não lidas/Encerradas; perfil público simples criado agora. Botão "chamar atenção" NÃO entra (Fase 7, para não haver botão morto).

---

## A. Dados — denormalização + status no doc do chat

`sendChatMessage` (`src/controllers/Chat/index.js`) ganha params opcionais `publicationLocation = ""` e `publicationSummary = ""`:
- No `setDoc` (chat novo): grava `publicationLocation`, `publicationSummary` e `status: "active"`.
- No `updateDoc` (chat existente): grava `publicationLocation`/`publicationSummary` apenas se não-vazios (auto-corrige chats antigos na próxima mensagem), e `status` NÃO é tocado no update (a Fase 6 é quem fecha conversas).

Chamadores passam os dados que já têm em mãos:
- `CardPublicationShrimp.openChat` → já navega com `publication: item`; o `PublicationChat` é quem envia mensagens, então a mudança fica concentrada nele.
- `PublicationChat`: todos os 4 pontos de envio (texto, imagem, áudio, documento e auto-send) passam `publicationLocation: publicationData?.location || ""` e `publicationSummary: buildPublicationSummary(publicationData?.shrimps)`.

### Util `buildPublicationSummary(shrimps)` — `src/utils/publicationSummary.js` (CJS + teste)
- Entrada: array `[{ grammage, kilo }]`; saída: `"14g • 1.800kg"` para 1 item; para vários: `"30g • 2.000kg · 28g • 1.500kg"` (separador ` · ` entre pares); `""` para vazio/inválido.
- `kilo` passa por `formatKilo`. Para o util CJS poder importá-lo, `src/utils/formatKilo.js` é convertido para `module.exports` (padrão dos demais utils testáveis do repo; os imports ESM existentes nos componentes seguem funcionando via interop, como já acontece com `chatReadStatus`). A conversão ganha teste próprio.

### Util `sortChatsUnreadFirst(chats, safeId)` — `src/utils/chatListSort.js` (CJS + teste)
- Ordena: não lidas primeiro (mesma semântica `isUnread` já usada em `MyChats`), e dentro de cada grupo por `lastMessageAt` desc. A função `isUnread` local do `MyChats` migra para este util (exportada) para ser reusada e testada.

## B. Tela Conversas (`src/pages/MyChats/`)

- `HeaderTitle` vira "Conversas". Rota/registro inalterados (`dataRoutes.myChats`).
- Abas: `FilterTabsRow` passa a 3 `FilterTab`: "Ativas" (default; `status !== "closed"`), "Não lidas" (não lidas dentre as ativas, contador mantido), "Encerradas" (`status === "closed"`).
- O controller `subscribeMyChats` continua ordenando por data (inalterado); a tela aplica `sortChatsUnreadFirst` sobre o resultado já filtrado pela aba ativa.
- Card ganha, entre `ConvName` e `ConvLastMsg`:
  - `ConvRating`: `⭐ Sem avaliações` (fonte 10, cinza `#b0a898`) — placeholder fixo até a Fase 6;
  - `ConvPub` reformulado: `📍 {publicationLocation} · 🦐 {publicationSummary}` quando os campos denormalizados existirem; fallback para o formato atual `🦐 {publicationTitle}` quando não.
- Aba Encerradas vazia: `EmptyWrap` com ícone `archive` e "Conversas encerradas aparecerão aqui".
- Badge/checks/avatar/horário: inalterados.

## C. Cabeçalho do chat (`src/pages/PublicationChat/`)

- `HeaderInfo` passa a 3 linhas: `HeaderTitle` (nome, como hoje); `HeaderRating` "⭐ Sem avaliações" (novo styled, fonte 10, `#b0a898`); `HeaderSubtitle` reformatado para `{location} • {summary}` usando `buildPublicationSummary` (troca o formato atual de emojis por texto limpo, ex: "Palhano • 14g • 1.800kg").
- Nome + avatar + rating viram um `TouchableOpacity` que navega para `dataRoutes.userProfile` com `{ userId: otherUserId, userName: headerName }`.
- Menu de 3 pontos (`Feather more-vertical`, à direita no Header): abre `ActionSheetIOS` (iOS) / `Alert` cancelable (Android) com 1 ação nesta fase: "Ver dados do anúncio", que abre um `Alert` informativo com cidade e gramaturas/quantidades do `publicationData` (dados já carregados na tela). O app não tem tela standalone de detalhe de anúncio — quando ela existir (Fase 9, deep links), o menu passa a navegar pra ela.
- Sem botão de sino (Fase 7).

## D. Tela de perfil público — `src/pages/UserProfile/`

- Rota nova: `dataRoutes.userProfile = "User Profile"`, registrada no stack raiz com `headerShown: false` (padrão das telas com header próprio).
- Params: `{ userId, userName }` (userName usado como fallback imediato enquanto carrega).
- Carrega `getDoc(users/{userId})` → exibe:
  - Avatar circular grande (72px) com iniciais (ou `userImage` se não-vazio, via `ImageComponent` existente);
  - Nome;
  - `⭐ Sem avaliações` (slot da Fase 6);
  - `📍 {address.city}/{address.state}` (campos `address.city`/`address.state` do doc do usuário; fallback `city`/`state` raiz; oculta a linha se ausentes);
  - "No Quero Camarão desde {mes de ano}" (do `createdAt` — Firestore Timestamp ou Date; formatação pt-BR "julho de 2026"; oculta se ausente);
  - Se `userType === "productor"`: contagem de publicações via o controller existente `getUserPublications(userId)` (`src/controllers/Publication/getUserPublications.js`, que já faz `where("userId", "==", userId)`). Exibe "🦐 {n} anúncio(s)"; oculta em erro.
- SEM telefone/email na tela (privacidade).
- Estados: loading (`ActivityIndicator`), erro/usuário inexistente (mensagem "Perfil indisponível" + voltar).
- Header próprio: seta de voltar + título "Perfil".

## Error handling
- Campos denormalizados ausentes (chats antigos) → fallback pro layout atual do card; nunca quebra.
- `getDoc` do perfil falha → tela de erro amigável, Sentry.
- Contagem de anúncios falha → oculta a linha, sem erro visível.
- `buildPublicationSummary` com dados malformados → `""` (card/header omitem o trecho).

## Testing
- `tests/publicationSummary.test.cjs`: 1 item, vários itens, vazio, null, kilo com vírgula/ponto.
- `tests/chatListSort.test.cjs`: não lidas primeiro, empate por data, arrays vazios, `isUnread` exportada (casos migrados do teste inline existente `chatController.test.cjs` continuam lá).
- `tests/formatKilo.test.cjs` (novo, ao converter para CJS): casos atuais do comportamento ("2000" → "2.000", "1.5" → "1.5", "1,5" → "1.5").
- Manual: 3 abas com filtros certos; não lidas no topo; card rico com denormalizados e fallback sem eles; header 3 linhas; menu 3 pontos; toque no nome abre perfil; perfil com todos os estados (produtor, cliente, usuário inexistente).
