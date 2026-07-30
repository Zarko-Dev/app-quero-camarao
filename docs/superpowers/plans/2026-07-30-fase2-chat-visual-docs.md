# Fase 2 — Visual do Chat + Documentos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bolhas verde-claro/branco sobre fundo bege com papel de parede SVG temático, botões de enviar/mic verdes, botão de câmera dedicado, clipe com Galeria/Câmera/Documento e envio de PDF/Word/Excel/TXT com bolha de arquivo.

**Architecture:** Recolor puro em `styles.js` + `ReadReceipt`; wallpaper como componente SVG absoluto `pointerEvents="none"` atrás da lista; upload de documento espelha o de imagem (`uploadFile.js`), `sendChatMessage` ganha `fileUrl/fileName/fileSize` e prévia "📎 Documento"; barra de input ganha `CameraButton` e o attach-sheet vira menu de 3 opções nos dois SOs.

**Tech Stack:** styled-components/native, react-native-svg 15 (instalado), expo-document-picker ~13.1 (instalado), Firebase Storage (`uploadBytes`), `Linking.openURL`. Testes: `node --test tests/*.test.cjs` (NUNCA `yarn test:unit`). Baseline atual: 133/136+ (3 falhas pré-existentes em winner-share).

**Spec:** `docs/superpowers/specs/2026-07-30-fase2-chat-visual-docs-design.md`

---

### Task 1: Util `formatFileSize` (TDD)

**Files:**
- Create: `src/utils/formatFileSize.js`
- Test: `tests/formatFileSize.test.cjs`

- [ ] **Step 1: Teste (falha)**

```js
// tests/formatFileSize.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");

const { formatFileSize } = require("../src/utils/formatFileSize");

test("retorna vazio para inválido ou <= 0", () => {
    assert.equal(formatFileSize(0), "");
    assert.equal(formatFileSize(-10), "");
    assert.equal(formatFileSize(NaN), "");
    assert.equal(formatFileSize(undefined), "");
    assert.equal(formatFileSize(null), "");
});

test("bytes inteiros abaixo de 1024", () => {
    assert.equal(formatFileSize(1), "1 B");
    assert.equal(formatFileSize(532), "532 B");
    assert.equal(formatFileSize(1023), "1023 B");
});

test("KB com 1 casa decimal e vírgula", () => {
    assert.equal(formatFileSize(1024), "1,0 KB");
    assert.equal(formatFileSize(12698), "12,4 KB");
    assert.equal(formatFileSize(1024 * 1023), "1023,0 KB");
});

test("MB com 1 casa decimal e vírgula a partir de 1024 KB", () => {
    assert.equal(formatFileSize(1024 * 1024), "1,0 MB");
    assert.equal(formatFileSize(Math.round(1.8 * 1024 * 1024)), "1,8 MB");
});
```

- [ ] **Step 2:** `node --test tests/formatFileSize.test.cjs` → FAIL (module not found)

- [ ] **Step 3: Implementar**

```js
// src/utils/formatFileSize.js
const formatFileSize = (bytes) => {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n < 1024) return `${Math.floor(n)} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1).replace(".", ",")} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1).replace(".", ",")} MB`;
};

module.exports = { formatFileSize };
```

- [ ] **Step 4:** `node --test tests/formatFileSize.test.cjs` → PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatFileSize.js tests/formatFileSize.test.cjs
git commit -m "feat: add formatFileSize util (B/KB/MB pt-BR)"
```

---

### Task 2: Recolor — `styles.js` + `ReadReceipt` + novos styled components

**Files:**
- Modify: `src/pages/PublicationChat/styles.js`
- Modify: `src/pages/PublicationChat/index.jsx` (só o componente `ReadReceipt` e o ícone play/pause — nada mais)

- [ ] **Step 1: Edições em `styles.js`** (trocar cada bloco pelo indicado; o restante do arquivo fica intocado)

`Container`:
```js
export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #F1ECE4;
`;
```

`Bubble` (apenas a linha do background):
```js
    background-color: ${({ isMine }) => (isMine ? "#DCF4D4" : "#fff")};
```

`BubbleText`:
```js
    color: ${({ isMine }) => (isMine ? "#1f3d2b" : "#36536e")};
```

`BubbleTime`:
```js
    color: ${({ isMine }) => (isMine ? "#6b8a70" : "#8fa3b2")};
```

`AudioPlayButton` (linha do background):
```js
    background-color: rgba(0, 0, 0, 0.06);
```

`AudioWave`:
```js
    background-color: ${({ isMine }) => (isMine ? "#a8cbae" : "#c8d8e4")};
```

