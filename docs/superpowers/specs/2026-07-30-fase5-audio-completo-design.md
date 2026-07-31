# Fase 5 — Áudio completo estilo WhatsApp — Design Spec

## Goal
Item 7 da especificação geral. Gravação passa a iniciar com UM TOQUE no microfone (não mais segurar), com barra de gravação dedicada (tempo, deslizar/botão pra cancelar, parar), prévia antes de enviar (ouvir, apagar, enviar) e, nos áudios já enviados, controle de velocidade 1x/1,5x/2x. Play/duração/onda/horário/checks já existem.

Decisões (execução contínua autorizada): o gesto de "segurar pra travar" da versão anterior fica OBSOLETO — um toque já inicia gravação contínua, então `recordingGesture.cjs`, seus handlers e teste são removidos (código morto). "Deslizar para cancelar" vira um pan horizontal na barra de gravação (arrastar pra esquerda > 80px cancela), além do botão de lixeira sempre visível.

## Fluxo

1. **Idle** → input normal com mic verde. **Toque** no mic → pede permissão (como hoje) e inicia gravação.
2. **Gravando** → `InputRow` substituída por `RecordingBar`: 🔴 pulsante + timer (`0:07`), área central "‹ Deslize para cancelar" (PanResponder; dx < -80 cancela), botão ⏹ parar (verde). Lixeira à esquerda cancela na hora. Indicador antigo "Gravando..." some (a barra é o indicador).
3. **Prévia** (após parar) → `PreviewBar`: lixeira (descarta), ▶/⏸ (ouve o arquivo local via `Audio.Sound`), duração total, botão ➤ enviar (só aí faz upload + `sendChatMessage`, com o indicador "Enviando áudio..." atual).
4. **Cancelar/descartar** → `stopAndUnloadAsync` + descarte do arquivo, volta ao idle. Sair da tela em gravação/prévia descarta (cleanup no unmount).

## Velocidade nos áudios enviados

- Bolha de áudio ganha pill `1x`/`1,5x`/`2x` após a duração (toque cicla). Estado global da tela (`playbackRate`), aplicado no play (`sound.setRateAsync(rate, true)` — `shouldCorrectPitch: true`) e imediatamente se já tocando. Persistência apenas em memória da tela.

## Mudanças

- `src/pages/PublicationChat/index.jsx`: remove import/uso de `recordingGesture.cjs` e handlers de touch/lock; novos estados `recordingState` (`"idle" | "recording" | "preview"`), `pendingAudio { uri, duration }`, `playbackRate`, `isPreviewPlaying`; `startRecording` (toque), `stopToPreview`, `cancelRecording`, `discardPreview`, `playPreview`, `sendPendingAudio` (reusa o corpo de upload atual); PanResponder pra deslizar-cancelar; pill de velocidade no branch de áudio do `renderItem`.
- `src/pages/PublicationChat/styles.js`: `RecordingBar`, `RecordingDot`, `RecordingTimer`, `SlideHint`, `RoundIconButton` (compartilhado lixeira/parar/enviar/play com prop de cor), `RateButton`, `RateText`. Remove prop `isLocked` do `RecordButton` (volta a verde/vermelho simples — vermelho não é mais necessário: gravando não mostra mic; simplificar pra verde fixo).
- Deletar `src/pages/PublicationChat/recordingGesture.cjs` e `tests/recordingGesture.test.cjs`.

## Error handling
- Permissão negada → volta ao idle (como hoje).
- `Audio.Recording`/`Sound` lançando → Sentry via console.error atual + reset de estado.
- Duração da prévia: usa o contador da gravação (não re-mede o arquivo).
- Unmount durante gravação/prévia: cleanup descarta gravação e som (effect cleanup já existente de stopSound ampliado).

## Testing
- Sem util puro novo testável (fluxo é todo de UI/Audio nativo) — a suíte perde os 2 testes de `recordingGesture` (removidos com a feature morta): baseline passa a 162 testes / 159 pass / 3 fail.
- Manual: tocar mic grava; timer sobe; deslizar esquerda cancela; lixeira cancela; parar → prévia; ouvir prévia; apagar prévia; enviar prévia (chega como áudio normal); pill 1x→1,5x→2x muda velocidade audivelmente (inclusive durante reprodução); áudio recebido continua com play/duração/onda/horário/checks.
