# Fase 2 — Visual do chat estilo WhatsApp + envio de documentos — Design Spec

## Goal
Redesenhar a aparência do `PublicationChat` (bolhas verde-claro/branco, fundo bege com papel de parede SVG temático em baixa opacidade, detalhes em verde, laranja só em pontos de identidade) e completar a barra de mensagem (botão de câmera dedicado; clipe com Galeria/Câmera/Documento; envio de PDF/Word/Excel/TXT com bolha de arquivo).

Itens 5 e 6 da especificação geral do usuário. Base: chat atual (bolhas laranja/branco, fundo `#f4f8fb`, clipe com Galeria/Câmera, mic que já vira enviar ao digitar).

---

## A. Cores

Todas as mudanças em `src/pages/PublicationChat/styles.js` (+ os hexes inline de `ReadReceipt` em `index.jsx`):

| Elemento | Hoje | Novo |
|---|---|---|
| `Container` (fundo) | `#f4f8fb` | `#F1ECE4` (bege claro) |
| `Bubble` isMine | `#f55b1f` | `#DCF4D4` (verde-claro) |
| `BubbleText` isMine | `#fff` | `#1f3d2b` |
| `BubbleTime` isMine | `rgba(255,255,255,0.7)` | `#6b8a70` |
| `ReadReceipt` sent (isMine) | `rgba(255,255,255,0.7)` | `#8fa3b2` (cinza) |
| `ReadReceipt` read (isMine) | `#ffd9c2` | `#4BB543` (verde do app) |
| `SendButton` | `#f55b1f` | `#4BB543` |
| `RecordButton` (normal) | `#f55b1f` | `#4BB543` (gravando `#e53935` e travado `#1f6feb` mantidos) |
| `AudioPlayButton` fundo (isMine) | `rgba(255,255,255,0.2)` | `rgba(0,0,0,0.06)` |
| Ícone play/pause (isMine) | `#fff` | `#2e5e38` |
| `AudioWave` isMine | `rgba(255,255,255,0.5)` | `#a8cbae` |
| `AudioDuration` isMine | `rgba(255,255,255,0.85)` | `#6b8a70` |

Inalterados (pontos de identidade laranja): `Avatar` do header (`#f55b1f`), ícone play em bolha recebida (`#f55b1f`), `RecordingIndicator` (`#f55b1f`/vermelho), header branco, `ChatInput` cinza-azulado.

Bolha recebida: continua `#fff` com texto `#36536e`. Sombra/bordas das bolhas inalteradas.

## B. Papel de parede `ChatWallpaper`

Novo componente `src/pages/PublicationChat/ChatWallpaper.jsx` usando `react-native-svg` (já instalado):

- `<Svg>` posicionado `position: absolute; top/left/right/bottom: 0` atrás da `FlatList` (a `FlatList` e o restante ficam por cima; o fundo bege vem do `Container`).
- `<Defs><Pattern id="qc" width={120} height={120} patternUnits="userSpaceOnUse">` com 4 desenhos de linha (`stroke` `#8a7a5f`, `strokeWidth` 1.5, `fill="none"`, `opacity` 0.06), um por quadrante do tile:
  - camarão: corpo em arco (`Path` com curva C) + antenas (2 linhas curtas);
  - ondas: 3 `Path` de arcos horizontais empilhados;
  - viveiro: retângulo arredondado com linha d'água ondulada interna;
  - balança: triângulo de suporte + travessão + 2 pratos (arcos).
- `<Rect width="100%" height="100%" fill="url(#qc)" />`.
- Componente puro, sem props, sem estado. Coordenadas exatas dos paths ficam a critério da implementação (validadas visualmente no simulador) — o contrato é: 4 motivos distintos, linha fina, opacidade ≤ 0.08, tile 120x120.
- Uso em `index.jsx`: primeiro filho do `KeyboardAvoidingView` (ou irmão anterior dele dentro do `Container`, posicionado absoluto — implementação escolhe o que não interferir no layout/toques; `pointerEvents="none"` obrigatório).

## C. Barra de mensagem

`src/pages/PublicationChat/index.jsx` + `styles.js`:

