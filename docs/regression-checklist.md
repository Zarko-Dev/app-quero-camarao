# Checklist Final de Regressão — Firebase / RN Refactor

> Projeto: mobile-quero-camarao (Expo SDK 53, RN 0.79.6)
> Migração: Firebase Web SDK v10 → `@react-native-firebase/*`
> Baseline: `audit-baseline.md`
> Gerado: 2026-09-02

---

## 1. Auth — Login, Logout, Registro, Biometria, Reset de Senha

### 1.1 Login com email e senha
- [ ] **Passos manuais**: Abrir a tela de login → inserir email e senha válidos → tapar "Entrar" → verificar navegação para a home screen e presença do token de autenticação no UserStorage.
- [ ] **Cobertura automática**: Nenhum teste unitário direto de login UI; `tests/resetPasswordIdentity.test.cjs` cobre o reset por CPF/telefone (indireto). O controller `src/controllers/User/authentication.js` é o alvo da migração.
- [ ] **Risco RN Firebase**: `signInWithEmailAndPassword` de `firebase/auth` (Web SDK) → `@react-native-firebase/auth`. O `getReactNativePersistence` e o `initializeAuth` com `ReactNativeAsyncStorage` devem ser configurados corretamente no `src/services/Firebase/index.js`. Se a persistência falhar, o usuário será desconectado ao fechar o app.

### 1.2 Logout
- [ ] **Passos manuais**: Abrir menu lateral ou perfil → tapar "Sair" → verificar redirecionamento para a tela de login e limpeza do UserStorage (AsyncStorage).
- [ ] **Cobertura automática**: Nenhum teste específico de logout. O `UserStorage` (`src/services/Storage/UserStorage.js`) é testado indiretamente pelo `activeChatTracker.test.cjs` e `chatSessionState.test.cjs`.
- [ ] **Risco RN Firebase**: O `signOut()` da Web SDK e do `@react-native-firebase/auth` têm assinaturas compatíveis, mas a limpeza da persistência local (AsyncStorage) deve ser verificada manualmente para garantir que o token não persista entre sessões.

### 1.3 Registro de novo usuário
- [ ] **Passos manuais**: Abrir tela de registro → preencher nome, email, senha, CPF/telefone → aceitar termos → tapar "Cadastrar" → verificar redirecionamento para a home e criação do documento `users/{email}` no Firestore com `activeBiometric: false`.
- [ ] **Cobertura automática**: Nenhum teste unitário direto de registro. Os controllers `src/controllers/User/register.js` e `src/controllers/User/authentication.js` são os alvos da migração.
- [ ] **Risco RN Firebase**: `createUserWithEmailAndPassword` exige `getAuth()` com persistência configurada via `initializeAuth` + `getReactNativePersistence`. No Web SDK, a persistência é automática; no RN Firebase, requer configuração explícita. Se `initializeAuth` não for chamado antes do `getAuth()`, o registro falhará silenciosamente.

### 1.4 Biometria (UserStorage activeBiometric)
- [ ] **Passos manuais**: Acessar configurações de perfil → ativar biometria (Face ID / impressão digital) → fechar e reabrir o app → verificar se o login biométrico é oferecido → desativar biometria → verificar que o campo `activeBiometric` no UserStorage é atualizado para `false`.
- [ ] **Cobertura automática**: Nenhum teste de biometria. O campo `activeBiometric` é setado em `src/controllers/User/authentication.js:47` e `src/controllers/User/register.js:91`.
- [ ] **Risco RN Firebase**: A biometria é gerenciada pelo Expo (`expo-local-authentication`), não pelo Firebase. O risco está na persistência do `activeBiometric` no AsyncStorage após a migração do Firebase. Se o `getReactNativePersistence` não for configurado, o UserStorage pode perder o estado de biometria entre sessões.

### 1.5 Reset de senha por email
- [ ] **Passos manuais**: Na tela de login → tapar "Esqueci a senha" → inserir email cadastrado → verificar recebimento do email de reset → tapar no link → definir nova senha → verificar login com a nova senha.
- [ ] **Cobertura automática**: `tests/resetPasswordIdentity.test.cjs` cobre o reset por CPF/telefone (callable), mas não o reset por email (que usa `sendPasswordResetEmail` direto).
- [ ] **Risco RN Firebase**: `sendPasswordResetEmail` de `firebase/auth` (Web SDK) → `@react-native-firebase/auth`. A assinatura é compatível, mas o domínio de email do remetente deve estar configurado no Firebase Console (Authentication → Email templates). A migração para RN Firebase pode alterar o comportamento do template de email se a configuração do projeto Firebase for modificada.

### 1.6 Reset de senha por CPF/telefone (callable)
- [ ] **Passos manuais**: Na tela de login → tapar "Esqueci a senha" → selecionar "CPF ou telefone" → inserir CPF ou telefone cadastrado → verificar recebimento do código de reset → definir nova senha → verificar login com a nova senha.
- [ ] **Cobertura automática**: `tests/resetPasswordIdentity.test.cjs` cobre o `resetPasswordByIdentifier` callable. `tests/mercadoPagoPix.test.cjs` e `tests/paymentPixUser.test.cjs` cobrem a integração com callable functions (indiretamente).
- [ ] **Risco RN Firebase**: `httpsCallable` de `firebase/functions` (Web SDK) → `@react-native-firebase/functions`. A migração exige que o `getFunctions()` seja inicializado corretamente no `src/services/Firebase/index.js`. No Web SDK, o region é opcional; no RN Firebase, a region padrão pode ser diferente (`us-central1` vs a configurada). O callable `resetPasswordByIdentifier` usa `admin.auth().getUserByEmail` e `admin.auth().updateUser` — esses não mudam, mas a invocação do lado cliente pode falhar se a instância de Functions não apontar para a mesma região.

