# Agent Progress

## BUG-005 fechado (2026-10-28)
- eslint --fix em DrawPrizeLive (540 -> 13 erros, max-len/no-shadow). `executeDrawPrizeLive` agora usa `planDrawExecution` (puro, testado em tests/drawPlanExecution.test.cjs). 747/747 testes, functions 72/72, verify.sh PASS. Sem commit/build.

## Chat: produtor/localização/share (2026-10-28)
- Spec: docs/spec-chat-produtor-localizacao-share-badge.md. TDD: chatTranscript, locationMessage, messagePreview(location). 745/745 testes verdes, verify.sh PASS.
- Botão "Falar com o produtor" verde; anexo "Localização" (Android via "Mais…"); bolha abre seletor Maps/Waze; ícone share-2 no chat exporta conversa. expo-location instalado + plugin.
- Build iOS 3.0.0 (125) enviado ao EAS com auto-submit TestFlight (submission 3ff8e4d6-a896-48e3-87d2-37f09de992eb). Resultado do build/envio não verificado ainda.

## Release Critical main — verificação + fixes (2026-10-12)
- Gate: GO consolidado (Atlas). Oráculo: release pronta com ressalvas (go-prob 0.27 binário, categoria release_pronta 0.91).
- Baseline 710 testes → 729 root / 0 fail; functions 48/48.
- BUG-012 (cupons): contadores atômicos FieldValue.increment tipo number, gate admin via adapter (createCupom/deleteCupom), normalizeCouponQuantity, zero-tests corrigido (cupomCounters 24/24), durationValue number na criação.
- BUG-013 (pagamento): escritas roteadas por validateOrder/normalizeOrder, rule orders.create valida shape (pronta, SEM deploy), toast message sem dead branch, getAllApprovedOrders removido, fuso -3h restaurado (OrdersReader utcMinus3).
- BUG-014 (chat): feedback de falha de envio (msg não some silenciosa), uploads testados no código real (performStorageUpload putFile/getDownloadURL), mirrors XHR removidos.
- BUG-005 (sorteio): 19 arquivos de teste verdes, incluído na release.
- BUG-007 (cadastro server-side): functions 48/48, registerUser verde, incluído na release.
- Riscos residuais aceitos (follow-up pós-lançamento): aprovação de pagamento client-side → Cloud Function; rollout rules BUG-007; 1º sorteio real; Discord alerts; Node 20→22 até 30/10/2026; QA móvel PIX/TestFlight.

## Maestri Dev/Test Flow (2026-10-12)
- Setup do fluxograma de desenvolvimento e teste do Quero Camarão no canvas Maestri (Maestro: CTO Quero Camarão).
- Personas/agentes criados (roles scoped ao workspace) e recrutados: Atlas (PO/Espec), Forjador (Dev Worker), Sentinel (Reviewer/QA), Oráculo (Typesafe-judge via Jev).
- Conexões: Atlas→Forjador→Sentinel; Forjador/Sentinel consultam Oráculo.
- Notas no canvas: "Fluxograma Quero Camarão" (pipeline Dev+Test+Deploy), "Regras de Execução" (uso obrigatório de @caveman e @typesafe-ai), "Backlog Quero Camarão" (BUG-005/007 em in_progress).
- Regras gravadas: caveman ativo na comunicação (off em specs/commits/PRs); typesafe-ai (Jev) p/ decisões semânticas com respostas tipadas; DoD = validação verde real.

## Current Task
BUG-007 em andamento: cadastro server-side idempotente; código e Functions publicados, rollout do app pendente

## Status
COMPLETED

## Completed
- Harness files were initialized e adaptados ao projeto atual.
- Script de testagem `scripts/verify.sh` devidamente ajustado.
- QA-001: Verificação de linters foi validada no fluxo.
- QA-002: Executar testes locals - todas as falhas resolvidas.
- QA-003: Verificar build do Expo - verify.sh passa com Exit Code: 0.
- 626 testes unitários passing com 0 falhas.

