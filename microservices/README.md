# Microserviços (VPS)

Serviços isolados que rodam numa VPS ao lado do Firebase. O app e o Firebase Auth/Firestore
continuam como estão: nenhum serviço aqui substitui o backend atual.

Objetivo: aumentar acesso e retenção de público.

## Serviços

| Pasta | Função | Status |
|-------|--------|--------|
| `notifier/` | WhatsApp (WAHA): avisa grupos e clientes quando um camarão é publicado (encarte + link) e quando há mensagem nova no chat | v0.1 pronto, testado com WAHA falso; falta ligar nas Cloud Functions |
| `calls/` | Ligações de voz dentro do app: stack própria (coturn + sinalização) numa VPS com IP público, separada do `notifier` | só o compose do TURN |

## Arquitetura

- Autenticação: o app envia o ID token do Firebase; o serviço valida com o Admin SDK. Não há migração de contas.
- Gatilhos de publicação e chat: as Cloud Functions existentes (`functions/src/publicationNotifications.js`,
  `functions/src/chatNotifications.js`) passam a também chamar o `notifier` por HTTP (com API key).
  O push atual continua funcionando.
- Cada serviço falha de forma independente: se cair, o app segue funcionando.

## Ordem de disparo (decisão do Pedro)

1. Grupos de WhatsApp em que o número é admin (`chatId` `...@g.us`), primeiro.
2. Depois, clientes (contatos já salvos), um a um, em ritmo lento (fila com pausa entre envios).
3. Todos os clientes já são contatos do negócio; mesmo assim cada mensagem deve ter um "SAIR" simples.

## Pontos de atenção (antes de ligar em produção)

- WAHA é cliente não oficial do WhatsApp: risco de banimento. Usar número dedicado, ritmo baixo
  (menos de ~20 msg/min, com fila e pausa entre envios) e engine `NOWEB`.
- Só enviar para quem deu consentimento (LGPD): precisa de opt-in no app e de opt-out por mensagem ("SAIR").
- Formato BR do número no WAHA: DDI+DDD+número sem o 9 extra (ver notas do projeto waha-n8n).
- `calls/` exige build novo do app (`react-native-webrtc`), CallKit/ConnectionService e VoIP push no iOS.
  Só começar depois de o `notifier` estar estável. Alternativa barata já disponível: botão `tel:` (OTA).

## Próximos passos

1. `notifier`: fila (BullMQ/Redis), endpoint `POST /notify/publication` e `POST /notify/chat`, envio via WAHA.
2. Opt-in/opt-out no app + campo de preferência no perfil do usuário.
3. Deploy na VPS (docker compose, TLS, monitoramento).
4. `calls`: subir o coturn na VPS, depois PoC de sinalização (stack separada, ver `calls/README.md`).

## Deploy no servidor particular (Cloudflare Tunnel)

O servidor não tem IP público: o `cloudflared` abre uma conexão de saída para a Cloudflare e
publica só o `notifier` em um hostname seu. WAHA e Redis ficam fechados (127.0.0.1 / rede interna).

1. Cloudflare Zero Trust > Networks > Tunnels > Create tunnel (Cloudflared). Copie o token.
2. No túnel, em Public hostnames: `notifier.querocamarao.com.br` -> Service `http://notifier:3000`.
   (A Cloudflare cria o DNS e o TLS sozinha.)
3. No servidor: `cp .env.example .env`, preencher (chaves fortes, `TUNNEL_TOKEN`).
4. `docker compose up -d --build`
5. Abrir `http://127.0.0.1:3001/dashboard` (WAHA), criar a sessão `default` (engine NOWEB) e ler o QR com o número dedicado.
6. Teste: `curl -X POST https://notifier.querocamarao.com.br/notify/chat -H 'x-api-key: ...'` (sem a chave deve dar 401).

As Cloud Functions vão chamar `https://notifier.querocamarao.com.br/notify/...` com `x-api-key`
(guardar `NOTIFIER_API_KEY` como secret do Firebase, não no código).

O `/webhook/waha` só é chamado pelo WAHA dentro da rede Docker; se quiser, bloqueie `/webhook/*`
no hostname público (Cloudflare > WAF) além do `WEBHOOK_SECRET`.

### Backup e operação

- Backup diário de `redis-data/` (opt-out) e `waha-sessions/` (pareamento). `rsync` para outro disco ou nuvem.
- Nobreak e reinício automático da máquina; o Docker já sobe os serviços (`restart: unless-stopped`).
- WAHA fora do ar ou sessão desconectada: o `notifier` tenta 3 vezes e depois descarta; vale um alerta.
