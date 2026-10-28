# Gestão — Feature: Envio de localização no chat

Data: 2026-08-19
Fase: gestão
Automação: quero-camarao-1787181538297
Spec produto base: `docs/specs/2026-08-19-chat-location.md`

---

## Resumo executivo

Adicionar mensagem de localização ao chat. O app já suporta texto, imagem, áudio e documento;
localização é o 5º tipo, seguindo exatamente o mesmo padrão arquitetural dos outros uploads.
Não há upload para Storage — coordenadas vão direto no doc Firestore como objeto aninhado.
Não há lib de geolocalização instalada; precisa instalar `expo-location` e registrar permissões
no `app.json` antes de qualquer código.

---

## Contexto de código — pontos críticos

### `src/controllers/Chat/index.js` — `sendChatMessage`

A função (linha 70) tem dois blocos `if/else if` encadeados que determinam (a) o `lastMessage`
e (b) o que vai no `msgData`. A localização entra no final dessas chains, como 4º tipo:

```
Linha 98: if (audioUrl) lastMessage = "🎵 Áudio";
Linha 99: else if (imageUrl) lastMessage = "📷 Foto";
Linha 100: else if (fileUrl) lastMessage = "📎 Documento";
           else if (location) lastMessage = "📍 Localização";   ← NOVO

Linha 134: if (audioUrl) { msgData.audioUrl... }
Linha 138: else if (imageUrl) { msgData.imageUrl... }
Linha 139: else if (fileUrl) { msgData.fileUrl... }
           else if (location) { msgData.location = location; }  ← NOVO
Linha 143: else { msgData.text = trimmed; }                     ← sem mudança
```

`location` é o último parâmetro opcional adicionado à assinatura da função (default `null`).

### `src/pages/PublicationChat/index.jsx` — `openAttachSheet`

Função na linha 608. iOS usa `ActionSheetIOS` com array de options; Android usa `Alert.alert`
com array de buttons. O comentário na linha 619 diz "Android limita Alert a 3 botões" — isso
é uma convenção adotada voluntariamente, não uma limitação do React Native. Com 4 opções o
Android renderiza uma lista de botões empilhados (ainda usável). Decisão: adicionar
"Localização" em ambas as plataformas.

**iOS** — adicionar na posição 4 do array (após "Documento"):
```js
options: ["Cancelar", "Galeria", "Câmera", "Documento", "Localização"]
// handler: if (idx === 4) sendLocation();
```

**Android** — adicionar 4º button no array:
```js
{ text: "Localização", onPress: () => sendLocation() }
```

### `src/pages/PublicationChat/index.jsx` — `handleForwardSelect` (linha 882)

Adicionar `location: msg.location || null` junto com os outros campos opcionais já passados.

### `src/pages/PublicationChat/index.jsx` — `renderBubbleBody` (linha 956)

A função verifica `item.imageUrl`, `item.audioUrl`, `item.fileUrl` sequencialmente. Adicionar
`if (item.location)` ANTES do bloco de texto (que é o fallback quando nenhum outro tipo existe).

### `app.json` — permissões iOS

O `ios.infoPlist` (linha 22) já tem `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
etc. Adicionar:
```json
"NSLocationWhenInUseUsageDescription": "O Quero Camarão precisa da sua localização para enviar no chat."
```

`LSApplicationQueriesSchemes` (linha 30, array vazio) precisa receber os schemes de mapas para
que `Linking.canOpenURL` e `Linking.openURL` funcionem em iOS:
```json
"LSApplicationQueriesSchemes": ["maps", "comgooglemaps"]
```

### `app.json` — permissões Android

O array `android.permissions` (linha 41) já tem duplicatas — adicionar apenas:
```
"android.permission.ACCESS_FINE_LOCATION"
```

### `app.json` — plugin

Adicionar no array `plugins` (linha 82), depois dos plugins existentes, antes de "expo-font":
```json
["expo-location", {}]
```

---

## Passos de implementação (ordem obrigatória)

### Passo 1 — Instalar `expo-location`

```bash
npx expo install expo-location
```

Confirmar que `package.json` e `package-lock.json` foram atualizados.

### Passo 2 — Configurar `app.json`

Três mudanças em `app.json`:

1. `ios.infoPlist`: adicionar `NSLocationWhenInUseUsageDescription` e os dois schemes em
   `LSApplicationQueriesSchemes`.
2. `android.permissions`: adicionar `android.permission.ACCESS_FINE_LOCATION`.
3. `plugins`: adicionar `["expo-location", {}]`.

### Passo 3 — Criar `src/controllers/Chat/sendLocation.js`

```js
import * as Location from "expo-location";
import * as Sentry from "@sentry/react-native";
import { sendChatMessage } from "./index";