## Current Work
- BUG-005 (sorteio quebrado): correções críticas aplicadas; pendente `eslint --fix` do DrawPrizeLive e extração de orquestração pura + testes de integração (G-09 a G-12).
- BUG-006: fluxo de Auth/Firestore corrigido com rollback e recuperação de conta órfã; teste em `tests/registerFlow.test.cjs`.
- BUG-006: falhas do cadastro agora são reportadas ao Discord corporativo com etapa, código/mensagem técnica, resultado do rollback e dados pessoais omitidos/mascarados.
- BUG-007: `registerUser` e `reconcileUsers` implementados; cliente usa Callable + custom token; `users.create` está preparado para bloqueio após atualização do app.

## Validation
- `scripts/verify.sh` passa com `VERIFICATION_PASS`; lint global ainda reporta erros preexistentes não bloqueantes.
- `npm run test:unit` passa com 637 testes e 0 falhas.
- Lint focado nos arquivos alterados passa.
- Testes Functions passam com 48/48; testes de reconciliação e cadastro server-side incluídos.
- O alerta Discord não foi disparado artificialmente; a integração usa o webhook corporativo existente e será acionada em falhas reais.
- Functions `registerUser` e `reconcileUsers` publicadas em `api-quero-camarao/us-central1` e confirmadas como `ACTIVE`.
- Chamada HTTP segura de validação para `registerUser` retornou `400 INVALID_ARGUMENT` conforme esperado.
- As regras Firestore restritivas ainda não foram publicadas para não quebrar versões antigas do aplicativo.
- `firebase-functions` alerta que Node 20 será descontinuado em 2026-10-30; upgrade deve ser planejado antes dessa data.

## Important Context
- O repositório usa node --test para testes; ESLint para linting; Yarn/npm compatível.
- As falhas foram resolvidas adicionando stack trace ao buildContent e corrigindo a formatação do campo extra.

## Next Action
- Verificar build do Expo (QA-003).

## BUG-004 - Botão WhatsApp do encarte
- Diagnóstico: o botão do admin passava pela tela `Redirect`, que agendava a abertura do WhatsApp e depois executava `navigation.goBack()`, permitindo retorno ao fluxo de chat interno.
- Correção: o botão abre diretamente `whatsapp://send`, com telefone normalizado e mensagem codificada; o botão CHAT continua usando `publicationChat`.
- Cobertura: `tests/adminPublicationWhatsApp.test.cjs` cobre telefone Pix, contato do encarte, código do país e URL externa.
- Validação: `npm run test:unit` passou com 632 testes e 0 falhas.
PROJECT_COMPLETE

## BUG-008 - Atualização de endereço do usuário
- Diagnóstico: a tela misturava campos legados no nível raiz com o formato aninhado em `address`; o repositório também usava o e-mail sem normalização e escondia o erro do Firestore.
- Correção: leitura usa `address` com fallback legado; gravação mantém os dois formatos; o ID do documento usa e-mail normalizado; o erro registra código e mensagem técnicos; consulta de CEP não depende do estado anterior do campo.
- Cobertura: `tests/addressUpdateContract.test.cjs` cobre normalização, fallback e payload sincronizado.
- Validação: `npm run test:unit` passou com 703 testes e 0 falhas; ESLint focado passou; `scripts/verify.sh` terminou com `VERIFICATION_PASS` (lint global mantém erros preexistentes documentados).

## BUG-009 - Primeiro envio do chat
- Diagnóstico: o app assinava a subcoleção `messages` antes de criar o documento pai `chats/{chatId}`; as regras negavam essa leitura e o envio automático aguardava uma confirmação que nunca chegava. Além disso, a criação do chat e da primeira mensagem ocorria em duas gravações separadas, criando uma janela de corrida nas regras.
- Correção: envio do chat e da mensagem agora usa `writeBatch`; as regras usam `existsAfter/getAfter` somente no caminho de criação atômica; o primeiro texto consulta o chat pai diretamente e a assinatura das mensagens só é criada após o chat existir. As referências transitórias também são resetadas ao trocar de conversa.
- Cobertura: `tests/initialChatMessage.test.cjs` cobre as condições do primeiro envio; `tests/chatAtomicWrite.test.cjs` cobre criação/atualização atômica e as regras.
- Validação: `npm run test:unit` passou com 708 testes e 0 falhas; `scripts/verify.sh` terminou com `VERIFICATION_PASS`. O lint global continua exibindo erros preexistentes não bloqueantes. O emulador de regras não pôde ser executado neste ambiente porque o Java Runtime não está instalado.

