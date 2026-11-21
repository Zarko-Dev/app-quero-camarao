# calls (ligações de voz no app)

Serviço separado do `notifier`. Roda numa VPS com IP público; não depende do servidor caseiro.

## Partes

| Parte | Onde | Status |
|-------|------|--------|
| TURN (coturn) | VPS com IP público, `docker compose up -d` aqui | compose pronto, não testado |
| Sinalização (NestJS, WebSocket) | VPS ou túnel Cloudflare | não iniciado |
| App (`react-native-webrtc`, CallKit/ConnectionService, VoIP push) | build novo do app | não iniciado |

## Subir o TURN

1. VPS com IP público. Abrir no firewall: `3478/udp`, `3478/tcp` e `49160-49200/udp`.
2. `cp .env.example .env` e preencher `PUBLIC_IP`, `TURN_REALM`, `TURN_SECRET`.
3. `docker compose up -d`.
4. Teste: `turnutils_uclient` (pacote `coturn`) ou o "Trickle ICE" em webrtc.github.io/samples/src/content/peerconnection/trickle-ice com uma credencial temporária.

Credenciais temporárias (REST API do coturn): `username = <expira_unix>:<uid>`,
`password = base64(HMAC-SHA1(TURN_SECRET, username))`. O serviço de sinalização gera isso
para quem estiver autenticado (ID token do Firebase) e entrega ao app junto com a URL `turn:<PUBLIC_IP>:3478`.

## Alternativa

Cloudflare Realtime TURN (gerenciado): dispensa VPS e coturn; o serviço de sinalização só pede
as credenciais à API da Cloudflare. Conferir preço antes de escolher.

## Antes de construir o resto

Ligação dentro do app exige build novo, CallKit/ConnectionService, VoIP push (iOS) e revisão
mais rigorosa da Apple. O botão `tel:` (OTA) cobre a necessidade enquanto isso.