export const sendChatLocation = async ({
    chatId,      // não usado diretamente — passado via sendChatMessage
    publicationId,
    sellerId,
    buyerId,
    senderId,
    sellerName,
    buyerName,
    publicationTitle,
    publicationLocation,
    publicationSummary,
}) => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return { error: true, reason: "permission" };

        const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
        };

        const ok = await sendChatMessage({
            publicationId,
            sellerId,
            buyerId,
            senderId,
            location,
            sellerName,
            buyerName,
            publicationTitle,
            publicationLocation,
            publicationSummary,
        });

        return ok ? { error: false } : { error: true, reason: "send" };
    } catch (err) {
        Sentry.captureException(err);
        return { error: true, reason: "location" };
    }
};

export const buildLocationUrl = (lat, lng, platform) => {
    if (platform === "ios")
        return `maps://app?ll=${lat},${lng}&q=Localiza%C3%A7%C3%A3o`;
    if (platform === "android")
        return `geo:${lat},${lng}?q=${lat},${lng}(Localiza%C3%A7%C3%A3o)`;
    return `https://maps.google.com/maps?q=${lat},${lng}`;
};
```

> `buildLocationUrl` é exportado separado para poder ser testado em `node --test` sem mock de Linking.

### Passo 4 — Modificar `src/controllers/Chat/index.js`

Dois blocos a editar dentro de `sendChatMessage`:

**4a — parâmetro da função (linha 70):**
Adicionar `location = null` ao destructuring, após `isAutoMessage`.

**4b — bloco lastMessage (após linha 100):**
```js
else if (location) lastMessage = "📍 Localização";
```

**4c — bloco msgData (após linha 141, antes do `else { msgData.text ... }`):**
```js
else if (location) { msgData.location = location; }
```

### Passo 5 — Modificar `src/pages/PublicationChat/index.jsx`

Cinco pontos de edição:

**5a — import:**
```js
import { sendChatLocation, buildLocationUrl } from "../../controllers/Chat/sendLocation";
```

**5b — função `sendLocation` (nova, criar próxima de `sendDocument`):**
```js
const sendLocation = async () => {
    if (!myId || !buyerId || !resolvedChatId) return;
    setIsUploading(true);
    setUploadingLabel("Obtendo localização...");
    const result = await sendChatLocation({
        publicationId: publication.id,
        sellerId,
        buyerId,
        senderId: myId,
        sellerName: resolvedSellerName || "",
        buyerName: resolvedBuyerName || buyerName || "",
        publicationTitle: publication?.title || publicationTitle || "",
        publicationLocation: publication?.location || publicationLocation || "",
        publicationSummary: publication?.summary || publicationSummary || "",
    });
    setIsUploading(false);
    setUploadingLabel("");
    if (result.error) {
        if (result.reason === "permission")
            Toast.show({ type: "error", text1: "Permissão de localização negada" });
        else if (result.reason === "location")
            Toast.show({ type: "error", text1: "Não foi possível obter sua localização" });
        else
            Toast.show({ type: "error", text1: "Não foi possível enviar a localização" });
    }
};
```

**5c — `openAttachSheet` (linha 608):**

iOS: mudar options para `["Cancelar", "Galeria", "Câmera", "Documento", "Localização"]`
e adicionar `if (idx === 4) sendLocation();`

Android: adicionar `{ text: "Localização", onPress: () => sendLocation() }` ao array de buttons.

**5d — `handleForwardSelect` (linha 886):** adicionar ao objeto passado para `sendChatMessage`:
```js
location: msg.location || null,
```

**5e — `renderBubbleBody` (linha 956):** adicionar antes do bloco de `item.fileUrl` ou após,
mas ANTES do fallback de texto. Sugestão após `item.fileUrl`:
```jsx
if (item.location) {
    const { lat, lng } = item.location;
    const url = buildLocationUrl(lat, lng, Platform.OS);
    return (
        <TouchableOpacity
            onPress={() => Linking.openURL(url).catch(() => {})}
            onLongPress={openActions}
            activeOpacity={0.8}
        >
            <LocationBubble>
                <Feather name="map-pin" size={16} color="#F05829" />
                <LocationText>Localização</LocationText>
                <LocationCoords>{`${lat.toFixed(5)}, ${lng.toFixed(5)}`}</LocationCoords>
            </LocationBubble>
        </TouchableOpacity>
    );
}
```

Os styled-components `LocationBubble`, `LocationText`, `LocationCoords` ficam em
`src/pages/PublicationChat/styles.js`. Visual mínimo: fundo levemente destacado,
ícone pin laranja (#F05829), texto principal bold, coordenadas menores e em cinza.

### Passo 6 — Criar `src/controllers/Chat/sendLocation.test.js`

Cobrir com `node --test` (sem deps externas, sem Firestore real):

| Test | O que verifica |
|------|----------------|
| `buildLocationUrl iOS` | retorna string começando com `maps://app` |
| `buildLocationUrl android` | retorna string começando com `geo:` |
| `buildLocationUrl fallback` | retorna string com `maps.google.com` |
| `sendChatLocation – permission denied` | mock `requestForegroundPermissionsAsync` retornando `denied`, função retorna `{ error: true, reason: 'permission' }` |
| `sendChatLocation – GPS error` | mock `getCurrentPositionAsync` lançando exceção, retorna `{ error: true, reason: 'location' }` |
| `sendChatLocation – send failure` | mock `sendChatMessage` retornando `false`, retorna `{ error: true, reason: 'send' }` |
| `sendChatLocation – success` | mock completo, retorna `{ error: false }` e chama `sendChatMessage` com `location: { lat, lng }` |

