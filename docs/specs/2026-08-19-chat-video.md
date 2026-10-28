# PRD — Envio de Vídeo no Chat

**Data:** 2026-08-19
**Feature:** Mensagem de vídeo no chat (tipo `video`)
**Status:** Aprovado para desenvolvimento

---

## Contexto

O chat do Quero Camarão já suporta texto, imagem, áudio e documento como tipos de mensagem; a task irmã
(2026-08-19-chat-location.md) acrescenta localização. Pedro solicitou habilitar também envio de vídeo —
seleção da galeria ou gravação pela câmera, upload para Firebase Storage e renderização inline na bolha
do chat com thumbnail + botão de play.

`expo-image-picker` (já instalado) suporta seleção de vídeo nativamente; `expo-av` (já instalado,
`~15.1.7`, com plugin em `app.json`) provê o componente `Video` para playback. Nenhuma nova dependência
é necessária.

---

## Problema

Produtores e compradores de camarão frequentemente querem compartilhar vídeos do viveiro, do produto ou
do processo de colheita durante uma negociação. Hoje só é possível compartilhar imagens; vídeos precisam
de um link externo manual.

---

## Objetivo

Permitir que qualquer participante de um chat ativo envie um vídeo da galeria ou da câmera do dispositivo,
que é armazenado no Firebase Storage e renderizado inline na bolha do chat com controles de play/pausa,
sem sair do app.

---

## Escopo — O QUE ENTRA

### 1. Seleção e validação de vídeo (`PublicationChat/index.jsx`)

Novo handler `pickAndSendVideo(source)`:

- `source`: `"gallery"` | `"camera"`
- Solicita permissão adequada (`requestMediaLibraryPermissionsAsync` ou `requestCameraPermissionsAsync`)
- Chama `launchImageLibraryAsync` / `launchCameraAsync` com:
  ```js
  { mediaTypes: ["videos"], allowsEditing: false, videoMaxDuration: 180 }
  ```
  (`videoMaxDuration: 180` limita gravação pela câmera a 3 min; galeria sem limite de duração imposta
  pelo picker — validado após a seleção)
- Após seleção, validar:
  - `result.assets[0].duration > 180_000` (ms) → Toast "Vídeo muito longo. Máximo: 3 minutos."
  - `result.assets[0].fileSize > 52_428_800` (50 MB) → Toast "Arquivo muito grande. Máximo: 50 MB."
  - Caso `fileSize` seja `null` (iOS pode omitir): pular a validação de tamanho e deixar o upload falhar
    se ultrapassar o limite do Storage (tratado pelo `catch` em `uploadChatVideo`)
- Se válido: chama `uploadChatVideo` → `sendChatMessage` com `videoUrl` + `videoDuration`

**Limite de duração: 3 minutos (180s)**
Razão: equilibra utilidade (clip de viveiro) com custo de storage e tempo de upload em conexão 4G rural.

**Limite de tamanho: 50 MB**
Razão: vídeo de 3 min em 720p a ~2 Mbps ocupa ~45 MB; 50 MB cobre o caso com folga sem onerar storage.

### 2. Controlador `src/controllers/Chat/uploadChatVideo.js`

Segue exatamente o padrão de `uploadChatAudio.js` (XHR blob, `finallyblob?.close?.()`):

```
uploadChatVideo(chatId, localUri) → { error: boolean, url: string | null }
```

- Storage path: `chats/{chatId}/videos/{timestamp}.mp4`
- Content-Type: `video/mp4`
- Timeout XHR: 60 000 ms (vídeos são maiores que áudios)
- Captura exceção no Sentry

### 3. Mudanças em `sendChatMessage` (`controllers/Chat/index.js`)

Novos parâmetros (com default `null`):
- `videoUrl = null`
- `videoDuration = null`

`lastMessage`:
```js
else if (videoUrl) lastMessage = "🎬 Vídeo";
```
(ordem: audioUrl → imageUrl → fileUrl → videoUrl → location → text)

`msgData`:
```js
if (videoUrl) {
    msgData.videoUrl = videoUrl;
    if (videoDuration != null) msgData.videoDuration = videoDuration;
}
```
`videoDuration` é armazenado em **segundos inteiros** (inteiro, não ms), análogo a `audioDuration`.

### 4. Schema Firestore — mensagem de vídeo

```
{
  senderId: string,
  createdAt: Timestamp,
  videoUrl: string,         // URL de download do Firebase Storage
  videoDuration: number     // duração em segundos (opcional, omitido se null)
}
```

