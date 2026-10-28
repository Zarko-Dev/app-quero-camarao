# React Native Firebase Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement this plan task-by-task. Start with audit verification, then execute one task at a time with lint, tests, build/doctor, and behavior checks before moving forward.

**Goal:** Refatorar Firebase, financeiro, orders, notificacoes, App.jsx, cache, seguranca e testes sem reescrita destrutiva.

**Architecture:** Migração progressiva por adapters e repositories, mantendo compatibilidade com chamadas existentes até cada fluxo estar validado. Cálculos financeiros saem do cliente para Cloud Functions com contrato canônico de `orders`, timezone do backend e autorização admin no servidor.

**Tech Stack:** Expo SDK 53, React Native 0.79, React 19, Firebase Web SDK 10.14.1, Firebase Cloud Functions v2, Firebase Admin SDK, Firestore, Storage, Expo Notifications, React Navigation v7, Redux Toolkit, Sentry, Jest, Node test runner.

---

## 1. Arquitetura atual encontrada

O app é Expo/React Native com entrada em `App.jsx`, navegação em `src/routes`, estado global em Redux Toolkit, acesso a Firebase Web SDK centralizado parcialmente em `src/services/Firebase` e uso real espalhado por `src/controllers`, `src/pages` e alguns componentes.

`App.jsx` concentra providers, Sentry, Discord alerts, permissões, notification handler, roteamento de push, fontes, tema, status bar, badge sync, keyboard wrapper e escolha entre `Routes` e `InternetInfo`.

Cloud Functions já existem em `functions/src`, com Node 20, `firebase-functions`, `firebase-admin`, webhooks de pagamento, notificações de chat, agregações de users/ratings/views e testes Jest.

## 2. Onde Firebase Web SDK está sendo utilizado

Entrada central:
- `src/services/Firebase/index.js`: `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`, `firebase/functions`.
- `src/services/Firebase/config.js`: usa variáveis via `@env`.
- `src/services/Firebase/models.js`: nomes de coleções e paths de Storage.

Imports diretos de Firebase Web SDK aparecem em:
- `src/controllers/Payment/order.js`
- `src/controllers/User/authentication.js`
- `src/controllers/User/register.js`
- `src/controllers/User/resetPassword.js`
- `src/controllers/User/resetPasswordByIdentifier.js`
- `src/controllers/User/getPasswordResetToken.js`
- `src/controllers/User/getAll.js`
- `src/controllers/User/getSummary.js`
- `src/controllers/User/update.js`
- `src/controllers/User/updateAddress.js`
- `src/controllers/User/updateToProductor.js`
- `src/controllers/User/deleteUser.js`
- `src/controllers/User/saveImage.js`
- `src/controllers/User/notification.js`
- `src/controllers/Chat/index.js`
- `src/controllers/Chat/attention.js`
- `src/controllers/Chat/messageActions.js`
- `src/controllers/Chat/ratings.js`
- `src/controllers/Chat/sold.js`
- `src/controllers/Chat/uploadAudio.js`
- `src/controllers/Chat/uploadFile.js`
- `src/controllers/Chat/uploadImage.js`
- `src/controllers/Chat/uploadVideo.js`
- `src/controllers/Chat/getLocation.js`
- `src/controllers/Publication/*`
- `src/controllers/DrawPrizes/*`
- `src/controllers/Cupons/*`
- `src/controllers/Wallet/*`
- `src/controllers/PublishAds/*`
- `src/controllers/ShrimpPonds/*`
- `src/controllers/ShirimpSale/sale.js`
- `src/controllers/Signature/get.js`
- `src/controllers/Config/find.js`
- `src/controllers/Invitations/*`
- `src/pages/MyChats/index.jsx`
- `src/pages/PublicationChat/index.jsx`
- `src/pages/PublicationDetail/index.jsx`
- `src/pages/UserProfile/index.jsx`
- `src/pages/Admin/DrawPrize/DrawPrizeNew.jsx`
- `src/pages/Admin/DrawPrizeRules/DrawPrizeRulesNew.jsx`
- `src/utils/hooks/useInternetConnection.jsx`

## 3. Onde orders é lido/escrito

Arquivo central:
- `src/controllers/Payment/order.js`