---

## 2. Publicações — Criar, Editar, Deletar Camarão, Upload de Imagens, Expiração

### 2.1 Criar publicação de camarão
- [ ] **Passos manuais**: Navegar para "Publicar" → preencher título, descrição, preço, localização → selecionar imagens → tapar "Publicar" → verificar que o documento `shrimpPonds/{id}` é criado no Firestore com `expirationDate` (15 dias) e que as imagens são uploadadas para `Shrimp/` no Storage.
- [ ] **Cobertura automática**: `tests/publicationSummary.test.cjs` cobre o resumo de publicações. `tests/uploadImageBlob.test.cjs`, `tests/uploadAudioBlob.test.cjs`, `tests/uploadFileBlob.test.cjs`, `tests/uploadVideoBlob.test.cjs` cobrem os uploads de blobs.
- [ ] **Risco RN Firebase**: `uploadBytes` e `getDownloadURL` de `firebase/storage` (Web SDK) → `@react-native-firebase/storage`. O caminho de storage (`Shrimp/`, `user/`, `ads/`) deve ser preservado exatamente, pois as Storage Rules dependem desses paths. No RN Firebase, `ref()` usa a mesma sintaxe de path, mas a inicialização do `getStorage()` requer o app Firebase inicializado. Se o `storage()` não for obtido do `@react-native-firebase/storage`, os uploads falharão com erro de permissão.

### 2.2 Editar publicação
- [ ] **Passos manuais**: Abrir uma publicação própria → tapar "Editar" → modificar título ou preço → salvar → verificar que o documento `shrimpPonds/{id}` é atualizado no Firestore e que as imagens antigas são substituídas ou novas imagens são adicionadas.
- [ ] **Cobertura automática**: Nenhum teste específico de edição de publicação. `tests/publicationSummary.test.cjs` cobre o resumo, não a mutação.
- [ ] **Risco RN Firebase**: `updateDoc` de `firebase/firestore` (Web SDK) → `@react-native-firebase/firestore`. A sintaxe é compatível, mas se a migração para RN Firebase alterar a serialização de `Timestamp` ou `Date` objects, campos como `expirationDate` e `createdAt` podem ser gravados incorretamente.

### 2.3 Deletar publicação
- [ ] **Passos manuais**: Abrir uma publicação própria → tapar "Excluir" → confirmar → verificar que o documento `shrimpPonds/{id}` é removido do Firestore e que as imagens no Storage são deletadas.
- [ ] **Cobertura automática**: Nenhum teste específico de deleção de publicação. `tests/uploadImageBlob.test.cjs` e similares cobrem upload, não deleção.
- [ ] **Risco RN Firebase**: `deleteDoc` de `firebase/firestore` e `deleteObject` de `firebase/storage` (Web SDK) → `@react-native-firebase/firestore` e `@react-native-firebase/storage`. O `deleteObject` requer que o `ref()` seja construído com o path correto. Se o path do Storage mudar (ex: `Shrimp/` vs `shrimp/`), a deleção falhará silenciosamente.

### 2.4 Upload de imagens (Storage)
- [ ] **Passos manuais**: Na tela de criar publicação → selecionar 1-5 imagens → verificar que cada imagem é uploadada para `Shrimp/` no Storage → verificar que os URLs de download são salvos no documento `shrimpPonds/{id}` no campo `images`.
- [ ] **Cobertura automática**: `tests/uploadImageBlob.test.cjs`, `tests/uploadAudioBlob.test.cjs`, `tests/uploadFileBlob.test.cjs`, `tests/uploadVideoBlob.test.cjs` cobrem os uploads de blob. `tests/savePondsImages.test.cjs` (se existir) cobriria o salvamento.
- [ ] **Risco RN Firebase**: `getDownloadURL`, `ref`, `uploadBytes` de `firebase/storage` (Web SDK) → `@react-native-firebase/storage`. No Web SDK, `ref()` é obtido de `getStorage()`. No RN Firebase, `storage()` é o import direto de `@react-native-firebase/storage`. A referência ao bucket deve ser a mesma. Se o `storage()` não apontar para o mesmo bucket, os uploads falharão com erro de "bucket not found".

### 2.5 Expiração de publicações
- [ ] **Passos manuais**: Criar uma publicação → aguardar 15 dias (ou alterar a data de expiração no console) → verificar que a publicação não aparece mais na listagem de camarões → verificar que as imagens do Storage ainda existem (não são deletadas automaticamente).
- [ ] **Cobertura automática**: Nenhum teste de expiração automática. A expiração é calculada client-side em `src/controllers/Publication/saveShrimpPonds.js:13-15` com `expirationDate = currentDate + 15 dias`.
- [ ] **Risco RN Firebase**: A expiração é calculada no cliente com `new Date()` + 15 dias. Se a migração para RN Firebase alterar a forma como `Date` objects são serializados no Firestore (ex: `Timestamp` vs `Date`), a comparação de expiração pode falhar. Além disso, não há Cloud Function de expiração automática — a expiração depende inteiramente do cliente.

