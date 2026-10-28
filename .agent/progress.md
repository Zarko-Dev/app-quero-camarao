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