Operações encontradas:
- `savePaymentOrder`: grava `orders/{idOrder}` direto do cliente.
- `savePublicationPaymentOrder`: faz merge de URL de pagamento e dados da publicação.
- `savePublicationPaymentPixOrder`: faz merge de log Pix e dados da publicação.
- `getPaymentOrder`: consulta por `idOrder`.
- `updateOrderStatus`: altera `status` no cliente.
- `updateOrder`: merge genérico no cliente.
- `isOrderPublished`: lê `published`.
- `deleteOrder`: deleta order.
- `getAllUserOrders`: lista por `userId`.
- `getAllApprovedOrders`: lista todos approved.
- `getApprovedOrdersByYear`: lista approved por ano e possui fallback para todos approved.

Backend relacionado:
- `functions/src/paymentPix.js`: lê `orders`, usa `paymentValue` para criar Pix.
- `functions/src/paymentWebhook.js`: atualiza `orders` após webhook.
- `firestore.rules`: `match /orders/{orderId}` permite create/update/delete pelo dono em cenários ainda críticos.

## 4. Onde existem cálculos financeiros

Financeiro admin:
- `src/pages/Admin/Home/index.jsx`: soma `paymentValue`, filtra por mês/ano, calcula mês atual, ano, mês anterior e próximo mês.
- `src/controllers/Payment/order.js`: normaliza datas, filtra orders aprovados, cacheia resultados e busca orders para o painel.
- `src/pages/Admin/Home/components/CardTransaction/index.jsx`: renderiza `paymentValue`.
- `src/pages/Admin/DetailsTransactionPayment/index.jsx`: renderiza detalhes da transação.

Financeiro checkout/pagamento:
- `src/pages/Publication/index.jsx`: calcula `subtotal` e `total` para publicação.
- `src/pages/Payment/components/PaymentButton/index.jsx`: fluxo de pagamento e wallet.
- `src/pages/PaymentEnd/index.jsx`: conclusão de pagamento/publicação.
- `src/pages/Payment/components/ResumeCrad/index.jsx`: resumo financeiro/cupom.
- `src/utils/mercadoPagoPix.js` e `functions/src/paymentPix.js`: usam `Number(orderData?.paymentValue || 0)`.

## 5. Estrutura atual do App.jsx

Responsabilidades no mesmo arquivo:
- Imports base de React Native e polyfills.
- `Notifications.setNotificationHandler`.
- `ignoreLogs`.
- `Sentry.init`.
- `createDiscordAlertContext` e `configureDiscordAlertReporter`.
- `installGlobalErrorHandler`.
- `paperTheme`.
- Permissões iOS/Android e canal de notificação Android.
- Push notification routing com `navigationRef.isReady()` + retry com `setTimeout`.
- Fonte Comfortaa.
- Composition root com `SafeAreaProvider`, `ThemeProvider`, `PaperProvider`, `ProviderRedux`, `ContentStatusBar`, `BadgeSync`, `KeyboardSafeContent`, `Routes`, `InternetInfo`, `Toast`, `AlertNewVersion`.

## 6. Implementação atual das notificações

Push local/app:
- `App.jsx`: registra notification handler, canal Android, permissões e response listeners.
- `src/components/BadgeSync/index.jsx`: sincroniza badge com unread chats.
- `src/pages/Home/index.jsx`: pede permissão e grava Expo push token no usuário.
- `src/services/ExpoNotification/sendNotification.js`: envia para Expo Push API.
- `src/controllers/Notifications/sendNotifications.js`: envia em lotes de 100 com `setTimeout`.
- `src/controllers/Notifications/saveNotification.js`: persiste notificações.
- `src/controllers/User/notification.js`: grava e busca tokens.

Push backend:
- `functions/src/chatNotifications.js`: trigger de mensagem do chat envia Expo push com payload `type: "chat"`.
- `functions/src/reminders.js`: lembretes agendados.

Roteamento atual:
- `App.jsx` aceita `type`: `chat`, `attention`, `publication`, `registerMyAds`.
- Cold start usa `getLastNotificationResponseAsync`.
- Background/foreground usa `addNotificationResponseReceivedListener`.
- Problema principal: retry manual com `navigationRef.isReady()` e `setTimeout`.

