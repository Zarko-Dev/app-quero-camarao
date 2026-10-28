# Notifications Strategy — Expo Push API vs. FCM Direct

## Recomendação

**Manter Expo Notifications (Expo Push API).** Não há migração necessária. Em todo o codebase — client e Cloud Functions — as notificações usam exclusivamente a Expo Push API (`https://exp.host/--/api/v2/push/send`). Nenhuma função chama FCM diretamente, e `@react-native-firebase/messaging` / `firebase/messaging` não são importados em nenhum lugar do projeto. Migrar para FCM direto adicionaria complexidade significativa (configuração de credenciais Firebase no backend, gerenciamento de tokens de tópicos, gerenciamento de permissões no client) sem ganho funcional para este caso de uso, que se resume a enviar notificações push unicast para tokens individuais armazenados no Firestore.

---

## Comparativo

| Dimensão | Expo Push API (atual) | FCM Direto via `@react-native-firebase/messaging` |
|---|---|---|
| Configuração do client | Nenhuma além do `expo-notifications` (já instalado). Token obtido com `getExpoPushTokenAsync`. | Necessário instalar `@react-native-firebase/app`, `@react-native-firebase/messaging`, `react-native-gradle-plugin`, configurar `google-services.json` e `GoogleService-Info.plist`, rodar `expo prebuild --clean`. |
| Configuração do backend (Cloud Functions) | Chamada HTTP direta para `exp.host/--/api/v2/push/send` — sem SDK, sem inicialização. | Necessário instalar `firebase-admin` SDK, inicializar com credenciais de serviço, lidar com `getMessaging()` e `sendEachForRecipient()` ou `send()`. |
| Armazenamento do token | `users.notification.token` (expo push token string). | `users.notification.token` (FCM token string). Formato diferente, não compatível direto com o atual. |
| Canal de entrega | Expo gerencia entrega, retry e psychological feedback do APNs/FCM internamente. | Você gerencia TTL, collapse, prioridade, e retry por conta própria. |
| Permissões no dispositivo | Tratado pelo `expo-notifications`. | Necessário `requestPermission()` no RN Firebase — mais código, mais pontos de falha. |
| Presença no projeto | Usado em 100% dos fluxos de notificação. | Zero uso atual. |

---

## Pontos Fortes do Expo Push API neste Projeto

1. **Simplicidade do backend**: Nenhuma inicialização, nenhum SDK de mensageria para manter. Uma chamada HTTP POST com corpo JSON é tudo que o Cloud Functions precisa.
2. **Token storage**: Token já armazenado como string em `users.notification.token` — sem mudança de schema.
3. **Batching**: Tanto `chatNotifications.js` quanto `reminders.js` já fazem batching (lotes de 100) para performance.
4. **Canal fixo**: `channelId: "notifications-app"` — consistente entre client e backend.

---

## Pontos Fracos do Expo Push API e Plano de Mitigação

### 1. Token inválido / expirado (beyondReplace / notRegistered)
**Problema**: A API Expo retorna `status: "error"` no ticket quando o token é inválido (dispositivo desinstalado, app removido, token expirado). Atualmente, o backend apenas loga o erro em console e não faz nada para limpar ou notificar.

**Mitigação**:
- Em `chatNotifications.js` (`sendExpoPush`), se o ticket retornar erro, implementar uma tentativa de atualizar o documento do usuário para remover `notification.token` ou marcá-lo como inválido em Firestore (ex: `users.{uid}.notification.invalidAt` com timestamp). Isso permite um job posterior (ou trigger) limpar tokens mortos.
- Em `reminders.js`, tokens que falham no push podem ser coletados no primeiro lote e reenviados no próximo lote ou marcados para remoção em batch — similar ao que um consumer legado faria.

### 2. Rate limits da API Expo
**Problema**: A API Expo tem limite de graça (free tier) e aceleração (paid). O projeto envia notificações em lotes de 100 no `reminders.js` mas sem controle de throttling quando o volume é alto. O `client-side` `sendNotification` fatia em 100 com delay de 3 segundos entre lotes (via `setTimeout`), mas o backend não tem controle de taxa adaptativo.