`AudioDuration`:
```js
    color: ${({ isMine }) => (isMine ? "#6b8a70" : "#64788a")};
```

`SendButton` (linha do background):
```js
    background-color: #4BB543;
```

`RecordButton` (linha do background — mantém isLocked/isRecording):
```js
    background-color: ${({ isRecording, isLocked }) => (isLocked ? "#1f6feb" : isRecording ? "#e53935" : "#4BB543")};
`;
```

Novos styled components no fim do arquivo:
```js
export const CameraButton = styled.TouchableOpacity`
    width: 36px;
    height: 42px;
    align-items: center;
    justify-content: center;
`;

export const FileRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 10px;
    min-width: 180px;
`;

export const FileInfo = styled.View`
    flex: 1;
`;

export const FileName = styled(Text)`
    color: ${({ isMine }) => (isMine ? "#1f3d2b" : "#36536e")};
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 700;
`;

export const FileSize = styled(Text)`
    color: ${({ isMine }) => (isMine ? "#6b8a70" : "#8fa3b2")};
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    margin-top: 2px;
`;
```

- [ ] **Step 2: `ReadReceipt` em `index.jsx`** (componente module-scope no topo) vira:

```jsx
const ReadReceipt = ({ status }) => (
    <View style={{ flexDirection: "row" }}>
        <Feather
            name="check"
            size={12}
            color={status === "read" ? "#4BB543" : "#8fa3b2"}
        />
        {status === "read" && (
            <Feather
                name="check"
                size={12}
                color="#4BB543"
                style={{ marginLeft: -7 }}
            />
        )}
    </View>
);
```

E no branch de áudio do `renderItem`, o ícone play/pause:
```jsx
<Feather name={isPlaying ? "pause" : "play"} size={20} color={isMine ? "#2e5e38" : "#f55b1f"} />
```

- [ ] **Step 3: Lint** — `npx eslint src/pages/PublicationChat/styles.js src/pages/PublicationChat/index.jsx` → sem erros NOVOS (styles.js tem 1 baseline `no-nested-ternary` no RecordButton; index.jsx tem ~25 baseline).

- [ ] **Step 4: Commit**

```bash
git add src/pages/PublicationChat/styles.js src/pages/PublicationChat/index.jsx
git commit -m "feat: WhatsApp-style chat colors (light green sent, beige bg, green accents)"
```

---

### Task 3: `ChatWallpaper` (SVG)

**Files:**
- Create: `src/pages/PublicationChat/ChatWallpaper.jsx`
- Modify: `src/pages/PublicationChat/index.jsx` (montar o wallpaper)

- [ ] **Step 1: Criar o componente**

```jsx
// src/pages/PublicationChat/ChatWallpaper.jsx
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";

const STROKE = "#8a7a5f";
const OPACITY = 0.06;
const WIDTH = 1.5;

export const ChatWallpaper = () => (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
            <Defs>
                <Pattern id="qcWallpaper" width={120} height={120} patternUnits="userSpaceOnUse">
                    {/* camarão (quadrante sup. esq.): corpo curvo + antenas */}
                    <Path
                        d="M14 34 C10 24 18 14 30 16 C42 18 46 28 40 36 C36 41 28 42 22 39"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    <Path d="M30 16 L36 8 M33 17 L41 11" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    {/* ondas (quadrante sup. dir.): 3 arcos empilhados */}
                    <Path d="M70 24 Q76 18 82 24 T94 24" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    <Path d="M70 32 Q76 26 82 32 T94 32" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    <Path d="M70 40 Q76 34 82 40 T94 40" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    {/* viveiro (quadrante inf. esq.): retângulo com linha d'água */}
                    <Rect x={12} y={76} width={36} height={24} rx={4} stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    <Path d="M12 86 Q18 82 24 86 T36 86 T48 86" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    {/* balança (quadrante inf. dir.): travessão + suporte + pratos */}
                    <Path d="M82 74 L82 98 M70 78 L94 78" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    <Path d="M64 88 Q70 94 76 88 M88 88 Q94 94 100 88" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                    <Path d="M70 78 L64 88 M76 88 L70 78 M94 78 L88 88 M100 88 L94 78" stroke={STROKE} strokeWidth={WIDTH} fill="none" opacity={OPACITY} />
                </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#qcWallpaper)" />
        </Svg>
    </View>
);
```

(Coordenadas são ponto de partida validado visualmente depois; contrato: 4 motivos, linha fina, opacidade ≤ 0.08, tile 120x120, `pointerEvents="none"`.)