## 7. Estrutura Redux/cache

Redux:
- `src/store/index.js`: `configureStore`, `immutableCheck: false`, `serializableCheck: false`.
- `src/store/reducers.js`: combina reducers antigos por tela/componente.
- Slices/reducers: `login`, `publication`, `shrimpCardShared`, `payment`, `invitation`, `paymentWallet`, `configSystem`, `notificationExecute`.

Caches manuais encontrados:
- `src/controllers/Payment/order.js`: approved orders e approved orders por ano com TTL 60s.
- `src/controllers/Publication/getViewLogs.js`: view logs com TTL 120s.
- `src/controllers/User/getAll.js`: users com TTL 120s.
- `src/pages/Home/index.jsx`: `cachedInitialData`, `cachedPublications`, `cachedLastVisible`, `cachedPrefetchedPublications`.
- `src/components/BannerShrimpSalePrice/index.jsx`: `cachedSalesBanner`.
- `src/controllers/Notifications/sendNotificationNewPublication.js`: `Set` contra envio duplicado.
- `src/services/DiscordAlerts/index.js` e `functions/src/discordAlerts.js`: `Map` com TTL para dedup de alerta.
- `src/utils/hooks/useCacheFiles.jsx`: cache de arquivos em `FileSystem.cacheDirectory`.

## 8. Cloud Functions existentes

Entrypoint:
- `functions/src/index.js`

HTTP/callable:
- `paymentpix`
- `paymentwebhook`
- `getPasswordResetToken`
- `resetPasswordByIdentifier`

Triggers/agendadas:
- `onRatingWritten`
- `onChatMessageCreated`
- `onUserWritten`
- `onPublicationViewWritten`
- `mondayProducerReminder`
- `tuesdayProducerReminder`
- `wednesdayClientReminder`
- `thursdayClientReminder`

Não existe ainda função de métricas financeiras admin como `adminDashboardMetrics`.

## 9. Firebase Security Rules existentes

Firestore:
- `firestore.rules` usa `request.auth.token.email` como identidade de domínio.
- `isAdmin()` consulta `users/{email}.rules.hasAny(['Admin'])`.
- `orders` permite read para dono/admin, create para dono, update para dono preservando `userId`, delete para dono/admin.
- Comentário em rules reconhece risco: `status/published` deveriam ser só Cloud Function, mas client ainda aprova fluxos grátis/Pix.

Storage:
- `storage.rules` permite leitura pública para `user`, `Shrimp`, `ads`.
- Escrita em imagens públicas exige login.
- Anexos de chat exigem login para read/write, sem validação de participante no Storage.

## 10. Testes existentes

App:
- `package.json`: `npm run test:unit` executa `node --test tests/**/*.test.cjs`.
- Muitos testes de lógica pura em `tests/*.test.cjs`.
- Não há setup visível de React Native Testing Library no `package.json`.
- Não há typecheck, projeto é JavaScript.

Functions:
- `functions/package.json`: `npm test` executa Jest.
- Testes existentes cobrem publication views, users aggregate, ratings, chat notifications, Discord alerts e outros helpers.

## 11. Arquivos que precisarão ser alterados

Fundação Firebase:
- `package.json`
- `package-lock.json`
- `yarn.lock`
- `app.json`
- `ios/*`
- `android/*`
- `src/services/Firebase/index.js`
- `src/services/Firebase/config.js`
- criar `src/infrastructure/firebase/**`

Controllers/repositories:
- `src/controllers/**`
- `src/services/**`
- `src/utils/hooks/useInternetConnection.jsx`
- telas com imports diretos de Firebase.

Orders/admin:
- `src/controllers/Payment/order.js`
- `src/pages/Admin/Home/index.jsx`
- `src/pages/Admin/Home/components/CardTransaction/index.jsx`
- `src/pages/Admin/DetailsTransactionPayment/index.jsx`
- `src/pages/Payment/**`
- `src/pages/PaymentEnd/index.jsx`
- `src/utils/mercadoPagoPix.js`
- `functions/src/paymentPix.js`
- `functions/src/paymentWebhook.js`
- criar `functions/src/orders*.js`
- criar `functions/src/adminDashboardMetrics*.js`