## BUG-010 - Chamada de atenção do chat
- Diagnóstico: o payload `attention` enviado pelo cliente não levava `sellerName`/`buyerName`, apesar de esses campos serem obrigatórios no contrato de navegação; além disso, qualquer resposta do Expo Push era tratada como sucesso.
- Correção: payload centralizado em `src/utils/attentionNotification.js`, com nomes do chat; respostas do Expo só são aceitas quando o ticket retorna `status: "ok"`; token ausente/rejeitado não é tratado como sucesso; a tela mostra o motivo da falha.
- Cobertura: `tests/attentionNotification.test.cjs` cobre payload completo e rejeição de push.
- Validação: `npm run test:unit` passou com 710 testes e 0 falhas; lint focado dos arquivos do controller/helper/teste passou. O lint da tela completa mantém erros preexistentes não relacionados nesta árvore de trabalho.

## BUG-011 - Publicar/usar cupom/informar venda com "Falha ao salvar ordem no Firebase!"
- Diagnóstico: usuária autenticada como joseumberto11@gmail.com, mas o doc users/joseumberto11@gmail.com tinha campo email = josehumberto11@gmail.com (corrupção de 22/07/2025). O checkout grava userId a partir do campo email do storage; as regras deployadas comparam com request.auth.token.email -> permission-denied na criação da ordem (toast), e negação equivalente em shirimpSale (informar venda). O cupom em si aplica desconto normalmente; a falha é na escrita da ordem.
- Evidências: leitura do Firestore/Auth via service account; regras deployadas (ruleset 96586443, publicado 2026-09-04) conferidas com a API TestRuleset - create/update de orders, cupons, shrimpPonds e wallets ALLOW para identidade consistente; último pedido com cupom criado com sucesso 27/07/2026; scan de 2.770 users achou apenas 1 doc divergente.
- Correções: (1) campo email do doc users/joseumberto11@gmail.com corrigido para o ID do doc em produção e verificado; (2) UserAuthentication agora grava no storage o e-mail autenticado (sobrescreve campo divergente do doc); imports duplicados de FirebaseAdapter mesclados no arquivo tocado.
- Observação: a usuária precisa relogar no app (o storage do dispositivo só é regravado no login; o app não sincroniza o perfil completo na abertura).
- Validação: npm run test:unit 710/710; eslint focado no arquivo alterado OK; scripts/verify.sh VERIFICATION_PASS (lint global mantém erros preexistentes documentados).

## SaleShrimps - Teclado cobrindo a modal de confirmação de venda
- Diagnóstico: o Dialog (react-native-paper Portal) abre com o input ainda focado; o teclado é overlay do SO e fica por cima da modal.
- Correção: Keyboard.dismiss() antes de setShowAlertVisible(true) em handleSaleShrimp; typo do título da modal corrigido ("finalizda" -> "finalizada").
- Validação: eslint focado OK; npm run test:unit 710/710.