- [ ] **Step 2: Montar em `index.jsx`**

Import: `import { ChatWallpaper } from "./ChatWallpaper";`

No JSX, primeiro filho do `KeyboardAvoidingView`, antes da `FlatList`:

```jsx
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={80}
            >
                <ChatWallpaper />
                <FlatList
```

- [ ] **Step 3: Lint** — `npx eslint src/pages/PublicationChat/ChatWallpaper.jsx src/pages/PublicationChat/index.jsx` → sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PublicationChat/ChatWallpaper.jsx src/pages/PublicationChat/index.jsx
git commit -m "feat: themed low-opacity SVG wallpaper behind chat messages"
```

---

### Task 4: `uploadChatFile` + campos de arquivo no `sendChatMessage`

**Files:**
- Create: `src/controllers/Chat/uploadFile.js`
- Modify: `src/controllers/Chat/index.js` (`sendChatMessage`)

- [ ] **Step 1: Controller de upload** (espelho de `uploadImage.js`)

```js
// src/controllers/Chat/uploadFile.js
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Sentry from "@sentry/react-native";
import { storage } from "../../services/Firebase";

const sanitizeFileName = (name) =>
    String(name || "arquivo").replace(/[^A-Za-z0-9._-]/g, "_");

export const uploadChatFile = async (chatId, localUri, fileName, mimeType) => {
    try {
        const filename = `${Date.now()}_${sanitizeFileName(fileName)}`;
        const storageRef = ref(storage, `chats/${chatId}/files/${filename}`);

        const response = await fetch(localUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob, {
            contentType: mimeType || "application/octet-stream",
        });
        const url = await getDownloadURL(storageRef);
        return { error: false, url };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true, url: null };
    }
};
```

- [ ] **Step 2: `sendChatMessage` em `src/controllers/Chat/index.js`**

a) Assinatura ganha os campos (após `imageUrl = null`):
```js
    imageUrl = null,
    fileUrl = null,
    fileName = null,
    fileSize = null,
```

b) A linha do `lastMessage` (hoje `const lastMessage = audioUrl ? "🎵 Áudio" : imageUrl ? "📷 Foto" : trimmed;`) vira:
```js
        const lastMessage = audioUrl ? "🎵 Áudio" : imageUrl ? "📷 Foto" : fileUrl ? "📎 Documento" : trimmed;
```
(Se o eslint `no-nested-ternary` acusar erro NOVO nessa linha: a linha atual já viola a regra e está na baseline — manter o mesmo formato; se ainda assim contar como novo por mudança de conteúdo, adicionar `// eslint-disable-line no-nested-ternary` nela, não no arquivo.)

c) No bloco `msgData`, adicionar branch de arquivo entre imagem e texto:
```js
        } else if (imageUrl) {
            msgData.imageUrl = imageUrl;
        } else if (fileUrl) {
            msgData.fileUrl = fileUrl;
            if (fileName) msgData.fileName = fileName;
            if (fileSize != null) msgData.fileSize = fileSize;
        } else {
            msgData.text = trimmed;
        }
```

- [ ] **Step 3: Lint + testes** — `npx eslint src/controllers/Chat/uploadFile.js src/controllers/Chat/index.js` sem erros novos; `node --test tests/*.test.cjs` baseline inalterada.

- [ ] **Step 4: Commit**

```bash
git add src/controllers/Chat/uploadFile.js src/controllers/Chat/index.js
git commit -m "feat: chat document upload controller and file message fields"
```

---

### Task 5: Barra de input + fluxo de documento + bolha de arquivo

**Files:**
- Modify: `src/pages/PublicationChat/index.jsx`

- [ ] **Step 1: Imports**

- Adicionar `Alert` e `Linking` ao import de `react-native` (linha 2).
- Adicionar `import * as DocumentPicker from "expo-document-picker";` após o import de `expo-image-picker`.
- Adicionar `import { uploadChatFile } from "../../controllers/Chat/uploadFile";` após o de `uploadImage`.
- Adicionar `import { formatFileSize } from "../../utils/formatFileSize";` após o de `chatReadStatus`.
- Adicionar `CameraButton`, `FileInfo`, `FileName`, `FileRow`, `FileSize` ao import de `./styles` (ordem alfabética dentro da lista).

- [ ] **Step 2: `sendDocument`** (nova função, colocar após `pickAndSendImage`)