App/bootstrap/notificações:
- `App.jsx`
- `src/routes/index.jsx`
- `src/routes/dataRoutes.js`
- criar `src/app/**`
- criar `src/providers/**`
- criar `src/notifications/**`

Security/tests:
- `firestore.rules`
- `storage.rules`
- `firebase.json`
- `tests/**`
- `functions/src/*.test.js`

## 12. Dependências que precisarão ser adicionadas/removidas

Adicionar progressivamente:
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `@react-native-firebase/storage`
- `@react-native-firebase/functions`
- `@react-native-firebase/messaging`, se a decisão for migrar de Expo push para FCM nativo.

Possíveis dependências de teste:
- `@react-native-firebase/testing` não é necessário por padrão.
- `@react-native-community/cli` já existe.
- React Native Testing Library só deve entrar se houver teste de componente real.

Remover depois da migração validada:
- `firebase` do app mobile, quando nenhum import mobile depender dele.

Manter por enquanto:
- `firebase-admin` e `firebase-functions` em `functions`.
- `expo-notifications`, se o contrato de push continuar usando Expo Push API.

## 13. Riscos da migração

- Firebase Web SDK usa long polling hoje; RN Firebase mudará transporte e lifecycle.
- Expo managed/prebuild exige validação real de Android/iOS, CocoaPods e Gradle.
- `google-services.json` existe; `GoogleService-Info.plist` não foi encontrado no inventário.
- Identidade do domínio usa email, não uid; RN Firebase/Auth e rules precisam preservar isso.
- `orders` tem regras hoje permitindo update client-side; bloquear antes de mover fluxos quebra pagamento/publicação.
- Migração monetária para centavos pode quebrar relatórios se legado continuar em `number`.
- Timezone atual tem ajuste manual `-3h`; trocar sem comparar dados pode alterar fechamento financeiro.
- Push navigation mexe em cold start, splash e deep links.
- Redux desliga serializable check porque há Date/Timestamp em estado; normalização pode revelar erros antigos.
- Caches manuais podem estar mascarando custo ou latência; remoção sem repositorios/persistência pode piorar UX.
- Existem dois lockfiles; não remover sem decisão explícita.

## 14. Ordem recomendada das mudanças

1. Congelar auditoria e baseline de testes/build.
2. Criar camada `src/infrastructure/firebase` com adapters Web compatíveis, sem trocar SDK ainda.
3. Migrar RN Firebase por módulo, começando por Auth e Firestore read-only.
4. Normalizar contrato de `orders` com validators e compatibilidade de leitura.
5. Criar Cloud Functions financeiras e testes backend.
6. Trocar Admin Home para função agregada.
7. Separar `App.jsx`.
8. Reescrever roteamento de push por notification router/linking.
9. Auditar Redux/cache e remover cache manual só depois de cada fluxo ter fonte nova.
10. Endurecer Firestore/Storage rules.
11. Rodar validação completa Android/iOS/EAS/Functions.

---

## Task Titles

1. Auditoria baseline e mapa de impacto
2. Matriz de imports Firebase Web SDK
3. Adapter Firebase compatível sem troca de SDK
4. Preparação nativa Android/iOS para React Native Firebase
5. Migração Auth para React Native Firebase
6. Migração Firestore read path para React Native Firebase
7. Migração Firestore write path para repositories
8. Migração Storage para React Native Firebase
9. Migração Functions callable para React Native Firebase
10. Decisão e migração de Messaging/Expo Notifications
11. Contrato canônico de orders
12. Leitor compatível para orders legados
13. Escrita validada de orders
14. Cloud Function adminDashboardMetrics
15. Testes financeiros de timezone e bordas
16. Admin Dashboard consumindo métricas agregadas
17. Remoção do download amplo de orders no Admin
18. Refatoração de App.jsx em composition root
19. Providers de erro, permissões, tema e notificações
20. Notification payload contract
21. Notification router e deep linking
22. Remoção de polling navigationRef.isReady
23. Inventário Redux por tipo de estado
24. Remoção progressiva de caches manuais
25. Firestore rules para orders e admin claims/rules
26. Storage rules para anexos e imagens públicas
27. Observabilidade sem dados sensíveis
28. Performance audit de reads, listeners e re-renders
29. Validação Android/iOS/EAS
30. Checklist final de regressão