**Mitigação**:
- Aumentar o delay entre lotes no client de 3s para 5-10s conforme os limites do plano Expo forem publicados/ajustados no `package.json`/config.
- Implementar exponencial backoff no client em `sendNotification.js` se o resultado indicar `too_many_requests`.
- No `reminders.js` backend, considerar um semáforo ou fila (ex: `Buneworker` imperício/lock, coletor de resultados de batch pra saber se rejeitou e retentar depois).

### 3. Testes de integração ausentes para o envio real
**Problema**: Os testes unitários dos Cloud Functions mockam `fetch` mas não testam com tokens reais ou com o sandbox da Expo.

**Mitigação**: Manter o mock atual nos testes do `chatNotifications.test.js`. Para `reminders.js`, adicionar testes no nível de unidade para o `sendToUserType` verificando que ele faz POST para `exp.host` com array de tokens e body correto.

---

## O Que Mudaria Com FCM Direto

Se o time decidisse migrar para FCM direto (cenário futuro ou necessidade real):

1. **Backend (Cloud Functions)**: Necessário refatorar `sendExpoPush` em `chatNotifications.js` e `sendToUserType` em `reminders.js` para usar `admin.messaging().send()` ou `admin.messaging().sendEachForMulticast()` com payloads FCM:
   ```js
   {
     token: fcmToken,
     notification: { title, body },
     data: { type, chatId, publicationId, ... },
     android: { ttl: 3600, priority: "high" },
     apns: { payload: { aps: { sound: "default" } } }
   }
   ```
2. **Client**: Trocar `getExpoPushTokenAsync` por `messaging().getToken()` do `@react-native-firebase/messaging` — isso requer configurar `google-services.json` e `GoogleService-Info.plist`, e alterar `token` schema (atual não é compatível; precisaria de script de migração para transplantar tokens existentes).
3. **Permissões**: O client precisa pedir permissão via `requestPermission()` antes de `getToken()` — experiência do usuário ligeiramente diferente do Expo, que já abstrai isso.


## Payload Atual

### Client-side (`sendNotification.js` em `src/services/ExpoNotification/sendNotification.js`)
```json
{
  "to": "<expo_push_token>",
  "title": "<string>",
  "body": "<string>",
  "sound": "default",
  "channelId": "notifications-app",
  "data": {
    "type": "chat" | "publication" | "registerMyAds" | "...",
    "chatId": "<string>",
    "publicationId": "<string>",
    "sellerId": "<string>",
    "buyerId": "<string>",
    "sellerName": "<string>",
    "buyerName": "<string>",
    "...": "outro-campo-contextual"
  }
}
```

### Exemplos reais usados hoje

**Chat message** (`chatNotifications.js`, `sendExpoPush`):
- `data.type`: `"chat"`
- `data.chatId`: ID do chat
- `data.publicationId`: ID da publicação associada
- `data.sellerId`, `data.buyerId`, `data.sellerName`, `data.buyerName`: metadados
- Extras de controle de erro e logging no canal

**Reminders** (`reminders.js`, `sendToUserType`):
- Batched: `to: [token1, token2, ...]` (até 100 por request)
- `data.type`: `"registerMyAds"` ou `"publication"`
- Sem `channelId` no corpo (embora a API do Expo aceite fields not used no batch atual)

**Testes de referência** (`chatNotifications.test.js`):
- O mock de `fetch` verifica que o POST body contém `to`, `title`, `data` com `type: "chat"` e `chatId`.
- `sound: "default"` e `channelId: "notifications-app"` são enviados por todos os chamadas no projeto.

---

## Conclusão da Recomendação

**Zero migração necessária.**
- Ambos os Cloud Functions (`chatNotifications.js` e `reminders.js`) usam Expo Push API, não FCM.
- O cliente (`sendNotification.js`) usa Expo Push API.
- Usar `@react-native-firebase/messaging` traria complexidade desnecessária para unicast push onde o Expo já entrega o serviço pronto.
- Se no futuro o app precisar de recursos avançados (topics, data messages em background, melhora de analytics no push), aí sim considerar a migração — mas não é o caso agora.</think><tool_call>read
<arg_key>filePath</arg_key>
<arg_value>/Users/pedroroger/Documents/app-quero-camarao/docs/notifications-strategy.md