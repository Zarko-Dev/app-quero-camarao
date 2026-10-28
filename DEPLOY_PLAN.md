# >>> DEPLOY AGORA: firestore:rules (autorizado por Pedro; GERENTE publica após autenticar a CLI)
PUBLICAR firestore.rules.deploy = firestore.rules.prod-backup (rules ATIVAS de prod) + SÓ o acréscimo de chat (isChatParticipantAfter + messages create). NÃO publicar o firestore.rules da working copy (baseado no HEAD, REGRIDE isAdminViaClaim/users update/orders update de prod). Também NÃO publicar firestore.rules.pre-deploy.
A CLI publica o arquivo firestore.rules (firebase.json): trocar com backup:
    cd /Users/pedroroger/Documents/app-quero-camarao
    cp firestore.rules firestore.rules.workingcopy-bak && cp firestore.rules.deploy firestore.rules
    firebase deploy --only firestore:rules --project api-quero-camarao
    cp firestore.rules.workingcopy-bak firestore.rules   # restaura a working copy
Rollback (prod volta ao texto anterior):
    cp firestore.rules.prod-backup firestore.rules && firebase deploy --only firestore:rules --project api-quero-camarao
  ou Console>Firestore>Regras>Histórico>versão anterior.
Validação: dry-run da CLI dá 403 sem auth/permissão; chaves/parênteses balanceados conferidos.

# Plano de deploy (expand/contract) - NÃO executado
Projeto: api-quero-camarao (`--project api-quero-camarao`). Pré-requisito: IAM (serviceusage.serviceUsageConsumer, cloudfunctions.admin, firebaserules.admin, iam.serviceAccountUser, firebasehosting.admin) + aprovação GERENTE/Pedro.

## Backup (antes de tudo)
    firebase functions:list --project api-quero-camarao > /tmp/functions.before.txt
    # Console > Firestore > Regras: copiar regras ativas p/ /tmp/firestore.rules.prod (firebase CLI não tem rules:get)

## 1. Functions (só aditiva: registerUser)
    firebase deploy --project api-quero-camarao --only functions:registerUser
Obs: nomes novos; nenhuma function existente é alterada. `index.js` também tem alterações em discordAlerts (modificado, não commitado): revisar antes. Se quiser zero risco, use só `--only functions:registerUser`.

## 2. Validar cadastro (antes de mexer em rules)
Criar conta de teste via app/Farol (fluxo registerUser): esperar ok:true, customToken, perfil em users/{email}, e criar uma publicação (shrimpPonds exige userId == token.email). Conferir `firebase functions:log --only registerUser`.

## 3. Rules compatíveis (users create do client antigo + registerUser)
    firebase deploy --project api-quero-camarao --only firestore:rules
(storage.rules = HEAD, sem mudança; não precisa deploy.) Smoke: cadastro pelo client antigo ainda funciona.

## 4. Hosting (SUSPENSO até Pedro aprovar) - só fix F10 da página rica
Decisão GERENTE: public/publicacao/index.html é a oficial; ponte (function publicacao, hosting-public/) DESCARTADA. firebase.json: hosting.public='public', sem rewrites.
ANTES: confirmar que o site de prod veio deste repo/projeto (Console > Hosting > Releases: quem/quando; last-modified prod 03 Aug 2026) - se for outro site/projeto, NÃO deployar.
Diff F10: public/publicacao/index.html linha 146 `.map(mapDocFields)` -> `.map(fieldValue)`.
    firebase deploy --project api-quero-camarao --only hosting
Em functions, NÃO incluir 'publicacao' (removida). Passo 1 agora: só registerUser.

## Rollback
- Rules: Console > Firestore > Regras > Histórico > restaurar versão anterior (ou colar /tmp/firestore.rules.prod e `firebase deploy --only firestore:rules`).
- Functions novas: `firebase functions:delete registerUser --project api-quero-camarao --force` (app antigo não depende delas).
- Hosting: Console > Hosting > Releases > Rollback na versão anterior.

## Contract (futuro, quando base migrar da v2.0.4)
Trocar por `firestore.rules.strict` (users create:false, orders endurecido) e `storage.rules.strict` (limites 5/25MB, tipos).

## Nota storage.rules
HEAD (628844c) usa `allow write: if request.auth != null` em /user, /Shrimp, /ads: usuário logado PODE subir foto; não há bloqueio, nenhuma correção necessária. O `request.auth == null` que bloqueava logados existia só na working copy NÃO commitada (agora em storage.rules.strict, que também deve ser corrigida para `auth != null` antes de qualquer uso). Se produção estiver bloqueando upload, as regras ativas diferem do HEAD: conferir no Console > Storage > Regras e, se estiverem com `auth == null`, publicar o storage.rules atual: `firebase deploy --project api-quero-camarao --only storage`.

## SPEC 2 (push de nova publicação) - decisão GERENTE
`onPublicationCreated` (functions/src/publicationNotifications.js) NÃO entra no deploy: fica opcional/desativada. SPEC 2 já é coberta pelo fan-out do client (src/controllers/Notifications/sendNotificationNewPublication.js), que notifica só userType 'client', exclui o publicador e usa data {type:'publication', publicationId}. Deployar a function junto geraria push DUPLICADO. Se Pedro quiser push também para produtores: decidir depois (ex.: ativar a function e remover o fan-out do client numa versão futura).

## firestore.indexes.json
Apenas documentação dos 2 índices de shrimpPonds já ATIVOS no Console (feed Home e Minhas Publicações). NÃO referenciado em firebase.json de propósito: assim nenhum `firebase deploy` o aplica nem sugere apagar índices existentes. Não contém os demais índices do projeto.

## ENCARTE: function publicacao (OG) + hosting - local, NÃO deployado
Ordem: 1) `firebase deploy --project api-quero-camarao --only functions:publicacao` 2) `firebase deploy --project api-quero-camarao --only hosting`.
Hosting substitui o site INTEIRO pelo conteúdo de public/: já copiados de prod p/ public/: .well-known/apple-app-site-association, .well-known/assetlinks.json (fingerprint Android ainda é PLACEHOLDER 'SUBSTITUIR__...' em prod também), apple-app-site-association (raiz). firebase.json: hosting.ignore sem '**/.*' (senão .well-known seria DESCARTADO). Novos: public/og-image.png (ícone 1024x1024, fallback). 404 padrão do Firebase não é customizado. Se Pedro tiver outros arquivos em prod (verificar Console>Hosting>Releases), copiar antes.
Se functions:publicacao falhar, rollback: remover o rewrite do firebase.json e redeployar hosting (volta a servir a página estática).
Template da function = cópia de public/publicacao/index.html (functions/src/publicacaoTemplate.html); após editar a página: `cp public/publicacao/index.html functions/src/publicacaoTemplate.html` (jest falha se divergir).

## ENCARTE: imagem OG gerada (publicacaoImage)
Ordem: `firebase deploy --project api-quero-camarao --only functions:publicacaoImage,functions:publicacao` e depois `--only hosting` (rewrite `/publicacao/*/og.png` vem antes de `/publicacao/**`).
Deploy instala `@resvg/resvg-js` (binário nativo linux, sem fontes de sistema: usa functions/src/assets/Comfortaa_700Bold.ttf).
Teste: `curl -sI https://querocamarao.com.br/publicacao/<id>/og.png` (200 image/png) e `curl -s -A WhatsApp/2 .../publicacao/<id> | grep og:image`.
Rollback: remover o rewrite og.png e redeployar hosting; og:image volta sozinho ao deploy anterior de publicacao.