---

## Execution Tasks

### Task 1: Auditoria baseline e mapa de impacto

**Arquivos:**
- Ler: `package.json`
- Ler: `functions/package.json`
- Ler: `App.jsx`
- Ler: `src/services/Firebase/index.js`
- Ler: `src/services/Firebase/models.js`
- Ler: `src/controllers/Payment/order.js`
- Ler: `firestore.rules`
- Ler: `storage.rules`
- Ler: `app.json`
- Ler: `eas.json`

**Objetivo:** congelar baseline antes de qualquer alteração funcional.

**Validação:**
- `npm run test:unit`
- `npx eslint App.jsx src/services/Firebase/index.js src/controllers/Payment/order.js src/pages/Admin/Home/index.jsx`
- `npm run doctor`
- `cd functions && npm test`

### Task 2: Matriz de imports Firebase Web SDK

**Arquivos:**
- Criar: `docs/audits/firebase-web-sdk-import-map-2026-09-02.md`

**Objetivo:** listar cada import `firebase/*`, tipo de uso, risco, prioridade de migração e owner funcional.

**Validação:**
- `rg -n "from ['\"]firebase|firebase/" src scripts App.jsx`

### Task 3: Adapter Firebase compatível sem troca de SDK

**Arquivos:**
- Criar: `src/infrastructure/firebase/app.js`
- Criar: `src/infrastructure/firebase/auth.js`
- Criar: `src/infrastructure/firebase/firestore.js`
- Criar: `src/infrastructure/firebase/storage.js`
- Criar: `src/infrastructure/firebase/functions.js`
- Modificar: `src/services/Firebase/index.js`

**Objetivo:** criar ponto único de infraestrutura mantendo Web SDK por baixo nesta etapa.

**Risco:** baixo, desde que exports antigos continuem compatíveis.

### Task 4: Preparação nativa Android/iOS para React Native Firebase

**Arquivos:**
- Modificar: `package.json`
- Modificar: `app.json`
- Verificar: `google-services.json`
- Verificar/criar conforme fonte oficial: `GoogleService-Info.plist`
- Modificar após prebuild controlado: `android/*`, `ios/*`

**Objetivo:** instalar módulos RN Firebase e validar configuração nativa real.

**Risco:** alto em Expo/EAS; exige build Android e iOS antes de avançar.

### Task 5: Migração Auth para React Native Firebase

**Arquivos:**
- Modificar: `src/infrastructure/firebase/auth.js`
- Modificar: `src/controllers/User/authentication.js`
- Modificar: `src/controllers/User/register.js`
- Modificar: `src/controllers/User/resetPassword.js`

**Objetivo:** substituir `firebase/auth` por `@react-native-firebase/auth` mantendo identidade por email.

**Validação:** login, cadastro, reset por email, storage de usuário e rota admin.

### Task 6: Migração Firestore read path para React Native Firebase

**Arquivos:**
- Modificar: controllers de leitura em `src/controllers/**`
- Modificar: telas com imports diretos de Firestore.

**Objetivo:** migrar leituras sem alterar escrita crítica primeiro.

**Validação:** Home, busca de publicações, chat, perfil, admin users, cupons, anúncios.

### Task 7: Migração Firestore write path para repositories

**Arquivos:**
- Criar/modificar repositories por domínio em `src/controllers/**` ou `src/repositories/**`

**Objetivo:** centralizar writes por domínio antes de endurecer rules.

**Validação:** publicação, edição, chat, sorteios, cupons, usuário, notificações.

### Task 8: Migração Storage para React Native Firebase

**Arquivos:**
- Modificar: `src/controllers/User/saveImage.js`
- Modificar: `src/controllers/Publication/savePondsImages.js`
- Modificar: `src/controllers/Chat/uploadAudio.js`
- Modificar: `src/controllers/Chat/uploadFile.js`
- Modificar: `src/controllers/Chat/uploadImage.js`
- Modificar: `src/controllers/Chat/uploadVideo.js`
- Modificar: `src/controllers/PublishAds/saveAds.js`

**Objetivo:** migrar upload/download URL para storage nativo.

**Validação:** foto perfil, foto publicação, ads, anexos chat.

