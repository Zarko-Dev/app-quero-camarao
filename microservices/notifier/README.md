# notifier

Ver ../README.md. Ainda sem código.

## API (header `x-api-key: $NOTIFIER_API_KEY`)

- `POST /notify/publication` `{publicationId, location?, shrimps?[{grammage,kilo}], recipients?[phones]}`
  Enfileira o encarte + link nos grupos de `WPP_GROUP_IDS` (prioridade) e depois nos `recipients`.
  Reenvio do mesmo evento não duplica (jobId por publicação+destino).
- `POST /notify/chat` `{chatId, recipientPhone, senderName?}`
  Aviso "você tem mensagem" (sem o conteúdo). No máximo 1 por conversa/destinatário a cada `CHAT_DEBOUNCE_SEC`.
- `POST /webhook/waha?secret=...` (chamado pelo WAHA): resposta "SAIR" bloqueia o contato.

Envio: 1 mensagem a cada `SEND_INTERVAL_MS` (+ até 3s de jitter), 3 tentativas com backoff.

## Rodar

```
cp ../.env.example ../.env   # preencher
docker compose -f ../docker-compose.yaml up -d --build
npm test                     # testes de mensagem/telefone (Node 24)
```

## Pendências

- Ligar as Cloud Functions (`publicationNotifications.js`, `chatNotifications.js`) a estes endpoints (não feito, nada foi deployado).
- Descobrir/preencher `WPP_GROUP_IDS` (IDs `...@g.us` dos grupos em que o número é admin).
- Lista de opt-out e debounce vivem no Redis: manter o volume `redis-data` no backup.
- Testado só com WAHA falso; falta um envio real de ponta a ponta.