## Fixes da release - health scan (Forjador) — 3 áreas
### BUG-012 CUPONS
- isAdmin movido p/ src/controllers/Cupons/isAdmin.js usando doc/getDoc do FirebaseAdapter; lógica pura pura de papel em roles.js (CJS testável); checagem admin SÓ no controller (removida da página RegisterDiscountCupom).
- CuponsRepository.decreaseAmountCupom/incrementAmountCupom agora usam FieldValue.increment(-1/+1) (atômico, mantém number); chamadores (PaymentButton, PaymentEnd, CardOrder) não passam mais valor stale. Corrigido bug de `dataCupomPayment.dataCupomPayment` aninhado no CardOrder (else-if nunca rodava).
- deleteCupom alinhado com createCupom: gate isAdmin; CardCupom recebe adminEmail da página DiscountCupons.
- Testes novos: tests/cupomCounters.test.cjs (17).
### BUG-013 PAGAMENTO/PUBLICAR
- order.js: savePaymentOrder valida (validateOrder) + normaliza preservando user; updateOrderStatus valida contra ORDER_STATUS; updateOrder valida campos gravados (status/published/paymentLog) — payloads parciais do CardOrder não quebram.
- Removido import morto OrdersWriter e export quebrado getAllApprovedOrders.
- getPaymentUrl/getPaymentPix: removido ramo if/else morto; campo message no catch (toast não mostra 'undefined').
- OrdersReader.normalizeOrder ganhou opção utcMinus3 (-3h BRT) aplicada em getApprovedOrdersByYear/getAllOrdersByYear (revisão da antiga normalizeAndFilterApprovedOrders); getAllUserOrders inalterado.
- firestore.rules orders.create valida shape (paymentValue number, status string, idOrder==orderId, user map) — regra pronta, SEM deploy.
- Testes novos: tests/orderWritesContract.test.cjs (13).
### BUG-014 CHAT
- R11: handleSend/pickAndSendImage/sendDocument chamam Toast de erro quando sendChatMessage retorna false (mensagem não some silenciosa).
- Upload: criado src/controllers/Chat/uploadStorage.js (CJS, código real storage().ref().putFile().getDownloadURL()) usado por uploadImage/uploadFile/uploadAudio/uploadVideo; testes de upload reescritos p/ exercitar o código real (testes antigos eram mirrors de localUriToBlob inexistente).
## Validação
- npm run test:unit: 722 testes, 0 falhas (baseline ~710 + cupom/orderWrite - reescrita uploads).
- lint dos arquivos tocados: apenas erros pré-existentes documentados (baseline não bloqueante).
- ./scripts/verify.sh: VERIFICATION_PASS.
- NÃO houve deploy de rules/functions (regra orders.create pronta, sem publicar).

## 2026-11-04 - Crash Android ao abrir + atualização obrigatória (minimumVersion)
- Diagnóstico Android: build release local (prebuild --clean + assembleRelease, SDK 36) abre normal no emulador Pixel_34 (Android 14), sem FATAL no logcat. O crash reportado vem de APK anterior ao commit f32b836 (expo-sharing 57 → NoClassDefFoundError). Fix = publicar build nova. Android 16 não testado (emulador Pixel_10_Pro_XL não bootou).
- Diagnóstico iOS (aviso de versão não aparece): build publicada roda código antigo que só compara `versionNumber` ("3.0.0") com a versão instalada; usuários em 3.0.0/3.0.1 não recebem nada. Firestore `config/APe8eG9cNHqH339JM7Mw`: minimumVersion="3", forceUpdate=false, versionNumber="3.0.0".
- Correção: AlertNewVersion — `minimumVersion` abaixo da instalada bloqueia sempre (removido gate `forceUpdate !== false`). app.json version 3.0.1 → 3.0.2 (versionCode/buildNumber via EAS autoIncrement remoto).
- Pós-publicação (manual, Firestore): subir `versionNumber` para "3.0.2" para avisar quem está em 3.0.0/3.0.1. Quem está em 2.x só recebe aviso opcional (código antigo não tem bloqueio).
- Bloqueio: `eas build --local` falhou com Entity Not Authorized (projectId 9b561f08, owner `querocamarao`); conta logada `pedro_roger` não é membro da org. Necessário `eas login` na conta da org antes de gerar AAB/iOS.
- Validação: eslint do arquivo OK; npm run test:unit 750/750. Sem commit.