---

## 3. Pagamentos — Cartão (WebView), PIX (paymentpix + fallback client), Webhook de Aprovação + Autopublicação

### 3.1 Pagamento com cartão (WebView)
- [ ] **Passos manuais**: No checkout → selecionar "Cartão de crédito" → preencher dados do cartão → tapar "Pagar" → verificar que o WebView abre com a página de pagamento → completar o pagamento no WebView → verificar redirecionamento de volta ao app → verificar que o pedido é marcado como `status: "approved"` e `published: true`.
- [ ] **Cobertura automática**: Nenhum teste de WebView de cartão. `tests/ordersContract.test.cjs` cobre a validação de pedidos (incluindo `paymentValue` e `dataCupomPayment`).
- [ ] **Risco RN Firebase**: O WebView de cartão não depende diretamente do Firebase SDK — é um componente React Native (provavelmente `react-native-webview`). O risco está na comunicação entre o WebView e o app: se a URL de retorno (redirect URI) for alterada durante a migração do Firebase, o pagamento pode não ser detectado corretamente. Além disso, o `paymentUrl` gerado pelo backend deve ser obtido via `httpsCallable` ou `getFunctions()` — se a instância de Functions não estiver configurada corretamente após a migração, o `paymentUrl` será nulo.

### 3.2 Pagamento PIX (callable `paymentpix` + fallback client)
- [ ] **Passos manuais**: No checkout → selecionar "PIX" → tapar "Pagar" → verificar que o QR Code ou cópia de código PIX é exibido → simular o pagamento no app bancário → verificar que o webhook de aprovação é recebido → verificar que o pedido é marcado como `status: "approved"` e `published: true`.
- [ ] **Cobertura automática**: `tests/mercadoPagoPix.test.cjs` cobre a construção do payload PIX para o usuário. `tests/paymentPixUser.test.cjs` cobre o `buildPixPaymentUser`. `tests/ordersContract.test.cjs` cobre a validação de pedidos com `dataCupomPayment`.
- [ ] **Risco RN Firebase**: O callable `paymentpix` é invocado via `httpsCallable` de `firebase/functions` (Web SDK) → `@react-native-firebase/functions`. O fallback client (quando o webhook ainda não processou) depende do polling ou listener no `orders` collection. Se a migração para RN Firebase alterar a forma como `onSnapshot` funciona (ex: `onSnapshot` do `@react-native-firebase/firestore` vs Web SDK), a atualização em tempo real do status do pedido pode falhar, fazendo o app mostrar "Pendente" mesmo após aprovação.

### 3.3 Webhook de aprovação de pagamento + autopublicação
- [ ] **Passos manuais**: Realizar pagamento PIX → aguardar aprovação → verificar que o webhook `paymentwebhook` recebe a notificação de aprovação → verificar que o pedido é atualizado com `status: "approved"` e `published: true` → verificar que a publicação do camarão é automaticamente criada no Firestore (`shrimpPonds`).
- [ ] **Cobertura automática**: `tests/paymentWebhookAutoPublish.test.cjs` cobre explicitamente `publishApprovedOrder` — a autopublicação quando o webhook aprova o pedido. `tests/ordersContract.test.cjs` cobre a validação do status do pedido.
- [ ] **Risco RN Firebase**: O webhook `paymentwebhook` é uma Cloud Function (`onRequest` HTTP) que roda no backend — não é afetado pela migração do cliente para RN Firebase. Porém, se o `paymentUrl` gerado pelo callable `paymentpix` mudar de domínio (ex: de `paymentpix-73bqtyvvfq-uc.a.run.app` para outro), o fluxo de pagamento PIX pode quebrar. Além disso, a autopublicação depende do webhook ler o `orders` collection e atualizar o `shrimpPonds` collection — isso usa o `firebase-admin` SDK (server-side), que não é afetado pela migração do cliente.

---

## 4. Orders — Listagem por Usuário, Dashboard Admin, Status

### 4.1 Listagem de pedidos por usuário
- [ ] **Passos manuais**: Login como usuário → navegar para "Meus Pedidos" → verificar que apenas os pedidos do usuário logado são exibidos → verificar que os campos `idOrder`, `paymentValue`, `status`, `published` estão corretos → verificar que pedidos com `status: "approved"` e `published: true` aparecem como "Publicado".
- [ ] **Cobertura automática**: `tests/ordersContract.test.cjs` cobre a validação e normalização de pedidos. `tests/paymentWebhookAutoPublish.test.cjs` cobre a autopublicação de pedidos aprovados.
- [ ] **Risco RN Firebase**: `query`, `where`, `orderBy`, `getDocs` de `firebase/firestore` (Web SDK) → `@react-native-firebase/firestore`. A query `where("userId", "==", userEmail)` depende do email como ID do documento. Se a migração para RN Firebase alterar a forma como o email é obtido do `getAuth()`, a listagem pode retornar resultados vazios. Além disso, os caches locais em `src/controllers/Payment/order.js` (`cachedApprovedOrders`, `cachedApprovedOrdersByYear`) com TTL de 60s podem retornar dados stale após a migração se a chave de cache não for invalidada corretamente.

