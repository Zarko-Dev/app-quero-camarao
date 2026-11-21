# Handoff: finalizar o aviso de publicação por WhatsApp (notifier)

Este arquivo é um prompt de tarefa. Quem for executar (pessoa ou agente) deve ler tudo antes de começar.

## Objetivo

Quando uma publicação de camarão é criada no app Quero Camarão, o serviço `notifier` envia no WhatsApp o encarte (PNG) e o link, primeiro para grupos em que o número é admin. Falta testar com WhatsApp real e fazer o deploy da ligação.

## Contexto (estado atual, verificado)

- `microservices/notifier/` (NestJS + BullMQ/Redis + WAHA, engine `NOWEB`). Código pronto. `npm test` passa (5/5) e `tsc --noEmit` passa. Nunca foi testado com WhatsApp real, só com WAHA falso.
- Endpoints do notifier:
  - `POST /notify/publication` (header `x-api-key`): enfileira o encarte + link nos grupos e em `recipients` opcionais.
  - `POST /notify/chat` (header `x-api-key`): aviso de mensagem nova, com debounce.
  - `POST /webhook/waha?secret=...`: chamado pelo WAHA. Só trata a resposta "SAIR" (bloqueia o contato). Não tem relação com publicação.
- Ligação com a publicação, já implementada em `functions/src/encarteStorage.js` (`notifyWhatsapp`): roda depois de gerar o PNG e só na criação do documento `shrimpPonds/{id}`. Envia só para grupos, sem `recipients`. Sem `NOTIFIER_URL` ou `NOTIFIER_API_KEY` não faz nada. Erro do notifier vai só para o log. Testes em `functions/src/encarteStorage.test.js` passam.
- Não usamos `onPublicationCreated` (`functions/src/publicationNotifications.js`): está desativada em `functions/src/index.js` ("o client já faz o fan-out"). Não reative.
- `functions/src/whatsappAutomations.js` usa outra stack (Evolution API, com valores de exemplo). Não faz parte desta tarefa. Não misture.
- Nada disso foi deployado.

## Regras

- Número de WhatsApp dedicado. WAHA é cliente não oficial: há risco de banimento.
- Ritmo baixo: menos de ~20 msg/min. O notifier já aplica `SEND_INTERVAL_MS` (8000 por padrão) mais jitter.
- Formato BR do número no WAHA: DDI+DDD+número **sem o 9 extra** (ex.: `558598653476`).
- Não enviar para clientes sem opt-in (LGPD). Nesta etapa, somente grupos. `recipients` só com número do próprio testador.
- Não commitar `.env`, chaves, tokens nem a pasta `waha-sessions/`.
- Não fazer deploy de produção, não fazer push e não commitar sem aprovação explícita do Pedro.
- Mudar só o necessário. Não alterar outros projetos da pasta `Documents`.

## Parte 1: teste real do notifier (sem Cloud Functions)

1. `cd microservices && cp .env.example .env`. Preencha `WAHA_API_KEY`, `NOTIFIER_API_KEY` e `WEBHOOK_SECRET` com valores fortes. O `TUNNEL_TOKEN` é obrigatório no compose: crie um túnel Cloudflare, ou comente o serviço `cloudflared` para teste local.
2. Em `WPP_GROUP_IDS`, coloque **só o ID (`...@g.us`) de um grupo de teste**. Vazio, o notifier manda para todos os grupos em que o número é admin.
3. `docker compose up -d --build`. Confirme que `waha`, `notifier`, `redis` e `cloudflared` estão de pé (`docker compose ps`).
4. Abra `http://localhost:3001/dashboard`. Crie a sessão `default` com engine `NOWEB` e escaneie o QR em até ~1 min. Se expirar, a sessão vai para `FAILED`: recrie e escaneie de novo.
5. Teste de envio, só para o seu número:
   ```
   curl -X POST http://localhost:3100/notify/publication \
     -H "x-api-key: $NOTIFIER_API_KEY" -H "Content-Type: application/json" \
     -d '{"publicationId":"teste1","location":"Fortaleza/CE","shrimps":[{"grammage":"12","kilo":50}],"recipients":["55DDDNUMERO8DIGITOS"]}'
   ```
6. Confira, anotando o resultado de cada item:
   - [ ] A mensagem chegou no grupo de teste e no seu número, com kg, gramatura, local, link e "SAIR".
   - [ ] A imagem do encarte veio. Isso exige `ENCARTE_BASE_URL=https://firebasestorage.googleapis.com/v0/b/<bucket>/o` e o arquivo `encartes/teste1.png` no Storage (use o ID de uma publicação real que já tenha encarte).
   - [ ] Reenviar o mesmo `publicationId` **não** duplica.
   - [ ] Responder "SAIR" ao número: o contato é bloqueado e chega a confirmação. Um novo envio para ele não é entregue.
   - [ ] `POST /notify/chat` respeita o debounce (segundo envio em seguida retorna `{"queued":false,"reason":"debounce"}`).
   - [ ] Sem `x-api-key` o notifier responde 401.
   - [ ] Reiniciar os containers (`docker compose restart`) mantém o login do WhatsApp (volume `waha-sessions`) e o opt-out (volume `redis-data`).
   - [ ] Logs sem erro: `docker compose logs notifier waha`.

Se algo falhar, pare, ache a causa raiz, corrija e rode o teste de novo. Não contorne.

## Parte 2: ligar à publicação real

Pré-requisito: Parte 1 inteira aprovada.

1. Defina `NOTIFIER_URL` (URL pública do túnel, sem barra final) e `NOTIFIER_API_KEY` no ambiente das Cloud Functions. Prefira secret do Firebase a arquivo `functions/.env` se este for versionado.
2. `cd functions && npx jest src/encarteStorage.test.js` deve passar.
3. Com aprovação do Pedro, deploy só desta function:
   `firebase deploy --only functions:onPublicationEncarte`
4. Crie uma publicação de teste pelo app. Esperado: o PNG aparece em `encartes/<id>.png`, depois a mensagem com o encarte chega no grupo de teste, uma vez só.
5. Edite a publicação. Esperado: **nenhum** novo aviso (a notificação só dispara na criação).
6. Derrube o notifier de propósito e crie outra publicação. Esperado: a publicação e o encarte funcionam normalmente; só há erro no log.

## Pendências conhecidas (fora do escopo, só registrar)

- Opt-in de clientes no app (LGPD) antes de qualquer envio individual.
- Ligar `chatNotifications.js` ao `POST /notify/chat`.
- Corrigir `notifier/README.md` (diz "Ainda sem código") e adicionar `"type": "module"` ao `notifier/package.json` (aviso `MODULE_TYPELESS_PACKAGE_JSON` nos testes).
- Cobrir com testes a fila, o `api-key.guard` e os controllers do notifier.

## Entrega

Responda com: o que foi testado e o resultado de cada item acima, o que falhou e como foi corrigido, o que não foi possível verificar, e o estado do git (arquivos alterados). Registre em `.agent/progress.md`.
