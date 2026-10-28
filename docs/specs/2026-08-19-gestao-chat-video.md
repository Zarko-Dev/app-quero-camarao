# Gestão — Feature: Envio de vídeo no chat

Data: 2026-08-19
Fase: gestão
Automação: quero-camarao-1787181705749
Spec produto base: `docs/specs/2026-08-19-chat-video.md`

---

## Resumo executivo

Adicionar mensagem de vídeo ao chat. O app já suporta texto, imagem, áudio e documento; a task
irmã de localização (quero-camarao-1787181538297) adiciona o 5º tipo. Vídeo é o 6º tipo.
Nenhuma dependência nova é necessária: `expo-image-picker` já instalado suporta vídeo nativamente,
`expo-av` já instalado provê `Video` para playback inline. O upload segue o padrão XHR blob de
`uploadChatAudio.js` (não `fetch().blob()` — instável no Hermes/Android para arquivos grandes).

Limite de tamanho: 50 MB. Limite de duração: 3 minutos (180s). Timeout XHR: 60 000ms.

---

## Coordenação com a task irmã de localização

Ambas as tasks (localização e vídeo) tocam os mesmos arquivos: `controllers/Chat/index.js`,
`pages/PublicationChat/index.jsx`, `pages/PublicationChat/styles.js`.

**Se localização for implementada primeiro**, o attach sheet iOS terá:
```
["Cancelar", "Galeria", "Câmera", "Documento", "Localização"]
```
Nesse caso, a implementação de vídeo deve inserir as duas opções de vídeo **antes de "Documento"**,
resultando em:
```
["Cancelar", "Galeria (foto)", "Câmera (foto)", "Vídeo da galeria", "Vídeo da câmera", "Documento", "Localização"]
```
Índices: 0=cancelar, 1=foto galeria, 2=foto câmera, 3=vídeo galeria, 4=vídeo câmera, 5=documento, 6=localização.

**Se vídeo for implementado primeiro**, a task de localização deve seguir os índices que o vídeo
estabelecer.

Para `sendChatMessage`: ambas as tasks adicionam branches ao `if/else if` de `lastMessage` e
`msgData`. A cadeia atual (audioUrl → imageUrl → fileUrl) tem o `else` final em msgData para
texto — qualquer novo tipo (location, videoUrl) vai como `else if` antes desse `else`.

---

## Contexto de código — pontos críticos

### `src/controllers/Chat/index.js` — `sendChatMessage` (estado atual, sem localização)

**Assinatura (linha 70–90):** último parâmetro é `isAutoMessage = false` (linha 89).
Adicionar `videoUrl = null` e `videoDuration = null` antes de `isAutoMessage`.

**Chain `lastMessage` (linhas 98–100):**
```js
// ATUAL:
if (audioUrl) lastMessage = "🎵 Áudio";
else if (imageUrl) lastMessage = "📷 Foto";
else if (fileUrl) lastMessage = "📎 Documento";

// APÓS (vídeo entra após fileUrl):
if (audioUrl) lastMessage = "🎵 Áudio";
else if (imageUrl) lastMessage = "📷 Foto";
else if (fileUrl) lastMessage = "📎 Documento";
else if (videoUrl) lastMessage = "🎬 Vídeo";
```

**Chain `msgData` (linhas 134–145):**
```js
// ATUAL — o else em msgData está na linha 143:
} else if (fileUrl) {
    msgData.fileUrl = fileUrl;
    if (fileName) msgData.fileName = fileName;
    if (fileSize != null) msgData.fileSize = fileSize;
} else {
    msgData.text = trimmed;
}

// APÓS — inserir entre fileUrl e else:
} else if (fileUrl) {
    msgData.fileUrl = fileUrl;
    if (fileName) msgData.fileName = fileName;
    if (fileSize != null) msgData.fileSize = fileSize;
} else if (videoUrl) {
    msgData.videoUrl = videoUrl;
    if (videoDuration != null) msgData.videoDuration = videoDuration;
} else {
    msgData.text = trimmed;
}
```

> Se a task de localização já rodou, o branch `else if (location)` estará antes do `else`
> final — inserir `else if (videoUrl)` após `fileUrl` e antes de `location`.