### 4.2 Dashboard admin de métricas
- [ ] **Passos manuais**: Login como admin → navegar para o dashboard admin → verificar que `totalRevenue`, `monthlyRevenue`, `statusBreakdown` são exibidos corretamente → verificar que a lista de usuários é carregada → verificar que a lista de publicações pendentes é carregada.
- [ ] **Cobertura automática**: Nenhum teste específico de dashboard admin. `tests/ordersContract.test.cjs` cobre a validação de pedidos (indiretamente).
- [ ] **Risco RN Firebase**: O dashboard admin usa `getAdminDashboardMetrics()` que faz `getDocs` na coleção `orders` com filtros de data. A migração para RN Firebase pode alterar a forma como `Timestamp` objects são comparados nas queries. Se o `order.createdAt` for um `Date` no cliente mas um `Timestamp` no Firestore, a comparação pode falhar. Além disso, o dashboard admin depende do `isAdmin()` check nas Firestore Rules — se as regras não forem atualizadas durante a migração, o dashboard pode falhar silenciosamente.

### 4.3 Status dos pedidos
- [ ] **Passos manuais**: Criar um pedido com PIX → verificar que o status inicial é "pending" → simular aprovação via webhook → verificar que o status muda para "approved" → verificar que `published` muda para `true` → verificar que o pedido aparece na listagem do usuário como "Publicado".
- [ ] **Cobertura automática**: `tests/ordersContract.test.cjs` cobre os valores de `ORDER_STATUS`. `tests/paymentWebhookAutoPublish.test.cjs` cobre a transição de `pending` → `approved` + `published`.
- [ ] **Risco RN Firebase**: O status do pedido é atualizado pelo webhook (server-side) via `firebase-admin` SDK, não pelo cliente. Porém, o cliente lê o status via `onSnapshot` ou `getDocs`. Se a migração para RN Firebase alterar o comportamento do listener (ex: `onSnapshot` do `@react-native-firebase/firestore` não dispara para documentos já existentes), o status pode não atualizar em tempo real no app.

---

## 5. Chat — Texto, Imagem, Áudio, Vídeo, Notificações de Mensagem, Marcar Lida

### 5.1 Envio de mensagem de texto
- [ ] **Passos manuais**: Abrir um chat → digitar mensagem → tapar enviar → verificar que a mensagem aparece na lista → verificar que o documento é criado em `chats/{chatId}/messages/{messageId}` no Firestore.
- [ ] **Cobertura automática**: `tests/chatController.test.cjs` cobre o controle de chat. `tests/chatSessionState.test.cjs` cobre o estado da sessão de chat. `tests/messagePreview.test.cjs` cobre a pré-visualização de mensagens.
- [ ] **Risco RN Firebase**: `addDoc`, `setDoc`, `onSnapshot` de `firebase/firestore` (Web SDK) → `@react-native-firebase/firestore`. O `onSnapshot` listener no chat deve continuar recebendo atualizações em tempo real. No RN Firebase, `onSnapshot` tem comportamento ligeiramente diferente para documentos existentes — pode não disparar o callback inicial se o documento já existe. Isso pode fazer com que mensagens enviadas recentemente não apareçam imediatamente na lista.

### 5.2 Envio de imagem no chat
- [ ] **Passos manuais**: Abrir um chat → tapar no ícone de câmera → selecionar uma imagem → verificar que a imagem é uploadada para `chats/{chatId}/` no Storage → verificar que a mensagem com a URL da imagem aparece no chat.
- [ ] **Cobertura automática**: `tests/uploadImageBlob.test.cjs` cobre o upload de blob de imagem. `tests/chatController.test.cjs` cobre o controle de chat.
- [ ] **Risco RN Firebase**: `uploadBytes` e `getDownloadURL` de `firebase/storage` (Web SDK) → `@react-native-firebase/storage`. O path de storage para imagens de chat é `chats/{chatId}/**`. Se a migração para RN Firebase alterar a forma como `ref()` constrói o path, a imagem pode ser uploadada para o path errado e a URL de download será inválida.

### 5.3 Envio de áudio no chat
- [ ] **Passos manuais**: Abrir um chat → tapar no ícone de áudio → gravar mensagem de áudio → verificar que o áudio é uploadado para `chats/{chatId}/` no Storage → verificar que a mensagem com a URL do áudio aparece no chat → verificar que o áudio pode ser reproduzido.
- [ ] **Cobertura automática**: `tests/uploadAudioBlob.test.cjs` cobre o upload de blob de áudio. `tests/chatController.test.cjs` cobre o controle de chat.
- [ ] **Risco RN Firebase**: `uploadBytes` e `getDownloadURL` de `firebase/storage` (Web SDK) → `@react-native-firebase/storage`. Mesmo risco que imagens de chat — o path de storage deve ser preservado exatamente.

### 5.4 Envio de vídeo no chat
- [ ] **Passos manuais**: Abrir um chat → tapar no ícone de vídeo → selecionar um vídeo → verificar que o vídeo é uploadado para `chats/{chatId}/` no Storage → verificar que a mensagem com a URL do vídeo aparece no chat → verificar que o vídeo pode ser reproduzido.
- [ ] **Cobertura automática**: `tests/uploadVideoBlob.test.cjs` cobre o upload de blob de vídeo. `tests/chatController.test.cjs` cobre o controle de chat.
- [ ] **Risco RN Firebase**: `uploadBytes` e `getDownloadURL` de `firebase/storage` (Web SDK) → `@react-native-firebase/storage`. Mesmo risco que imagens e áudios de chat.