### Task 9: Migração Functions callable para React Native Firebase

**Arquivos:**
- Modificar: `src/controllers/User/resetPasswordByIdentifier.js`
- Modificar: `src/controllers/User/getPasswordResetToken.js`

**Objetivo:** trocar `firebase/functions` por callable nativo.

**Validação:** recuperação por CPF/telefone e erro Sentry/Discord.

### Task 10: Decisão e migração de Messaging/Expo Notifications

**Arquivos:**
- Auditar: `App.jsx`
- Auditar: `src/services/ExpoNotification/sendNotification.js`
- Auditar: `functions/src/chatNotifications.js`
- Auditar: `app.json`

**Objetivo:** decidir se push continua Expo Push API ou migra para FCM nativo com `@react-native-firebase/messaging`.

**Critério:** não adicionar messaging nativo se Expo push continuar sendo fonte operacional.

### Task 11: Contrato canônico de orders

**Arquivos:**
- Criar: `docs/audits/orders-contract-2026-09-02.md`
- Criar: `functions/src/ordersContract.js`
- Criar: `functions/src/ordersContract.test.js`

**Objetivo:** definir schema real de `orders`, status válidos, timestamps e dinheiro.

**Decisão inicial:** preferir centavos para novo campo, mantendo leitura compatível de `paymentValue` legado até migração.

### Task 12: Leitor compatível para orders legados

**Arquivos:**
- Modificar: `src/controllers/Payment/order.js`
- Criar: `tests/ordersNormalization.test.cjs`

**Objetivo:** ler legado sem conversões silenciosas que alterem valor.

**Validação:** Date, Timestamp, `{ seconds }`, `paymentValue` number/string inválida, `idOrder` ausente.

### Task 13: Escrita validada de orders

**Arquivos:**
- Modificar: `src/controllers/Payment/order.js`
- Modificar: `functions/src/paymentPix.js`
- Modificar: `functions/src/paymentWebhook.js`
- Modificar: `firestore.rules`

**Objetivo:** impedir novas escritas inválidas e preparar bloqueio de status/published no cliente.

**Risco:** alto para pagamento grátis/Pix; precisa migração antes de bloquear.

### Task 14: Cloud Function adminDashboardMetrics

**Arquivos:**
- Criar: `functions/src/adminDashboardMetrics.js`
- Criar: `functions/src/adminDashboardMetrics.test.js`
- Modificar: `functions/src/index.js`

**Objetivo:** retornar métricas financeiras agregadas para admin autenticado/autorizado.

**Contrato inicial:** `revenue`, `orders`, `transactions`, `periodOptions`, `previousMonth`, `nextMonth`.

### Task 15: Testes financeiros de timezone e bordas

**Arquivos:**
- Criar/modificar: `functions/src/adminDashboardMetrics.test.js`

**Objetivo:** cobrir mês, ano, bordas, timezone do negócio, status aprovado/cancelado/pendente e valores inválidos.

**Timezone:** usar America/Fortaleza se auditoria confirmar que o ajuste atual `-3h` representa regra de negócio.

### Task 16: Admin Dashboard consumindo métricas agregadas

**Arquivos:**
- Modificar: `src/pages/Admin/Home/index.jsx`
- Criar/modificar: `src/controllers/Admin/dashboardMetrics.js`

**Objetivo:** remover soma financeira local e consumir função backend.

**Validação:** cards de ano/mês, mês anterior, próximo mês e transações.

### Task 17: Remoção do download amplo de orders no Admin

**Arquivos:**
- Modificar: `src/controllers/Payment/order.js`
- Modificar: `src/pages/Admin/Home/index.jsx`

**Objetivo:** remover `getAllApprovedOrders` do fluxo admin ou restringir a lista paginada necessária.

**Critério:** painel não baixa todos approved para calcular métrica.

### Task 18: Refatoração de App.jsx em composition root

**Arquivos:**
- Criar: `src/app/AppProviders.jsx`
- Criar: `src/app/AppNavigation.jsx`
- Criar: `src/app/bootstrap/initializeApp.js`
- Modificar: `App.jsx`

**Objetivo:** reduzir `App.jsx` para composição.

### Task 19: Providers de erro, permissões, tema e notificações