### `src/controllers/Chat/uploadAudio.js` — padrão a replicar

O controller de vídeo deve ser uma cópia de `uploadChatAudio.js` com:
- `filename`: `${Date.now()}.mp4`
- `storageRef path`: `chats/${chatId}/videos/${filename}`
- `contentType`: `video/mp4`
- `xhr.timeout`: `60000` (áudio usa 15000; vídeos são maiores)
- Sentry em catch; `blob?.close?.()` em finally

### `src/pages/PublicationChat/index.jsx` — pontos de edição

**Import expo-av (linha 4):** trocar `{ Audio }` por `{ Audio, Video }`.

**`openAttachSheet` (linha 608) — estado atual (sem localização):**
```js
// iOS ATUAL:
{ options: ["Cancelar", "Galeria", "Câmera", "Documento"], cancelButtonIndex: 0 }
// iOS APÓS (sem localização já implementada):
{ options: ["Cancelar", "Galeria (foto)", "Câmera (foto)", "Vídeo da galeria", "Vídeo da câmera", "Documento"], cancelButtonIndex: 0 }
// handler: idx 3 → pickAndSendVideo("gallery"), idx 4 → pickAndSendVideo("camera"), idx 5 → sendDocument()

// Android ATUAL (linha 620–624): 3 botões
// Android APÓS: 5 botões
[
    { text: "Galeria (foto)", onPress: () => pickAndSendImage("gallery") },
    { text: "Câmera (foto)", onPress: () => pickAndSendImage("camera") },
    { text: "Vídeo da galeria", onPress: () => pickAndSendVideo("gallery") },
    { text: "Vídeo da câmera", onPress: () => pickAndSendVideo("camera") },
    { text: "Documento", onPress: () => sendDocument() },
]
```

**`handleForwardSelect` (linha 882):** adicionar ao objeto passado para `sendChatMessage`:
```js
videoUrl: msg.videoUrl || null,
videoDuration: msg.videoDuration ?? null,
```

**`renderBubbleBody` (linha 956):** inserir bloco de vídeo **entre** `item.imageUrl` (linha 960)
e `item.audioUrl` (linha 977):
```jsx
if (item.videoUrl) {
    return (
        <Bubble isMine={isMine} style={{ padding: 4 }}>
            {renderForwardTag(item)}
            {renderQuote(item)}
            <TouchableOpacity onLongPress={openActions} activeOpacity={0.9}>
                <VideoBubble>
                    <Video
                        source={{ uri: item.videoUrl }}
                        useNativeControls
                        resizeMode="contain"
                        shouldPlay={false}
                        style={{ width: 220, height: 160, borderRadius: 8 }}
                    />
                </VideoBubble>
            </TouchableOpacity>
            {renderFooter(item, isMine, { paddingHorizontal: 6 })}
        </Bubble>
    );
}
```

**Novo handler `pickAndSendVideo(source)` (criar próximo a `pickAndSendImage`):**
```js
const pickAndSendVideo = async (source) => {
    const options = { mediaTypes: ["videos"], allowsEditing: false, videoMaxDuration: 180 };
    const pickFn = source === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;
    const permFn = source === "camera"
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permFn();
    if (status !== "granted") return;

    const result = await pickFn(options);
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    if ((asset.duration ?? 0) > 180_000) {
        Toast.show({ type: "error", text1: "Vídeo muito longo. Máximo: 3 minutos." });
        return;
    }
    if (asset.fileSize != null && asset.fileSize > 52_428_800) {
        Toast.show({ type: "error", text1: "Arquivo muito grande. Máximo: 50 MB." });
        return;
    }

    setIsUploading(true);
    setUploadingLabel("Enviando vídeo...");
    const { error, url } = await uploadChatVideo(resolvedChatId, asset.uri);
    setIsUploading(false);
    setUploadingLabel("");
    if (error || !url) return;

    const durationSec = asset.duration ? Math.round(asset.duration / 1000) : null;
    await sendChatMessage({
        publicationId: publication.id,
        sellerId,
        buyerId,
        senderId: myId,
        videoUrl: url,
        ...(durationSec != null ? { videoDuration: durationSec } : {}),
        sellerName: resolvedSellerName || "",
        buyerName: resolvedBuyerName || buyerName || "",
        publicationTitle: publication?.title || publicationTitle || "",
        publicationLocation: publication?.location || publicationLocation || "",
        publicationSummary: publication?.summary || publicationSummary || "",
    });
};
```