### 5.5 Notificações de mensagem (onChatMessageCreated)
- [ ] **Passos manuais**: Abrir um chat como usuário A → enviar mensagem → verificar que o usuário B recebe uma notificação push com o conteúdo da mensagem → verificar que a notificação contém os campos `chatId`, `publicationId`, `sellerId`, `buyerId`, `sellerName`, `buyerName`.
- [ ] **Cobertura automática**: `tests/notificationPayload.test.cjs` cobre o payload de notificação de chat (tipo `chat` com campos obrigatórios). `functions/src/chatNotifications.test.js` cobre a Cloud Function `onChatMessageCreated`.
- [ ] **Risco RN Firebase**: A Cloud Function `onChatMessageCreated` usa `onDocumentCreated` do `firebase-functions` (server-side) — não é afetada pela migração do cliente. Porém, o envio da notificação push usa o Expo Push API (não Firebase Cloud Messaging). A migração para RN Firebase não deve afetar esse fluxo, mas se houver decisão de migrar para `@react-native-firebase/messaging`, o envio de notificações de chat precisará ser reimplementado.

### 5.6 Marcar chat como lida
- [ ] **Passos manuais**: Abrir um chat com mensagens não lidas → verificar que as mensagens são marcadas como lidas (ícone de check azul) → verificar que o badge unread é atualizado → verificar que o contador de não lidas no Drawer é atualizado.
- [ ] **Cobertura automática**: `tests/chatReadStatus.test.cjs` cobre `getMessageReadStatus`. `tests/chatUnreadDedup.test.cjs` cobre a deduplicação de não lidas. `tests/formatUnreadBadge.test.cjs` cobre a formatação do badge. `tests/activeChatTracker.test.cjs` cobre o rastreamento de chats ativos.
- [ ] **Risco RN Firebase**: `updateDoc` de `firebase/firestore` (Web SDK) → `@react-native-firebase/firestore`. A atualização do status "read" depende do `lastSeenAt` do usuário. Se a migração para RN Firebase alterar a forma como `Timestamp` é gravado no Firestore, a comparação de "read" vs "unread" pode falhar, mostrando mensagens como não lidas quando já foram lidas.

---

## 6. Notificações — Foreground, Background, Cold-Start Deep Link, Badge Unread

### 6.1 Notificações em foreground
- [ ] **Passos manuais**: App aberto em primeiro plano → receber uma notificação push → verificar que o banner/alerta é exibido → verificar que o dado da notificação contém `type`, `chatId`, `publicationId`, etc. → verificar que a navegação funciona ao tapar na notificação.
- [ ] **Cobertura automática**: `tests/buildNotificationBody.test.cjs` cobre a construção do corpo da notificação. `tests/notificationPayload.test.cjs` cobre os tipos e campos obrigatórios de notificação.
- [ ] **Risco RN Firebase**: As notificações em foreground usam Expo Notifications (`expo-notifications`), não Firebase Cloud Messaging. A migração para RN Firebase pode ou não incluir a migração para `@react-native-firebase/messaging`. Se a migração para RN Firebase Messaging for feita, o handler de notificações em foreground precisará ser reimplementado com a API do `@react-native-firebase/messaging`. O `Notifications.setNotificationHandler` atual pode parar de funcionar se o Expo Notifications for removido.

### 6.2 Notificações em background
- [ ] **Passos manuais**: App em background (tela bloqueada) → receber uma notificação push → verificar que a notificação aparece na barra de status → verificar que ao abrir o app via notificação, a navegação correta é executada (chat, publicação, ou registerMyAds).
- [ ] **Cobertura automática**: `tests/notificationPayload.test.cjs` cobre os tipos de notificação e os campos obrigatórios. `tests/buildNotificationBody.test.cjs` cobre a construção do corpo.
- [ ] **Risco RN Firebase**: As notificações em background dependem do Expo Notifications e do `App.jsx` notification handler. Se a migração para RN Firebase incluir a troca para `@react-native-firebase/messaging`, o handler de notificações em background precisará ser reimplementado. O deep linking via `navigationRef.navigate()` pode não funcionar corretamente se a `navigationRef` não estiver pronta quando a notificação é recebida em background.

### 6.3 Cold-start deep link (chat/publication/registerMyAds)
- [ ] **Passos manuais**: App completamente fechado (kill) → receber uma notificação push → tapar na notificação → verificar que o app abre e navega diretamente para a tela correta (chat com publicação, detalhe da publicação, ou registerMyAds).
- [ ] **Covered by**: `tests/notificationPayload.test.cjs` cobre os tipos `chat`, `publication`, `registerMyAds` e seus campos obrigatórios. `App.jsx` lida com o cold-start via `Notifications.getLastNotificationResponseAsync()`.
- [ ] **Risco RN Firebase**: O cold-start deep link depende de `Notifications.getLastNotificationResponseAsync()` ser chamado quando o app é inicializado. Se a migração para RN Firebase alterar a ordem de inicialização do app ou o handler de notificações, o cold-start pode falhar — o usuário abre o app mas fica na tela inicial em vez de navegar para a tela correta. O `navigationRef.isReady()` polling (App.jsx lines 198-235) pode precisar de ajustes se a migração alterar o timing de inicialização do React Navigation.

