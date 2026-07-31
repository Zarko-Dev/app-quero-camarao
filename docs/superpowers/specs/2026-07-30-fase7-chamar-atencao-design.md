# Fase 7 — Botão "chamar atenção" (bip) — Design Spec

## Goal
Item 12: sino no cabeçalho do chat que envia um alerta sonoro/vibratório ao outro participante ("Fulano está chamando sua atenção."), com limites (1 a cada 30s, máx 5 em 10min), bloqueado em conversa encerrada, e com opção do destinatário desativar o recebimento.

Decisões (execução contínua): enforcement dos limites é client-side nesta fase, gravando o histórico (`attentionLog`) no doc do chat para (a) o próprio cliente calcular os limites de forma persistente entre sessões e (b) a fase de segurança poder mover a validação pra regra/function sem migração de dados. Push via infra existente (`sendNotification` + payload `type: "attention"`). Vibração no destinatário em foreground via `expo-haptics`/`Vibration` no listener de notificação recebida. Opt-out em `users/{id}.attentionEnabled` (default true), com toggle na tela de Perfil? Não — perfil é público; toggle entra no menu 3 pontos do chat ("Silenciar chamadas de atenção" / "Reativar..."), gravando no doc do PRÓPRIO usuário (vale pra todos os chats).

## Dados
- `chats/{id}.attentionLog.{safeSenderId}`: array (máx 5 mantidos) de timestamps (ms epoch, gravados client-side — server timestamp em array não funciona; aceito nesta fase).
- `users/{id}.attentionEnabled`: bool (ausente = true).

## Util (CJS + teste) `src/utils/attentionLimits.js`
`canSendAttention(timestamps, nowMs)` → `{ allowed, reason }`: `"cooldown"` se `now - last < 30_000`; `"window"` se 5 nos últimos 600_000ms; senão allowed. `appendAttention(timestamps, nowMs)` → novo array com now, cortado aos 5 mais recentes.

## Controller `src/controllers/Chat/attention.js`
`sendAttention({ chatId, senderId, senderName, recipientId, publicationId, sellerId, buyerId })`:
1. `getDoc(chats/{chatId})` → se `status === "closed"` → `{ ok: false, reason: "closed" }`.
2. `canSendAttention(log[safeSender], Date.now())` → se bloqueado retorna reason.
3. `getDoc(users/{recipientId})` → se `attentionEnabled === false` → `{ ok: false, reason: "disabled" }` (não envia, avisa o remetente).
4. `updateDoc` do log (`appendAttention`) + `getUserNotificationToken(recipientId)` + `sendNotification(token, "🔔 " + senderName + " está chamando sua atenção.", "Toque para abrir a conversa.", { type: "attention", chatId, publicationId, sellerId, buyerId })`.
`setAttentionEnabled(userId, enabled)` → updateDoc users.

## UI
- `PublicationChat` header: sino (`Feather bell`) entre o título e o menu, oculto em `isChatClosed`. Toque → `sendAttention` com cooldown visual (estado `attentionCooldown` 30s desabilitando o botão, opacity 0.4). Feedback: ok → Toast "Chamada de atenção enviada"; `cooldown`/`window` → Toast "Aguarde para chamar atenção novamente"; `disabled` → Toast "Este usuário desativou chamadas de atenção"; `closed` → nada (botão nem aparece).
- Menu 3 pontos: item "Silenciar chamadas de atenção"/"Reativar chamadas de atenção" (lê `myAttentionEnabled` do doc do próprio usuário, carregado junto ao mount) → `setAttentionEnabled` + Toast.
- `App.jsx`: `navigateToChatFromNotificationData` aceita `type === "attention"` além de `"chat"` (mesmos campos → abre a conversa). Novo `addNotificationReceivedListener`: se `type === "attention"` → `Vibration.vibrate([0, 250, 100, 250])` (import de react-native).

## Testing
`tests/attentionLimits.test.cjs`: cooldown 30s, janela 5/10min, append corta em 5, listas vazias. Manual: fluxo completo entre 2 usuários, limites, opt-out, tap-to-open, vibração foreground.