### `src/pages/PublicationChat/styles.js` — novo styled component

```js
export const VideoBubble = styled.View`
    width: 220px;
    height: 160px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #000;
`;
```

### `src/utils/messagePreview.js`

Linha 5: adicionar após `imageUrl`, antes de `fileUrl`:
```js
if (message.videoUrl) return "🎬 Vídeo";
```

---

## Passos de implementação (ordem obrigatória)

### Passo 1 — Criar `src/controllers/Chat/uploadChatVideo.js`

Clonar `uploadChatAudio.js` e ajustar:
- Alterar `localUriToBlob` — mudar nome do erro para `uploadChatVideo: ...`
- `filename = \`${Date.now()}.mp4\``
- `storageRef = \`chats/${chatId}/videos/${filename}\``
- `contentType: "video/mp4"`
- `xhr.timeout = 60000`
- Exportar como `uploadChatVideo`

### Passo 2 — Modificar `src/controllers/Chat/index.js`

Três edições dentro de `sendChatMessage`:

**2a — parâmetro (linha 89):** inserir antes de `isAutoMessage = false`:
```js
videoUrl = null,
videoDuration = null,
```

**2b — chain lastMessage (linha 100):** adicionar após `else if (fileUrl)`:
```js
else if (videoUrl) lastMessage = "🎬 Vídeo";
```

**2c — chain msgData (linha 142):** inserir antes do `} else { msgData.text`:
```js
} else if (videoUrl) {
    msgData.videoUrl = videoUrl;
    if (videoDuration != null) msgData.videoDuration = videoDuration;
```

### Passo 3 — Modificar `src/pages/PublicationChat/index.jsx`

Cinco edições (pode fazer em qualquer sub-ordem):

**3a** — Linha 4: `{ Audio }` → `{ Audio, Video }`

**3b** — Adicionar import de `uploadChatVideo`:
```js
import { uploadChatVideo } from "../../controllers/Chat/uploadChatVideo";
```

**3c** — Adicionar handler `pickAndSendVideo` (ver spec acima)

**3d** — `openAttachSheet` (linha 608): expandir opções conforme spec acima (coordenar com estado da task irmã)

**3e** — `handleForwardSelect` (linha 895): adicionar `videoUrl` e `videoDuration`

**3f** — `renderBubbleBody` (linha 975, após bloco `imageUrl`): inserir bloco de vídeo

### Passo 4 — Modificar `src/pages/PublicationChat/styles.js`

Adicionar `VideoBubble` (ver spec acima).

### Passo 5 — Modificar `src/utils/messagePreview.js`

Adicionar caso `videoUrl` após `imageUrl` (linha 4).

### Passo 6 — Criar `src/controllers/Chat/uploadChatVideo.test.cjs`

Arquivo de testes `node --test`. Casos obrigatórios:

| Teste | O que verifica |
|-------|----------------|
| Duração > 180 000 ms | Retorna erro com razão correta; sem chamada ao Storage |
| Tamanho > 52 428 800 bytes | Retorna erro com razão correta |
| `fileSize === null` | Não rejeita por tamanho; prossegue para upload (mock XHR) |
| Upload bem-sucedido | `uploadChatVideo` retorna `{ error: false, url: '...' }` |
| Upload falha XHR | Retorna `{ error: true, url: null }` |
| `msgData` com `videoUrl` | `sendChatMessage` recebe `videoUrl` + `videoDuration` corretos |
| `lastMessage` = "🎬 Vídeo" | Quando `videoUrl` presente, `lastMessage` é `"🎬 Vídeo"` |

Seguir o padrão dos outros testes de chat: mocks de Firebase via `globalThis`; sem acesso a
Storage real; rodar com `node --test`.

---

## Critérios de aceite (verificáveis)