### 6.4 Badge unread
- [ ] **Passos manuais**: Abrir o app → ter chats com mensagens não lidas → verificar que o badge de não lidas aparece no ícone do app e no Drawer → abrir um chat → verificar que o badge é atualizado (decrementado ou zerado) → fechar e reabrir o app → verificar que o badge persiste corretamente.
- [ ] **Cobertura automática**: `tests/formatUnreadBadge.test.cjs` cobre a formatação do badge. `tests/chatUnreadDedup.test.cjs` cobre a deduplicação de não lidas. `tests/activeChatTracker.test.cjs` cobre o rastreamento de chats ativos. `BadgeSync` component (`src/components/BadgeSync/index.jsx`) usa `Notifications.setBadgeCountAsync`.
- [ ] **Risco RN Firebase**: O badge unread usa Expo Notifications `setBadgeCountAsync`. Se a migração para RN Firebase incluir a troca para `@react-native-firebase/messaging`, o gerenciamento de badge precisará ser reimplementado. Além disso, o `useUnreadChatsCount` hook que alimenta o badge depende do Firestore `onSnapshot` — se a migração alterar o comportamento do listener, o badge pode não atualizar corretamente.

---

## 7. Sorteios — Ao Vivo, Participação, Vencedores

### 7.1 Sorteio ao vivo (DrawPrizeLive)
- [ ] **Passos manuais**: Abrir um sorteio ao vivo → verificar que a animação de sorteio é exibida → verificar que os participantes são mostrados → verificar que o vencedor é anunciado → verificar que o resultado é salvo no Firestore (`drawPrizesLive` collection).
- [ ] **Cobertura automática**: `tests/drawPrizeLiveCreateNewGuard.test.cjs` cobre a guarda de criação de sorteio ao vivo. `tests/drawPrizeSelection.test.cjs` cobre a seleção de vencedor. `tests/multipleLiveDraws.test.cjs` cobre múltiplos sorteios ao vivo. `tests/drawAnimationSequence.test.cjs` e `tests/drawAnimationSequenceExtended.test.cjs` cobrem a sequência de animação.
- [ ] **Risco RN Firebase**: `onSnapshot` de `drawPrizesLive` collection para atualizar o estado do sorteio ao vivo. Se a migração para RN Firebase alterar o comportamento do `onSnapshot` (ex: não disparar para documentos existentes), o sorteio ao vivo pode não atualizar em tempo real. A animação de sorteio depende de dados em tempo real do Firestore — qualquer atraso na migração do listener pode causar race conditions na animação.

### 7.2 Participação em sorteio
- [ ] **Passos manuais**: Abrir um sorteio disponível → tapar "Participar" → verificar que a participação é registrada no Firestore (`drawPrizesHistory` ou `drawPrizesLive` participants) → verificar que o participante aparece na lista de participantes → verificar que a participação é deduplicada (não pode participar duas vezes).
- [ ] **Cobertura automática**: `tests/drawEligibility.test.cjs` cobre a elegibilidade de participação. `tests/drawAlreadyParticipatingFilter.test.cjs` cobre o filtro de participantes duplicados. `tests/drawSeedParticipantsDedup.test.cjs` cobre a deduplicação de participantes. `tests/drawSpecificRules.test.cjs` cobre as regras específicas de sorteio.
- [ ] **Risco RN Firebase**: A participação é registrada via `setDoc` ou `addDoc` no Firestore. Se a migração para RN Firebase alterar a forma como `doc()` constrói referências, a participação pode ser registrada no path errado. Além disso, a deduplicação de participantes depende do `drawAlreadyParticipatingFilter` — se a migração alterar o formato dos dados retornados pelo Firestore, o filtro pode falhar.

### 7.3 Vencedores de sorteio
- [ ] **Passos manuais**: Participar de um sorteio → aguardar o sorteio ser realizado → verificar que o vencedor é anunciado → verificar que o vencedor é salvo no Firestore → verificar que a mensagem de parabéns é exibida → verificar que o vencedor pode compartilhar a mensagem.
- [ ] **Cobertura automática**: `tests/drawPrizeSelection.test.cjs` cobre a seleção de vencedor. `tests/drawPrizeSequence.test.cjs` cobre a sequência do sorteio. `tests/winnerMessageFormatEdge.test.cjs` e `tests/winnerShareMessage.test.cjs` cobrem a formatação da mensagem do vencedor. `tests/sharingWinnerFix.test.cjs` cobre o compartilhamento do vencedor.
- [ ] **Risco RN Firebase**: A seleção do vencedor usa `drawPrizeSelection` que lê dados do Firestore. Se a migração para RN Firebase alterar a forma como `getDocs` retorna documentos (ex: campos adicionais ou ausentes), a seleção do vencedor pode falhar ou selecionar um participante inválido. A mensagem do vencedor depende do formato dos dados do participante — se a migração alterar a serialização de `Timestamp` ou `Date`, o campo de data/nome pode vir incorreto.

---

## 8. Cupons — Aplicar no Checkout, Contadores

