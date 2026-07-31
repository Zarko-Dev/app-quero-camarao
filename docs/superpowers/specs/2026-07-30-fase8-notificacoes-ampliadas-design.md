# Fase 8 — Notificações ampliadas — Design Spec

## Goal
Itens 16, 17, 18. Corrigir o broadcast de "novo camarão" (só clientes, nunca o próprio publicador), lembretes agendados segunda/terça pros produtores, e enriquecer a central de notificações já existente (`ReceivedNotifications`) com seções computadas (avaliações pendentes, atalho de não lidas) além dos avisos administrativos que ela já lista.

Contexto: `sendNotificationNewPublication` já existe mas dispara pra TODOS os usuários com token, sem filtrar por tipo nem excluir o publicador — isso já é o bug do item 16. A tela `ReceivedNotifications` já é, na prática, a central de notificações do item 18 (lista avisos administrativos com lido/não lido) — falta agregar as duas categorias novas.

## A. Item 16 — corrigir alvo do broadcast

`src/controllers/Notifications/sendNotificationNewPublication.js`:
- `sendNotificationNewPublication({ publisherId, location, shrimps })`: usa `getAllUserTokenNotification()` (já traz `userType` por usuário — falta o id do doc, que hoje não é retornado; adicionar `id: document.id` ao objeto retornado por `getAllUserTokenNotification` em `src/controllers/User/notification.js`), filtra `userType === "client" && id !== publisherId`, monta corpo com `buildPublicationSummary` (reuso do util da Fase 3) + `location`: `"14g • 1.800kg • Palhano/CE. Toque para conferir."`, envia via `SendNotifications` (mantém o batching de 100 já existente) com `data: { type: "publication" }` — precisa passar `data` até `SendNotifications`/`ExecuteSendNotification`/`sendNotification`, hoje esses wrappers não repassam `data`; adicionar o parâmetro em cascata.
- `sendNotificationEditPublication`: mesmo filtro (client + não o editor), sem exigir resumo (mensagem genérica atual mantida).
- `src/controllers/Publication/saveShrimpPonds.js`: passa `{ publisherId: userId, location: dataPonds.location, shrimps: dataPonds.shrimps }`.

## B. Item 17 — lembretes segunda/terça

`functions/src/reminders.js` (v2 scheduler):
```js
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

const sendToProducers = async (title, body) => {
    const db = admin.firestore();
    const snap = await db.collection("users").where("userType", "==", "productor").get();
    const tokens = snap.docs
        .map((d) => d.data()?.notification?.token)
        .filter(Boolean);
    await Promise.all(tokens.map((to) =>
        fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to, title, body, sound: "default", data: { type: "registerMyAds" } }),
        })));
};

exports.mondayProducerReminder = onSchedule(
    { schedule: "0 8 * * 1", timeZone: "America/Fortaleza" },
    () => sendToProducers(
        "Produtor, comece a semana aparecendo para os compradores!",
        "Publique seu camarão no Quero Camarão e aumente suas chances de negociação.",
    ),
);

exports.tuesdayProducerReminder = onSchedule(
    { schedule: "0 8 * * 2", timeZone: "America/Fortaleza" },
    () => sendToProducers(
        "Seu camarão já está publicado?",
        "Os compradores começam a se movimentar. Anuncie agora e fique visível durante a semana.",
    ),
);
```
Registrado em `functions/src/index.js` (append, mesmo padrão do `ratings.js`). Deploy manual/pendente (como a function de avaliação).

`App.jsx`: `navigateToChatFromNotificationData` generaliza — `data.type === "registerMyAds"` navega `dataRoutes.registerMyAds` (sem params); `data.type === "publication"` navega `dataRoutes.home` (não existe tela de detalhe de anúncio único ainda — abrir o feed é o alvo prático até a Fase 9 criar deep link por anúncio). Renomear a função pra `handleNotificationTap` internamente não é necessário — só ampliar o roteamento por `type` com um `switch`/mapa.

## C. Item 18 — central de notificações

`ReceivedNotifications` (`src/pages/ReceivedNotifications/index.jsx`) já lista os avisos administrativos (`notifications` collection, lido/não lido). Duas seções novas, computadas client-side, inseridas no TOPO da lista (sem persistir em `notifications`):
- **Avaliações pendentes**: `chats` do usuário com `status === "closed"` e sem doc próprio em `ratings` (reusa `getMyRating` por chat — para poucas conversas encerradas é aceitável; sem paginação nesta fase). Item: "Avalie {outro participante}" → abre o chat (`dataRoutes.publicationChat`).
- **Atalho de não lidas**: se `useUnreadChatsCount() > 0`, um item fixo "Você tem N mensagem(ns) não lida(s)" → `dataRoutes.myChats`.
Essas duas seções renderizam como `MessageCard`-like acima da lista real, com um rótulo de seção ("Pendências") — usam os styled components já existentes da tela quando possível; criar `SectionLabel` novo se necessário.

## Error handling
- `getAllUserTokenNotification` sem `id` quebraria filtragem — corrigido ao incluir o id.
- Falha ao buscar avaliações pendentes → seção simplesmente não aparece (sem crash).
- Scheduled function sem tokens → não faz nada (Promise.all vazio).

## Testing
Sem util puro novo isolado desta fase (filtragem e agregação são consultas/composição, não lógica pura isolável de forma significativa). Suíte mantém baseline. Manual: publicar anúncio como produtor → cliente recebe push, produtor não recebe, outro produtor não recebe; editar anúncio → mesmo filtro; central mostra pendência de avaliação após venda e atalho de não lidas; lembretes (testáveis só manualmente/via `firebase functions:shell` após deploy, fora do escopo desta implementação).