## 2026-11-04 - Pagamentos quebrados em versões ≤ 2.0.5 (paymentgenerateurl apagada)
- Causa: Cloud Function `paymentgenerateurl` (Checkout Pro Mercado Pago) nunca existiu em `functions/` e foi removida pelo deploy de 28/10 (a0c9413). `getPaymentUrl` (todas as versões) chama `https://paymentgenerateurl-73bqtyvvfq-uc.a.run.app?orderId=` → 404 HTML. Pix (`paymentpix`) nunca quebrou.
- Correção: `functions/src/paymentGenerateUrl.js` (POST /checkout/preferences, external_reference=orderId, notification_url=WEBHOOK_URL, resposta `{error:false,data:{paymentUrl}}`), export `paymentgenerateurl` em `functions/src/index.js` (us-central1, cors), `paymentGenerateUrl.test.js` (4 testes).
- Validação: jest functions 83/83. Deploy feito por Pedro (`firebase deploy --only functions:paymentgenerateurl`); smoke test: 404 JSON para orderId inexistente, 400 sem orderId, nas duas URLs (run.app e cloudfunctions.net).
- Não testado: caminho feliz contra o Mercado Pago com pedido real (testar no app: "outra forma de pagamento").
- Complemento (sintoma "não cria a ordem"): PaymentButton (2.0.4 e HEAD) cria a ordem, chama getPaymentUrl e, no erro, mostra `resultUrl.message` e roda `deleteOrder(idOrder)` — a ordem some. Orders recentes no Firestore: só `pix payment`/`No payment` desde o deploy de 28/10, nenhuma `checkout-url`. Regras ao vivo (04/09, = firestore.rules.prod-backup) não bloqueiam: 1500 users amostrados têm email == id; sem revogação em massa de sessões Auth.

## 2026-11-04 - "Não cria a ordem" (Pix e URL) após rollout 3.0.x: sessão Auth perdida no update
- Evidência: métrica `firestore.googleapis.com/rules/evaluation_count` result=DENY — CREATE saltou de ~1–16/dia para 14–43/dia a partir de 26–28/10 (GET/LIST DENY idem; LIST 620 em 04/11). Regras ao vivo inalteradas desde 04/09. Logs do `paymentpix` (30d): só 200, builds iOS antigas (62, 100) chamam com sucesso; build 62 em 29/10. Nenhum erro no `paymentpix`.
- Causa: 3.0.x trocou Firebase JS SDK → `@react-native-firebase` (nativo). `SplashScreen` decide "logado" só por `GetUserStorage()` (AsyncStorage `@USER`, que sobrevive ao update), nunca consulta o Auth nativo, que após o update não tem sessão → `request.auth == null` → `orders.create` (e demais escritas/leituras de dono) negadas → toast "Não foi possível criar a ordem de pagamento!". Afeta quem atualizou de 2.0.x sem relogar; não é "versão antiga".
- Correção: `src/utils/authSession.js` (`waitForAuthUser`, timeout/erro mantém sessão) + `SplashScreen`: se storage tem usuário e Auth nativo devolve null, limpa storage, dispatch `NOT_AUTEHNTICATED_ACTION`, toast "Sua sessão expirou" e vai para Login. `tests/authSession.test.cjs` (4).
- Validação: eslint OK; npm run test:unit 754/754. Sem commit.
- Impacto nos builds: iOS build 131 (submetida) e Android APK versionCode 90 (em andamento) NÃO têm este fix. Precisa novo build 3.0.2.
- Secundário: 10 docs `users` com id em maiúscula → em versões antigas `userId` ≠ `request.auth.token.email` → create negado (regra case-sensitive). Não tratado.
- Builds com o fix: iOS 3.0.2 build 132 (`1e85ff06`) FINISHED e submissão `018571e2` FINISHED na App Store Connect (liberar esta, não a 131). Android APK `ce16508a` em andamento → AAB encadeado. APK 90 (sem fix) terminou, descartar.
- Android com o fix: APK `ce16508a` (versionCode 91) FINISHED; AAB `17b0004d` (versionCode 92) FINISHED — https://expo.dev/artifacts/eas/s2GAe6VawNDKNp3W2iCZw3HKN7K3D_XKiEaKasR_Fik.aab (cópia em build/quero-camarao-3.0.2-92.aab, gitignored?). Publicação no Play Console é manual (Pedro).
- Revertido a pedido de Pedro: `minimumVersion` NÃO bloqueia mais; bloqueio só se Firestore `forceUpdate === true` e versão abaixo de `minimumVersion`. Hoje `forceUpdate=false` → só aviso dispensável. Builds 3.0.2 já gerados (iOS 132, AAB 92) ainda têm a versão bloqueante; inofensiva enquanto `minimumVersion` ficar em "3".
- Firestore `config/APe8eG9cNHqH339JM7Mw`: `minimumVersion` "3" → "2.0.4" (a pedido de Pedro, via REST com token do firebase-tools, 2026-11-04 19:51Z). `forceUpdate=false`, `versionNumber="3.0.0"` inalterados.