### 8.1 Aplicar cupom no checkout
- [ ] **Passos manuais**: No checkout → selecionar um cupom → verificar que o desconto é aplicado ao valor total → verificar que o cupom é marcado como "usado" → verificar que o pedido é criado com `dataCupomPayment` contendo `cupomId` e `discount`.
- [ ] **Cobertura automática**: `tests/ordersContract.test.cjs` cobre a validação de `dataCupomPayment` (incluindo null e invalid types). Os controllers de cupom (`src/controllers/Cupons/`) são os alvos da migração.
- [ ] **Risco RN Firebase**: Os controllers de cupom usam `doc`, `setDoc`, `getDoc`, `deleteDoc` do Firestore. Se a migração para RN Firebase alterar a forma como `doc()` constrói referências, o cupom pode ser aplicado ao documento errado. Além disso, o contador de uso do cupom (`decreaseAmountCupom`, `incrementAmountCupom`) depende de `setDoc` para atualizar o campo `amount` — se a migração alterar a serialização de números, o contador pode ser atualizado incorretamente.

### 8.2 Contadores de cupom
- [ ] **Passos manuais**: Aplicar um cupom com limite de uso → verificar que o contador é decrementado → verificar que o cupom não pode ser usado novamente quando o contador chega a zero → verificar que o contador é incrementado corretamente quando um cupom é devolvido/cancelado.
- [ ] **Cobertura automática**: Nenhum teste específico de contador de cupom. `tests/ordersContract.test.cjs` cobre a validação de `dataCupomPayment` no contexto de pedidos.
- [ ] **Risco RN Firebase**: Os contadores de cupom usam `decreaseAmountCupom.js` e `incrementAmountCupom.js` que fazem `setDoc` com `merge: true`. Se a migração para RN Firebase alterar o comportamento de `setDoc` com merge, o contador pode ser sobrescrito em vez de incrementado/decrementado, resultando em contagens incorretas.

---

## 9. Carteira — Saldo, Bônus Indicação

### 9.1 Saldo da carteira
- [ ] **Passos manuais**: Login como usuário → navegar para a carteira → verificar que o saldo atual é exibido → realizar um pagamento → verificar que o saldo é atualizado → verificar que o histórico de transações é exibido corretamente.
- [ ] **Cobertura automática**: Nenhum teste específico de carteira. `tests/ordersContract.test.cjs` cobre a validação de pedidos (indiretamente, pois pagamentos afetam o saldo).
- [ ] **Risco RN Firebase**: A carteira usa `doc`, `getDoc`, `setDoc`, `updateDoc` do Firestore. Se a migração para RN Firebase alterar a forma como `getDoc` retorna dados, o saldo pode ser lido como `undefined` ou `null` em vez de `0`. Além disso, a criação da carteira (`createUserWallet`) usa `setDoc` com `createdAt` e `updatedAt` como `new Date()` — se a migração alterar a serialização de `Date` objects, os timestamps podem ser gravados incorretamente.

### 9.2 Bônus de indicação
- [ ] **Passos manuais**: Compartilhar link de indicação → novo usuário se registra usando o link → verificar que o indicador recebe o bônus de R$120 na carteira → verificar que a indicação é registrada na coleção `invitations`.
- [ ] **Cobertura automática**: `tests/invitations` relacionados (se existirem). Os controllers de convite (`src/controllers/Invitations/`) são os alvos da migração.
- [ ] **Risco RN Firebase**: A indicação é registrada via `setDoc` na coleção `invitations`. Se a migração para RN Firebase alterar a forma como `doc()` constrói referências, a indicação pode ser registrada no path errado. O bônus de R$120 é creditado via Cloud Function ou client-side — se for client-side, a migração pode afetar a atualização do saldo da carteira.

---

## 10. Admin — Métricas, Usuários, Broadcast, Publicidades, Regras de Sorteio

### 10.1 Métricas do dashboard admin
- [ ] **Passos manuais**: Login como admin → navegar para o dashboard → verificar que `totalRevenue`, `monthlyRevenue`, `statusBreakdown` são exibidos corretamente → verificar que os dados são atualizados em tempo real ou ao refresh → verificar que o filtro por mês/ano funciona.
- [ ] **Cobertura automática**: Nenhum teste específico de dashboard admin. `tests/ordersContract.test.cjs` cobre a validação de pedidos.
- [ ] **Risco RN Firebase**: O dashboard admin usa `getAdminDashboardMetrics()` que faz `getDocs` na coleção `orders`. Se a migração para RN Firebase alterar a forma como `query`, `where`, `orderBy` funcionam, as métricas podem retornar dados incorretos ou vazios. Além disso, o `getAdminDashboardMetrics` usa `httpsCallable` para chamar a função `adminDashboardMetrics` — se a migração alterar a instância de Functions, a chamada pode falhar.

### 10.2 Gerenciamento de usuários admin
- [ ] **Passos manuais**: Login como admin → navegar para a lista de usuários → verificar que todos os usuários são exibidos → verificar que o papel (Admin/Client/Producer) é mostrado → tentar editar o papel de um usuário → verificar que a alteração é salva no Firestore.
- [ ] **Cobertura automática**: Nenhum teste específico de gerenciamento de usuários admin. `tests/resetPasswordIdentity.test.cjs` cobre o reset de senha por CPF/telefone (indiretamente relacionado ao admin).
- [ ] **Risco RN Firebase**: A listagem de usuários usa `getDocs` com `query` e `where` na coleção `users`. Se a migração para RN Firebase alterar o comportamento do `where` filter, a listagem pode retornar resultados incorretos. A edição do papel do usuário usa `setDoc` ou `updateDoc` — se a migração alterar a forma como documentos são atualizados, a alteração de papel pode falhar.