```js
    const sendDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "text/plain",
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.[0]?.uri) return;
            const asset = result.assets[0];

            const currentBuyerId = paramBuyerId ?? myId;
            const currentChatId = chatId ?? (publication.id && currentBuyerId
                ? chatDocId(publication.id, currentBuyerId)
                : null);

            if (!myId || !currentBuyerId || !currentChatId) {
                console.warn("[Chat] sendDocument: ids not ready", { myId, currentBuyerId, currentChatId });
                return;
            }

            setIsUploading(true);
            setUploadingLabel("Enviando documento...");
            const { error, url } = await uploadChatFile(currentChatId, asset.uri, asset.name, asset.mimeType);
            setIsUploading(false);
            setUploadingLabel("");

            if (!error && url) {
                await sendChatMessage({
                    publicationId: publication.id,
                    sellerId,
                    buyerId: currentBuyerId,
                    senderId: myId,
                    fileUrl: url,
                    fileName: asset.name || "Documento",
                    fileSize: asset.size ?? null,
                    sellerName: resolvedSellerName || "",
                    buyerName,
                    publicationTitle: publication?.publicationTitle || publication?.location || "",
                });
            }
        } catch (e) {
            console.error("[Chat] sendDocument error", e);
            setIsUploading(false);
            setUploadingLabel("");
        }
    };
```

- [ ] **Step 3: `openAttachSheet` reformulado**

```js
    const openAttachSheet = () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ["Cancelar", "Galeria", "Câmera", "Documento"], cancelButtonIndex: 0 },
                (idx) => {
                    if (idx === 1) pickAndSendImage("gallery");
                    if (idx === 2) pickAndSendImage("camera");
                    if (idx === 3) sendDocument();
                },
            );
        } else {
            Alert.alert("Enviar", null, [
                { text: "Galeria", onPress: () => pickAndSendImage("gallery") },
                { text: "Câmera", onPress: () => pickAndSendImage("camera") },
                { text: "Documento", onPress: () => sendDocument() },
                { text: "Cancelar", style: "cancel" },
            ]);
        }
    };
```

- [ ] **Step 4: Botão de câmera na barra**

No JSX da barra (branch NÃO self-chat), entre `<ChatInput ... />` e o ternário Send/Record:

```jsx
                        <CameraButton onPress={() => pickAndSendImage("camera")} activeOpacity={0.7}>
                            <Feather name="camera" size={20} color="#64788a" />
                        </CameraButton>
```

- [ ] **Step 5: Bolha de arquivo no `renderItem`**

Novo branch entre o de áudio e o retorno de texto:

```jsx
        if (item.fileUrl) {
            return (
                <BubbleWrap isMine={isMine}>
                    <Bubble isMine={isMine}>
                        <TouchableOpacity
                            onPress={() => Linking.openURL(item.fileUrl).catch(() => {})}
                            activeOpacity={0.7}
                        >
                            <FileRow>
                                <Feather name="file-text" size={24} color={isMine ? "#2e5e38" : "#f55b1f"} />
                                <FileInfo>
                                    <FileName isMine={isMine} numberOfLines={1} ellipsizeMode="middle">
                                        {item.fileName || "Documento"}
                                    </FileName>
                                    {formatFileSize(item.fileSize) ? (
                                        <FileSize isMine={isMine}>{formatFileSize(item.fileSize)}</FileSize>
                                    ) : null}
                                </FileInfo>
                            </FileRow>
                        </TouchableOpacity>
                        <BubbleFooter>
                            <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                            {isMine && (
                                <ReadReceipt
                                    status={getMessageReadStatus(item, lastSeenAt, otherUserId)}
                                />
                            )}
                        </BubbleFooter>
                    </Bubble>
                </BubbleWrap>
            );
        }
```

- [ ] **Step 6: Lint + testes** — `npx eslint src/pages/PublicationChat/index.jsx` sem erros novos vs baseline (~25); `node --test tests/*.test.cjs` baseline inalterada.

- [ ] **Step 7: Commit**

```bash
git add src/pages/PublicationChat/index.jsx
git commit -m "feat: camera shortcut, 3-option attach menu and document messages in chat"
```

---

## Verificação manual

1. Cores: bolha minha verde-claro/texto escuro, recebida branca, fundo bege, checks cinza→verde, botões enviar/mic verdes.
2. Wallpaper visível mas discreto; rolagem e toques nas bolhas funcionam normalmente por cima.
3. Clipe: 3 opções no iOS (ActionSheet) e no Android (Alert). Botão câmera abre câmera direto.
4. Enviar PDF: indicador "Enviando documento...", bolha com nome+tamanho, prévia "📎 Documento" na lista de conversas e no push; tocar abre o arquivo.
5. Áudio/foto/texto continuam funcionando como antes (regressão).