- Layout: `[AttachButton 📎] [ChatInput] [CameraButton 📷] [SendButton ➤ | RecordButton 🎤]`.
- Novo `CameraButton` (styled.TouchableOpacity 36x42 como o `AttachButton`), ícone `Feather camera` `#64788a`, `onPress={() => pickAndSendImage("camera")}`. Visível sempre (some junto com a barra no self-chat, como hoje).
- Mic→enviar ao digitar: já existe, inalterado.
- `openAttachSheet` reformulado:
  - iOS: `ActionSheetIOS` com `["Cancelar", "Galeria", "Câmera", "Documento"]`.
  - Android: `Alert.alert("Enviar", null, [{Galeria}, {Câmera}, {Documento}, {Cancelar, style: "cancel"}])` (hoje o Android vai direto pra galeria, sem menu).

## D. Envio de documento

**Picker:** `expo-document-picker` (~13.1, já instalado):
```js
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
// result.canceled / result.assets[0] = { uri, name, size, mimeType }
```

**Upload:** novo `src/controllers/Chat/uploadFile.js`, espelho do `uploadImage.js`:
- caminho `chats/${chatId}/files/${Date.now()}_${sanitizedName}` (sanitizar: remover caracteres fora de `[A-Za-z0-9._-]`);
- `uploadBytes` com `contentType` do asset (fallback `application/octet-stream`);
- retorna `{ error, url }`; try/catch + Sentry.

**Mensagem:** `sendChatMessage` ganha campos opcionais `fileUrl`, `fileName`, `fileSize` (mesmo padrão de `imageUrl`/`audioUrl`):
- `lastMessage` vira `"📎 Documento"` quando `fileUrl` presente (precedência: áudio > imagem > arquivo > texto, mantendo a ordem do ternário existente com arquivo adicionado);
- `msgData` grava `fileUrl`, `fileName`, `fileSize` quando presentes.

**Fluxo na tela (`sendDocument`)**: picker → se cancelado, retorna → `setIsUploading(true)` com label `"Enviando documento..."` → `uploadChatFile` → `sendChatMessage({ fileUrl, fileName, fileSize, ... })` → limpa estado. Guards de ids iguais aos de `pickAndSendImage`.

**Bolha de arquivo** (novo branch no `renderItem`, antes do branch de texto):
- `FileBubble` (styled): linha com ícone `Feather file-text` (24, `#2e5e38` na minha / `#f55b1f` na recebida), `FileName` (negrito, 1 linha, ellipsize middle) e `FileSize` abaixo (formatado);
- `BubbleFooter` com horário + `ReadReceipt` como nos demais;
- `onPress` da bolha: `Linking.openURL(item.fileUrl)` (abre no navegador/visualizador do sistema; URL do Firebase Storage é https com token). Sem download local nesta fase.

**Util puro** `src/utils/formatFileSize.js` (CJS + teste `tests/formatFileSize.test.cjs`):
- `formatFileSize(bytes)` → `""` para inválido/<= 0; bytes < 1024 → `"532 B"` (inteiro); KB e MB sempre com 1 casa decimal e vírgula → `"12,4 KB"`, `"1,8 MB"`. Limite KB→MB em 1024 KB.

## Error handling
- Picker cancelado → no-op silencioso.
- Upload falhou → limpa o indicador de envio e reporta ao Sentry via controller, sem Toast (consistente com o comportamento atual de foto/áudio).
- `Linking.openURL` falhou (sem app pra abrir) → try/catch com no-op (URL https sempre abre navegador na prática).
- Mensagens antigas sem `fileUrl` não são afetadas (branch novo só ativa com o campo).

## Testing
- `tests/formatFileSize.test.cjs` (novo, node --test).
- Suíte existente inalterada (133/136 + novos).
- Manual: cores das bolhas/checks/botões; papel de parede visível mas discreto; toques na lista não bloqueados pelo wallpaper; clipe com 3 opções nos 2 SOs; botão câmera direto; enviar PDF e abrir do outro lado; prévia "📎 Documento" na lista de conversas e no push.