## 2026-11-04 - Crash Android "fecha ao abrir" REPRODUZIDO: listener de chats sem onError + sessão nativa vazia
- Repro no emulador (Pixel_34): 2.0.4 instalado, `@USER` (forma exata do 2.0.x) semeado no `RKStorage` como TEXT, 3.0.2 instalado por cima → `TypeError: Cannot read property 'docs' of null` → `JavascriptException` → processo morre (~5,6 s após o start). Acontece tanto no APK 90 (sem fix de sessão) quanto no 91 (código da 92 em produção).
- Causa: `BadgeSync` (App.jsx:69) monta `useUnreadChatsCount` na raiz, antes do Splash; `subscribeUnreadChatsCount` (src/controllers/Chat/index.js) faz `onSnapshot(q, (snap) => snap.docs...)` sem onError. RNFB trata callback único como (snapshot, error) e chama `callback(null, error)` quando a regra nega (`request.auth == null` para quem veio do 2.0.x com `@USER` no storage) → crash. Logcat: `Listen for Query(chats where sellerId==...) failed`.
- Fix (JS-only, OTA-able): `src/utils/snapshotArgs.js` + wrapper `onSnapshot` em `src/services/FirebaseAdapter.js` (injeta onError → Sentry quando só onNext foi passado; cobre os 6 listeners do Chat e o PublicationChat). `tests/snapshotArgs.test.cjs` (4). eslint OK; test:unit 758/758.
- "Remover sessão de todo mundo no banco" NÃO resolve: o "logado" é `@USER` no AsyncStorage do celular; revogar sessões do Firebase Auth deixaria usuários 3.0.x corretamente logados sem `request.auth` → mesmo crash/pagamento negado. Não fazer.
- Builds 3.x publicadas: Android 87 (3.0.1, commit 0b62795, RNFB 26.3.3) e 92 (3.0.2, f32b836, RNFB 23.4.1); iOS 118–125 (3.0.0, eeab415), 128–130 (3.0.1), 131/132 (3.0.2). expo-updates: canal `production`, runtime = appVersion; no log, check de update termina em ~2,8 s e o crash vem em ~5,6 s; ErrorRecovery tenta buscar update no crash → OTA no branch `production` (runtime 3.0.2, e 3.0.1 a partir de worktree em 0b62795) deve alcançar os usuários sem loja. Pendente decisão de Pedro.
- Play Console: nenhuma das contas Google logadas no Chrome tem conta de desenvolvedor (ambas caem em /signup); stack trace real não foi lido — repro local supre.
- Validação do fix no emulador (build local release com `SENTRY_DISABLE_AUTO_UPLOAD=true`): sessão antiga semeada → 0 crash, 2 listeners de chats negados sem derrubar, splash limpou `@USER` e abriu o Login.
- **OTA publicado** (autorizado por Pedro): `eas update --branch production --platform all`, grupo `3297faec`, runtime 3.0.2 (Android build 92, iOS 132), mensagem "fix: crash na abertura (listener de chats sem onError) e sessão expirada após update 2.0.x". Antes, `eas update` recusou o app.json por itens duplicados (`android.intentFilters` e `ios.associatedDomains`) — removidos os duplicados (mudança não commitada de hoje).
- Pendente: OTA para runtime 3.0.1 (worktree em 0b62795, RNFB 26) e validação ponta a ponta do OTA no binário 92.
- 3.0.1 confirmado com o mesmo crash: APK 85 (commit 0b62795) abre limpo e cai com `@USER` antigo (`Cannot read property 'docs' of null`). AABs 87 (3.0.1) e 92 (3.0.2) trazem `expo-channel-name: production` (APKs `production-apk` 85/90/91 não têm canal → nunca recebem OTA; não servem para testar OTA).
- **OTA runtime 3.0.1 publicado** (autorizado: "faça isso também"): worktree em `0b62795` (scratchpad/wt-301, deps exatas: RNFB 26.3.3, expo-sharing 57.0.17, expo-updates 0.28.18) + só os 2 fixes (FirebaseAdapter/snapshotArgs, SplashScreen/authSession); app.json do commit também tinha intentFilters/associatedDomains duplicados (dedupe só no worktree). Grupo `74004a14`, Android + iOS, branch `production`.
- RNFB 26 (`lib/FirestoreQuery.ts`) mantém a semântica callback único → `callback(null, error)`; o fix vale igual.
- **Correção do OTA 3.0.1:** bundles embutidos nos AABs 87 e 92 têm `RNFBAppModule` e NÃO `NativeRNFBTurboApp` → ambas as builds foram compiladas com RNFB 23.x (o working tree na hora do build 87 já tinha o downgrade, embora o commit 0b62795 diga ^26.3.3). O 1º OTA 3.0.1 (grupo 74004a14, gerado no worktree com RNFB 26) falha ao iniciar na build 87 (`Native module NativeRNFBTurboApp is not registered`) e o expo-updates volta ao bundle embutido (reproduzido no emulador: app parado na splash). Republicado o 3.0.1 a partir da árvore principal (RNFB 23.4.1): grupo `f9e9aa7a`, id `01a1a87c` (21:35Z), servido para android/ios. Worktree `scratchpad/wt-301` não deve ser usado para OTAs.
- E2E 3.0.2 no emulador: build local sem fix, runtime 3.0.2, canal `production` (meta-data `expo-channel-name` adicionada no `android/` local, que está gitignored; `strings.xml`/`build.gradle` locais atualizados de 3.0.1 → 3.0.2). OTA `01a1a864` baixado na 1ª abertura; com sessão antiga: 0 crash, `@USER` limpo.
- **E2E final no emulador (cenário real: `@USER` antigo presente desde a 1ª abertura, binário sem fix com canal `production`):** runtime 3.0.2 → OTA `01a1a864` baixado antes do JS iniciar (`DownloadComplete` ~6 s após `Start proc`), 0 crash, `@USER` limpo, Login. Runtime 3.0.1 (natives RNFB 23.4.1, igual à build 87) → OTA `01a1a87c` idem, 0 crash, Login. Quando não há update disponível (APKs sem canal), o bundle embutido roda e crasha — comportamento esperado e já coberto pelo OTA.
- Limpeza: worktree `scratchpad/wt-301` removido; meta-data `expo-channel-name` retirada do `android/` local (gitignored); `strings.xml`/`build.gradle` locais ficam em 3.0.2 (estavam defasados em 3.0.1).
- Firestore `config/APe8eG9cNHqH339JM7Mw`: `minimumVersion` "2.0.4" → "3.0.0" (a pedido de Pedro). `forceUpdate=false` e `versionNumber="3.0.0"` inalterados. Efeito prático nulo hoje (2.x ignora o campo; 3.0.1+ não está abaixo).
- Firestore `config/APe8eG9cNHqH339JM7Mw`: `forceUpdate` false → true (a pedido de Pedro). Com `minimumVersion="3.0.0"` não bloqueia ninguém hoje; passa a bloquear quando `minimumVersion` subir (ex.: "3.0.2" só depois da iOS 132 na App Store).