### 10.3 Broadcast de notificações admin
- [ ] **Passos manuais**: Login como admin → navegar para a seção de notificações → criar um broadcast → selecionar todos os usuários ou um segmento → enviar → verificar que todos os usuários recebem a notificação push.
- [ ] **Cobertura automática**: `tests/notificationPayload.test.cjs` cobre os tipos de notificação. `tests/buildNotificationBody.test.cjs` cobre a construção do corpo da notificação.
- [ ] **Risco RN Firebase**: O broadcast de notificações usa o Expo Push API (não Firebase). Se a migração para RN Firebase incluir a troca para `@react-native-firebase/messaging`, o sistema de broadcast precisará ser reimplementado para usar FCM em vez do Expo Push API. O `sendNotification.js` e `sendNotifications.js` dependem do Expo Push API — esses arquivos não são afetados pela migração do cliente Firebase, mas a decisão de migrar para FCM pode afetar.

### 10.4 Publicidades (PublishAds) admin
- [ ] **Passos manuais**: Login como admin → navegar para a lista de publicidades → aprovar uma publicidade → verificar que a publicidade é marcada como ativa → verificar que aparece na listagem de publicidades do app cliente → rejeitar/remover uma publicidade → verificar que é removida do Firestore e do Storage.
- [ ] **Cobertura automática**: Nenhum teste específico de publicidades admin. `tests/ordersContract.test.cjs` cobre a validação de pedidos (indiretamente).
- [ ] **Risco RN Firebase**: As publicações usam `doc`, `setDoc`, `deleteDoc` do Firestore e `ref`, `uploadBytes`, `deleteObject` do Storage. Se a migração para RN Firebase alterar a forma como `ref()` constrói paths, as imagens de publicidade podem ser uploadadas/deletadas de paths incorretos no Storage. As Storage Rules para `ads/` devem ser verificadas após a migração.

### 10.5 Regras de sorteio admin
- [ ] **Passos manuais**: Login como admin → navegar para as regras de sorteio → criar uma nova regra → verificar que a regra é salva no Firestore (`drawPrizesRules` ou `newDrawPrizeRules`) → editar uma regra existente → verificar que a regra é atualizada → deletar uma regra → verificar que a regra é removida.
- [ ] **Cobertura automática**: `tests/drawSpecificRules.test.cjs` cobre as regras específicas de sorteio. `tests/drawActiveOnlyClientView.test.cjs` cobre a visualização de sorteios ativos. `tests/generalDrawRules.test.cjs` cobre as regras gerais de sorteio.
- [ ] **Risco RN Firebase**: As regras de sorteio usam `doc`, `setDoc`, `updateDoc`, `deleteDoc`, `addDoc`, `getDocs`, `query`, `where`, `collection` do Firestore. Se a migração para RN Firebase alterar o comportamento de qualquer uma dessas operações, as regras podem não ser salvas, atualizadas ou deletadas corretamente. Além disso, a criação de regras de sorteio usa `addDoc` que gera IDs automáticos — se a migração alterar a geração de IDs, as regras podem ter IDs inconsistentes.

---

## Riscos Gerais da Migração RN Firebase

| # | Risco | Impacto | Mitigação |
|---|-------|---------|-----------|
| 1 | `initializeAuth` + `getReactNativePersistence` não configurado corretamente | Login/logout/registro falham | Manter o Web SDK adapter durante a transição; testar cada fluxo de auth separadamente |
| 2 | `getAuth()` retorna instância diferente entre Web SDK e RN Firebase | Sessão de auth perdida entre navegação | Garantir que `getAuth()` é chamado apenas uma vez e compartilhado via `src/services/Firebase/index.js` |
| 3 | `onSnapshot` behavior change para documentos existentes | Chat e sorteios ao vivo não atualizam em tempo real | Testar listeners em cada fluxo que usa `onSnapshot` |
| 4 | `Timestamp` serialization diferente entre Web SDK e RN Firebase | Campos de data (expiração, createdAt, updatedAt) incorretos | Verificar todos os documentos que usam `new Date()` ou `Timestamp` |
| 5 | Storage paths case-sensitive (`Shrimp/` vs `shrimp/`) | Uploads/deleções de imagens falham | Preservar exatamente os `storageModels` paths |
| 6 | `httpsCallable` region mismatch | Reset de senha e PIX callable falham | Garantir que a region em `getFunctions()` é `us-central1` (padrão) |
| 7 | Expo Notifications → RN Firebase Messaging migration pendente | Notificações push quebram | Decidir estratégia antes da migração; manter Expo Notifications durante a transição |
| 8 | `navigationRef.isReady()` polling em App.jsx | Deep linking de notificações falha em cold-start | Testar cold-start deep linking após cada etapa da migração |
| 9 | Firestore Rules não atualizadas para novas coleções/paths | Acesso negado para admin e operações de escrita | Atualizar `firestore.rules` e `storage.rules` conforme a migração avança |
| 10 | `@react-native-firebase/*` packages não instalados no `package.json` | Build quebra | Instalar e linkar todos os pacotes necessários antes de remover o Web SDK |