---

## Critérios de aceite (verificáveis)

| # | Cenário | Resultado esperado |
|---|---------|-------------------|
| AC-1 | `npx expo install expo-location` executado | `package.json` tem `expo-location`; sem peer-dep conflict |
| AC-2 | `app.json` revisado | Plugin `expo-location` presente, `NSLocationWhenInUseUsageDescription` em `ios.infoPlist`, `ACCESS_FINE_LOCATION` em `android.permissions`, `maps` em `LSApplicationQueriesSchemes` |
| AC-3 | Usuário toca no clipe → sheet exibe | Opção "Localização" aparece (iOS: 5ª opção; Android: 4º botão) |
| AC-4 | Chat encerrado (`isChatClosed === true`) | Input inteiro desabilitado — nenhuma mudança; botão de localização inacessível junto com os demais |
| AC-5 | Usuário nega permissão de localização (prompt nativo) | Toast "Permissão de localização negada"; nenhuma mensagem enviada; app não crasha |
| AC-6 | GPS indisponível / exceção em `getCurrentPositionAsync` | Toast "Não foi possível obter sua localização"; nenhuma mensagem enviada |
| AC-7 | Fluxo feliz: permissão concedida, GPS retorna coordenadas | `isUploading` exibe "Obtendo localização..." durante espera; desaparece após conclusão |
| AC-8 | Mensagem salva no Firestore | Doc em `chats/{id}/messages` tem `{ senderId, createdAt, location: { lat, lng } }` — sem campos `text`, `audioUrl`, `imageUrl`, `fileUrl` |
| AC-9 | `lastMessage` do doc pai do chat | Exibe "📍 Localização" (visível na lista de chats) |
| AC-10 | Bolha de localização renderizada | Exibe ícone pin + texto "Localização" + coordenadas em subtexto |
| AC-11 | Toque na bolha — iOS | Abre app Mapas nativo (ou Google Maps) no ponto; sem crash se Linking falhar |
| AC-12 | Toque na bolha — Android | Abre app de mapas via `geo:` intent; fallback para Google Maps web |
| AC-13 | Long press na bolha | Abre `MessageActionsSheet` (igual aos outros tipos de mensagem) |
| AC-14 | Encaminhar mensagem de localização via ForwardModal | Mensagem de localização recriada no chat destino com as coordenadas originais; sem re-captura GPS |
| AC-15 | `node --test src/controllers/Chat/sendLocation.test.js` | Todos os 7 testes passam; zero toque no Firestore real |

---

## Arquivos a criar / modificar

**Novos:**
- `src/controllers/Chat/sendLocation.js`
- `src/controllers/Chat/sendLocation.test.js`

**Modificados:**
- `package.json` — expo-location (via `npx expo install`)
- `package-lock.json` — atualizado pelo install
- `app.json` — plugin + permissões iOS + permissões Android
- `src/controllers/Chat/index.js` — `sendChatMessage` aceita `location`
- `src/pages/PublicationChat/index.jsx` — attach sheet, handler, bubble, forward
- `src/pages/PublicationChat/styles.js` — `LocationBubble`, `LocationText`, `LocationCoords`

**Não tocar:**
- Firestore real durante desenvolvimento (testes usam mock)
- Cloud Functions (notificações já funcionam pelo listener `onChatMessageCreated`)
- `firestore.rules` (já permitem escrita em `messages` por participantes do chat)

---

## Decisões tomadas (sem consulta a Pedro)

| Decisão | Razão |
|---------|-------|
| Sem preview de mapa estático | Requer API key externa — fora do escopo mínimo; PRD já documenta |
| `LSApplicationQueriesSchemes` com `maps` e `comgooglemaps` | iOS bloqueia `Linking.openURL` sem declaração explícita dos schemes; Google Maps como fallback |
| Android Alert com 4 botões | O limite de 3 era convenção adotada, não limitação técnica do React Native; 4º botão renderiza em lista — aceitável |
| `buildLocationUrl` exportado separado | Permite teste puro sem mock de `Linking` ou `Platform` |
| Coordenadas truncadas a 5 casas decimais na UI | ~1 metro de precisão — suficiente para exibição; valor completo salvo no Firestore |