- `lastMessage` no doc pai do chat: `"🎬 Vídeo"`

### 5. Botões no attach sheet (`openAttachSheet`)

iOS — `ActionSheetIOS`:
```
["Cancelar", "Galeria (foto)", "Câmera (foto)", "Vídeo da galeria", "Vídeo da câmera", "Documento"]
```
Índices: 0 = cancelar, 1 = foto galeria, 2 = foto câmera, 3 = vídeo galeria, 4 = vídeo câmera, 5 = documento

Android — `Alert`:
```
["Galeria (foto)", "Câmera (foto)", "Vídeo da galeria", "Vídeo da câmera", "Documento"]
```
Nota: Android limita Alert a poucos botões mas aceita arrays maiores — usar 5 opções. Se a task irmã
(localização) rodar antes e alterar o attach sheet, seguir a estrutura de índices que ela deixar e
apenas inserir as opções de vídeo antes de "Documento".

Mensagens de feedback durante upload:
- `setUploadingLabel("Enviando vídeo...")`

### 6. Renderização da bolha de vídeo (`renderBubbleBody`)

Condição: `if (item.videoUrl)` — inserir após o bloco `item.imageUrl`, antes de `item.audioUrl`.

Layout:
- Componente `Video` de `expo-av` (já importado via `Audio`, precisa adicionar `Video` ao import)
- `source={{ uri: item.videoUrl }}`
- `useNativeControls` — controles nativos de play/pausa/seek (evita implementação custom)
- `resizeMode="contain"`
- Dimensões: largura fixa de 220 px (igual a `ImageBubble`), altura de 160 px
- `shouldPlay={false}` — não auto-play
- Long press: abre `MessageActionsSheet` (padrão existente, `onLongPress={openActions}`)
- `renderFooter` padrão abaixo do vídeo

Styled component: `VideoBubble` em `PublicationChat/styles.js` (width: 220, height: 160, borderRadius: 8).

### 7. Encaminhamento (ForwardModal)

`handleForwardSelect` passa:
```js
videoUrl: msg.videoUrl || null,
videoDuration: msg.videoDuration ?? null,
```
Nenhuma outra mudança necessária.

### 8. Utilitários

`src/utils/messagePreview.js`:
- Adicionar: `if (message.videoUrl) return "🎬 Vídeo";`
- Inserir após `imageUrl`, antes de `fileUrl`

`src/utils/messageStatus.js` / outros utils: sem mudança (apenas verificam campos de entrega, não
o tipo de conteúdo).

### 9. Testes (`node --test`)

Arquivo: `src/controllers/Chat/uploadChatVideo.test.cjs`

Casos a cobrir (lógica pura, sem tocar Firebase real):
- Validação de duração: `> 180_000 ms` → rejeita com razão correta
- Validação de tamanho: `> 50 MB` → rejeita com razão correta
- `fileSize === null` → valida só duração (não rejeita por tamanho)
- Montagem de `msgData` com `videoUrl` + `videoDuration` corretos
- `lastMessage` resultante é `"🎬 Vídeo"` quando `videoUrl` presente

Seguir padrão dos outros testes de chat: mocks de `sendChatMessage`, sem acesso a Firebase.

---

## Escopo — O QUE NÃO ENTRA

- Thumbnail gerado separadamente via `expo-video-thumbnails` (não instalado; não necessário com `useNativeControls`)
- Player em tela cheia dedicado (o `useNativeControls` do expo-av já oferece fullscreen nativo no iOS)
- Upload de vídeo em múltiplas partes (multipart) — tamanho máximo de 50 MB torna desnecessário
- Compressão de vídeo no cliente (requereria `expo-video-thumbnails` ou lib extra)
- Preview antes do envio (similar ao `allowsEditing` de imagem) — fora do escopo inicial
- Suporte a formatos além de MP4 (MOV do iOS será aceito pelo picker; enviar como-está, o Firebase Storage não rejeita, mas o content-type será `video/mp4` no storage — aceitável para o MVP)

---

## Fluxo Principal

1. Usuário toca no clipe de papel (AttachButton) no composer
2. Sheet exibe: Galeria (foto) / Câmera (foto) / **Vídeo da galeria** / **Vídeo da câmera** / Documento
3. Usuário escolhe "Vídeo da galeria" ou "Vídeo da câmera"
4. Se câmera: permissão de câmera solicitada; picker abre em modo vídeo com limite de 180s
5. Usuário seleciona / grava o vídeo
6. Validação de duração e tamanho (client-side)
   - Falha → Toast de aviso, sem upload, nenhuma mensagem enviada