| # | Cenário | Resultado esperado |
|---|---------|-------------------|
| AC-1 | `openAttachSheet` abre — iOS | Opções "Vídeo da galeria" e "Vídeo da câmera" visíveis no ActionSheet |
| AC-2 | `openAttachSheet` abre — Android | Botões "Vídeo da galeria" e "Vídeo da câmera" no Alert |
| AC-3 | Vídeo com duração > 3 min selecionado | Toast "Vídeo muito longo. Máximo: 3 minutos."; nenhuma mensagem enviada |
| AC-4 | Arquivo > 50 MB selecionado | Toast "Arquivo muito grande. Máximo: 50 MB."; nenhuma mensagem enviada |
| AC-5 | `fileSize` null (iOS galeria) | Sem Toast de tamanho; upload prossegue |
| AC-6 | Upload falha (rede) | `isUploading` volta a false; nenhuma mensagem enviada; app não crasha |
| AC-7 | Fluxo feliz — galeria ou câmera | Indicador "Enviando vídeo..." durante upload; desaparece ao concluir |
| AC-8 | Mensagem salva no Firestore | Doc `chats/{id}/messages` tem `{ senderId, createdAt, videoUrl, videoDuration? }` |
| AC-9 | `lastMessage` do chat pai | "🎬 Vídeo" visível na lista de conversas |
| AC-10 | Bolha renderizada — receptor | Player inline com controles nativos (play/pause/seek/fullscreen) |
| AC-11 | Long press na bolha | Abre `MessageActionsSheet` (mesmo padrão dos outros tipos) |
| AC-12 | Encaminhar mensagem de vídeo | `videoUrl` + `videoDuration` preservados no chat destino |
| AC-13 | `buildMessagePreview` para videoUrl | Retorna "🎬 Vídeo" |
| AC-14 | `node --test uploadChatVideo.test.cjs` | Todos os testes passam; zero toque no Storage real |
| AC-15 | Chat encerrado | Botões de vídeo inacessíveis (mesma lógica do attach sheet existente) |

---

## Arquivos a criar / modificar

**Novos:**
- `src/controllers/Chat/uploadChatVideo.js` — upload XHR blob para Storage
- `src/controllers/Chat/uploadChatVideo.test.cjs` — testes node --test

**Modificados:**
- `src/controllers/Chat/index.js` — `sendChatMessage` aceita `videoUrl` + `videoDuration`
- `src/pages/PublicationChat/index.jsx` — import `Video`, handler `pickAndSendVideo`, attach sheet, bubble, forward
- `src/pages/PublicationChat/styles.js` — `VideoBubble`
- `src/utils/messagePreview.js` — caso `videoUrl`

**Não tocar:**
- `app.json` — `expo-av` já configurado como plugin (ao contrário da task de localização)
- `package.json` — expo-av já instalado
- Firestore real durante desenvolvimento (testes usam mock)
- Cloud Functions (listener `onChatMessageCreated` já dispara notificação para qualquer nova mensagem)
- `firestore.rules` (já permitem escrita em `messages` por participantes do chat)

---

## Decisões tomadas (sem consulta a Pedro)

| Decisão | Razão |
|---------|-------|
| XHR blob em `uploadChatVideo` (igual ao áudio) | `fetch().blob()` é instável para arquivos grandes no RN/Hermes/Android |
| Timeout XHR 60 000ms (não 15 000ms do áudio) | Vídeos de até 50 MB em 4G rural podem demorar >15s |
| Limite 50 MB / 3 min | Cobre clip de viveiro em 720p@2Mbps com folga; evita abuse de storage |
| `expo-av Video` com `useNativeControls` | Já instalado; fullscreen nativo gratuito; evita nova dependência |
| `videoDuration` em segundos inteiros | Consistência com `audioDuration` já existente |
| `content-type: video/mp4` fixo | Simplifica o storage path; MOV do iOS reproduz corretamente em todos os players |
| Sem `expo-video-thumbnails` | Não instalado; `useNativeControls` exibe frame inicial; fora do escopo mínimo |
| `VideoBubble` styled component em styles.js | Consistência com `ImageBubble`, `AudioBubble` existentes |
| Vídeo renderizado entre imageUrl e audioUrl na bolha | Prioridade visual: imagem/vídeo acima de áudio/arquivo |