**Arquivos:**
- Criar: `src/providers/ErrorTrackingProvider.jsx`
- Criar: `src/providers/PermissionsProvider.jsx`
- Criar: `src/providers/NotificationProvider.jsx`
- Criar: `src/providers/AlertProvider.jsx`

**Objetivo:** separar bootstrap de Sentry/Discord, permissões, notification handler e wrappers visuais.

### Task 20: Notification payload contract

**Arquivos:**
- Criar: `src/notifications/payloadContract.js`
- Criar: `tests/notificationPayloadContract.test.cjs`
- Modificar: `functions/src/chatNotifications.js`
- Modificar: `src/controllers/Notifications/sendNotifications.js`

**Objetivo:** padronizar payload `type`, `resourceId`, `chatId`, `publicationId`, route params.

### Task 21: Notification router e deep linking

**Arquivos:**
- Criar: `src/notifications/notificationRouter.js`
- Criar: `tests/notificationRouter.test.cjs`
- Modificar: `src/routes/dataRoutes.js`
- Modificar: `src/routes/index.jsx`

**Objetivo:** mapear payload para rota/params em um único lugar.

### Task 22: Remoção de polling navigationRef.isReady

**Arquivos:**
- Modificar: `App.jsx` ou provider novo de notificações.
- Modificar: `src/routes/index.jsx`

**Objetivo:** usar linking/getInitialURL/listeners suportados pelo React Navigation para foreground, background e cold start.

### Task 23: Inventário Redux por tipo de estado

**Arquivos:**
- Criar: `docs/audits/redux-state-inventory-2026-09-02.md`

**Objetivo:** classificar cada reducer como server state, client state, derived state ou UI state.

### Task 24: Remoção progressiva de caches manuais

**Arquivos:**
- Modificar por fase: `src/controllers/Payment/order.js`, `src/controllers/User/getAll.js`, `src/controllers/Publication/getViewLogs.js`, `src/pages/Home/index.jsx`, `src/components/BannerShrimpSalePrice/index.jsx`.

**Objetivo:** remover cache artesanal quando houver source/cache nativo ou query adequada.

### Task 25: Firestore rules para orders e admin claims/rules

**Arquivos:**
- Modificar: `firestore.rules`
- Criar: testes de rules se Firebase Emulator entrar no setup.

**Objetivo:** bloquear alteração client-side de campos financeiros/status depois que Functions assumirem fluxo.

### Task 26: Storage rules para anexos e imagens públicas

**Arquivos:**
- Modificar: `storage.rules`

**Objetivo:** revisar anexos de chat e imagens públicas sem quebrar primeiro upload.

### Task 27: Observabilidade sem dados sensíveis

**Arquivos:**
- Modificar: `src/services/DiscordAlerts/**`
- Modificar: `functions/src/discordAlerts.js`
- Modificar callers Firebase/Functions/Notifications/Admin.

**Objetivo:** manter Sentry/Discord úteis sem senha, token, webhook, PII desnecessária ou dados financeiros brutos.

### Task 28: Performance audit de reads, listeners e re-renders

**Arquivos:**
- Criar: `docs/audits/performance-firestore-reads-2026-09-02.md`
- Auditar: `src/controllers/Chat/index.js`, `src/pages/Home/index.jsx`, `src/pages/Admin/Home/index.jsx`, `src/pages/Admin/Charts/index.jsx`.

**Objetivo:** medir consultas sem limite, listeners sem unsubscribe, downloads completos e re-renderizações.

### Task 29: Validação Android/iOS/EAS

**Arquivos:**
- Validar: `app.json`
- Validar: `eas.json`
- Validar: `android/*`
- Validar: `ios/*`

**Objetivo:** provar RN Firebase funcionando em Android e iOS.

**Comandos esperados:**
- `npm run doctor`
- `npm run ios`
- `npm run android`
- build EAS quando credencial/acesso estiver pronto.

### Task 30: Checklist final de regressão

**Arquivos:**
- Criar: `docs/qa/react-native-firebase-architecture-regression-2026-09-02.md`

**Objetivo:** evidência final para login, publicações, pagamento, admin, chat, push, storage, rules, Functions e performance.

**Critério:** só marcar completo com testes, lint, doctor/build e validação funcional real.