7. `isUploading = true`, `uploadingLabel = "Enviando vídeo..."`
8. `uploadChatVideo` faz upload para `chats/{chatId}/videos/{ts}.mp4` via XHR
9. URL de download retornada → `sendChatMessage` grava no Firestore com `videoUrl` + `videoDuration`
10. Indicador de upload some; bolha de vídeo aparece na lista para ambos os participantes
11. Participante toca play → vídeo reproduz inline via `expo-av Video`

---

## Casos de borda

| Situação | Comportamento esperado |
|---|---|
| Vídeo com duração > 3 min (galeria) | Toast "Vídeo muito longo. Máximo: 3 minutos.", sem upload |
| Arquivo > 50 MB | Toast "Arquivo muito grande. Máximo: 50 MB.", sem upload |
| `fileSize` null (iOS galeria) | Pula validação de tamanho; erro de upload tratado pelo catch |
| Upload falha (rede, etc.) | `error: true` retornado; `isUploading` volta a false; sem Toast (padrão dos outros uploads) |
| Chat encerrado (`isChatClosed`) | Opções de vídeo não aparecem (mesma lógica do attach sheet atual) |
| Mensagem encaminhada com videoUrl | `videoUrl` + `videoDuration` passados no `handleForwardSelect` |
| Reprodução falha (URL expirada, etc.) | expo-av exibe estado de erro nativamente via `useNativeControls` |
| MOV gravado no iOS | Aceito pelo picker; enviado ao Storage com content-type `video/mp4` |

---

## Critérios de aceite

- [ ] Opções "Vídeo da galeria" e "Vídeo da câmera" aparecem no attach sheet (iOS e Android)
- [ ] Vídeo com duração > 3 min exibe Toast e não realiza upload
- [ ] Arquivo > 50 MB exibe Toast e não realiza upload
- [ ] Mensagem de vídeo salva no Firestore com campo `videoUrl` (e `videoDuration` quando disponível)
- [ ] `lastMessage` do doc de chat mostra "🎬 Vídeo"
- [ ] Bolha renderiza player de vídeo inline com controles nativos
- [ ] Mensagem pode ser encaminhada via ForwardModal preservando `videoUrl`
- [ ] `buildMessagePreview` retorna "🎬 Vídeo" para mensagens de vídeo
- [ ] Testes `node --test` cobrem lógica pura de validação e montagem de msgData, todos passando

---

## Decisões tomadas (sem consulta)

| Decisão | Razão |
|---|---|
| `expo-av Video` com `useNativeControls` | Já instalado; evita nova dependência; fullscreen nativo gratuito |
| Sem `expo-video-thumbnails` | Não instalado; `useNativeControls` exibe frame inicial; fora do escopo mínimo |
| Limite 50 MB / 3 min | Cobre clip de viveiro em 720p@2Mbps com folga; evita abuse de storage |
| XHR blob em `uploadChatVideo` (igual ao áudio) | `fetch().blob()` é instável para arquivos grandes no RN/Hermes/Android |
| `videoDuration` em segundos inteiros | Consistência com `audioDuration` já existente |
| `content-type: video/mp4` fixo | Simplifica o storage path; MOV do iOS reproduz corretamente em todos os players |
| Sem compressão client-side | Requereria lib extra; limite de tamanho mitiga o risco de uploads gigantes |

---

## Arquivos a criar/modificar

**Novos:**
- `src/controllers/Chat/uploadChatVideo.js` — upload XHR para Storage
- `src/controllers/Chat/uploadChatVideo.test.cjs` — testes node --test

**Modificados:**
- `src/controllers/Chat/index.js` — `sendChatMessage` aceita `videoUrl` + `videoDuration`
- `src/pages/PublicationChat/index.jsx` — `pickAndSendVideo`, `openAttachSheet`, `renderBubbleBody`, `handleForwardSelect`, import `Video` de expo-av
- `src/pages/PublicationChat/styles.js` — styled component `VideoBubble`
- `src/utils/messagePreview.js` — caso `videoUrl`

**Sem mudanças:**
- `app.json` — expo-av já configurado como plugin
- `package.json` — expo-av já instalado
- `firestore.rules` — regras de storage já permitem `chats/{chatId}/videos/`