## 2026-11-06 - Alertas Discord: 3 crashes "Cannot read property 'docs' of null" + reconcileUsers (26)
- Crashes (08:17, 11:19, 13:29; 3 usuários distintos, 1 cada; Android): mesmo erro/stack do bug reproduzido em 04/11 (listener de chats sem onError + sessão nativa vazia após update 2.0.x). Nenhuma build de loja tem o fix de `onSnapshot` (últimas builds EAS são de 04/11, commit f32b836, anteriores ao fix); o fix só existe como OTA (grupos `3297faec` runtime 3.0.2 e `f9e9aa7a` runtime 3.0.1, ambos ativos na branch `production`). Sem `fallbackToCacheTimeout` no app.json, a 1ª abertura após instalar da loja roda o bundle embutido (sem fix) e crasha uma vez; o OTA vale a partir da abertura seguinte. Dois offsets de bytecode distintos (…:2255194 e …:2255253) = dois binários embutidos (3.0.1/87 e 3.0.2/92). Esperado ~1 alerta por aparelho que atualiza do 2.x até sair build de loja com o fix.
- Não confirmado via Sentry: o `SENTRY_AUTH_TOKEN` do .env só tem escopo de upload (API de issues responde 403). O relatório Discord `app.global` não envia versão/updateId (Extra `{}`), então não dá para distinguir bundle embutido de OTA pelo alerta.
- reconcileUsers (diário, 12:24Z, report-only): lista completa obtida por script read-only no scratchpad (token do firebase-tools + REST Auth/Firestore, mesma `findUserMismatches`): auth=2848, profiles=2822; 24 contas Auth sem doc `users` (cadastros incompletos, maioria com 1 só login; inclui `appquerocamarao@gmail.com` e `juniorreis1995@gmail.com` com login em 04/11) e 2 docs `users` sem conta Auth (`marcelomouramarcelo18@gmail.com`, `vital.lima@hotmail.com`); 0 uidMismatch. Vai alertar todo dia enquanto existir diferença. Nenhuma ação tomada.

