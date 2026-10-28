# Spec — Chat: "Falar com o produtor", localização, compartilhar conversa, contadores

**Data:** 2026-10-28
**Origem:** feedback do Pedro (áudio transcrito) após teste do app.
**Status:** Aprovado para implementação (TDD)

## Estado atual (verificado no código)

| Item | Estado |
|------|--------|
| Contador de não lidas no ícone verde do Header | Já existe (`Header` + `UnreadBadge` + `useUnreadChatsCount`) |
| Badge no ícone do app (launcher) | `BadgeSync` + `setBadgeCountAsync` + push com `badge`. Já existe |
| Botão do card "CHAT" azul-escuro | **Falta** renomear/recolorir (`ModalShrimpImages`) |
| Enviar localização no chat | **Falta**: `getChatLocation` existe, mas `expo-location` não está instalado/configurado e não há item no menu de anexo |
| Tocar na bolha de localização | **Falta**: `onPress={() => {}}`. Helpers `openInGoogleMaps/openInWaze` já existem |
| Compartilhar conversa p/ outros apps | **Falta** |

## Requisitos e critérios de aceite

### R1 — Botão "Falar com o produtor"
- AC-1.1 Botão de chat no modal do card exibe "Falar com o produtor" (não "CHAT").
- AC-1.2 Cor verde estilo WhatsApp `#25D366`; ícone de balão (`message-circle`).
- AC-1.3 Nenhum contador vermelho no botão; contador vermelho continua no Header (R5).

### R2 — Enviar localização
- AC-2.1 Menu de anexo (iOS e Android) tem "Localização".
- AC-2.2 Android: `Alert` aceita só 3 botões, então "Documento" e "Localização" ficam em um segundo nível ("Mais…").
- AC-2.3 Mensagem enviada com `location: { lat, lng }` validada por `isValidCoords`; coords inválidas não enviam.
- AC-2.4 Permissão negada/indisponível → toast de erro; nada é enviado.
- AC-2.5 Preview da conversa (`buildMessagePreview`) mostra `📍 Localização`.
- AC-2.6 `expo-location` instalado e plugin com texto de permissão em `app.json` (exige novo build nativo).

### R3 — Abrir localização (Waze / Maps)
- AC-3.1 Tocar na bolha de localização abre seletor "Google Maps", "Waze", "Cancelar" (spec anterior: `spec-map-picker-location-chat.md`).
- AC-3.2 Bolha mostra texto "📍 Localização" + "Toque para abrir no mapa", não só ícone.

### R4 — Compartilhar conversa
- AC-4.1 Ícone de compartilhar no cabeçalho do chat abre o share nativo do SO (WhatsApp etc.) via `Share.share`.
- AC-4.2 Texto gerado por `buildChatTranscript`: uma linha por mensagem `[dd/mm/aaaa hh:mm] Nome: conteúdo`, ordem cronológica.
- AC-4.3 Mensagens apagadas para todos ou apagadas para mim (`deletedFor`) não entram.
- AC-4.4 Mídia vira rótulo (`📷 Foto`, `🎵 Áudio`, `📎 Documento`, `📍 Localização` + link do Google Maps) — nunca URL de storage.
- AC-4.5 Conversa sem mensagens → toast "Nada para compartilhar".

### R5 — Contadores
- AC-5.1 Header e ícone do app já cobertos; apenas garantir regressão: `computeUnreadCount` e `formatUnreadBadge` seguem verdes.

## Fora de escopo
- Contador por anúncio no botão "Falar com o produtor".
- Build nativo/EAS e deploy (regra do projeto: sem build sem pedido).
- Live location (localização em tempo real).

## Plano TDD
1. `tests/chatTranscript.test.cjs` → `src/utils/chatTranscript.js`.
2. `tests/messagePreviewLocation.test.cjs` → estender `messagePreview.js`.
3. `tests/locationMessage.test.cjs` → `src/utils/locationMessage.js` (`buildLocationPayload`).
4. UI (botão, menus, bolha) sem teste unitário possível: verificada por `./scripts/verify.sh` (lint).