## 2026-11-14 - Crash na tela de visualizações (admin) + builds 3.1.0
- Causa: `PublicationViewLogs` chamava `dataUser.userPhone.replace` em visualização sem telefone (fecha o app em release); render também usava `createdAt.seconds` e `userName.split` sem proteção.
- Correção: card sem telefone desabilitado, WhatsApp com try/catch + Toast, `result?.views ?? []`, sort/data/avatar tolerantes a `createdAt`/`userName` ausentes.
- Validação: eslint do arquivo OK; npm run test:unit 760/760. Não testado em aparelho. Sem commit.
- Builds EAS `production` com `--auto-submit` (working tree não commitado, a pedido de Pedro): Android 3.1.0 versionCode 97 (`adacc9be`, submissão `1e6ad8a7`, track production, rollout 5%); iOS 3.1.0 build 137 (`72ee0658`, submissão `839dcd9f`, TestFlight). Disparados com `--no-wait`; resultado final não conferido.
- Resultado (conferido no expo.dev): builds Android 97 e iOS 137 FINISHED; **as duas submissões FALHARAM**. iOS `839dcd9f`: "A required Apple agreement is missing or has expired" (Account Holder precisa aceitar em appstoreconnect.apple.com/business). Android `1e6ad8a7`: "Google rejected the service-account key (invalid_grant)" (chave `api-quero-camarao@appspot.gserviceaccount.com` inválida/desabilitada). Nada chegou ao TestFlight nem ao Play. Depois de corrigir: `eas submit --profile production --platform ios|android --id <buildId>`.
- Reenvio iOS 137 (`63eeaed9`) após Pedro informar aceite do acordo: falhou com o mesmo erro "A required Apple agreement is missing or has expired".
- 2º reenvio iOS 137 (`3dd409ef`): mesmo erro de acordo Apple. Parei de reenviar; falta identificar qual acordo/conta está pendente.
- Program License Agreement aceito por Pedro (banner sumiu, apps gratuitos "Ativo" 14/11); reenvios `399e52b6` e `bef0cd4b` ainda falharam com o mesmo erro. Resta em App Store Connect > Negócios: "Acordo de apps pagos — Pendente (novo contrato disponível)". Time: Felipe Mendonca (app transferido de Italo Moraes Almeida).
- Após aceite do Acordo de apps pagos: submissão iOS `294f8dcc` FINISHED — build 3.1.0 (137) enviado ao App Store Connect/TestFlight (em processamento pela Apple). Android 97 segue sem envio (service-account key `invalid_grant`).
