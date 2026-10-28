# PRD — Envio de Localização no Chat

**Data:** 2026-08-19
**Feature:** Mensagem de localização atual no chat (tipo `location`)
**Status:** Aprovado para desenvolvimento

---

## Contexto

O chat do app Quero Camarão já suporta texto, imagem, áudio e documento como tipos de mensagem.
Pedro solicitou adicionar o envio de localização atual do dispositivo, no estilo WhatsApp.
O app usa Expo 53, React Native, Firebase (Firestore + Storage) e distribui via EAS.
Não há lib de geolocalização instalada — precisa ser adicionada (`expo-location`).

---

## Problema

Compradores e vendedores de camarão frequentemente precisam trocar localização durante uma negociação
(ex.: ponto de entrega, localização da fazenda). Hoje só é possível digitar endereço em texto livre,
o que é impreciso e manual. Um botão de "Enviar localização" resolve isso com um toque.

---

## Objetivo

Permitir que qualquer participante de um chat ativo envie sua localização atual como mensagem,
que é renderizada com um cartão visual e, ao toque, abre o app de mapas do dispositivo no ponto exato.

---

## Escopo — O QUE ENTRA

1. **Instalação e configuração do `expo-location`**
   - `npx expo install expo-location`
   - Plugin adicionado em `app.json` → `plugins`
   - Permissão Android: `ACCESS_FINE_LOCATION` em `app.json → android.permissions`
   - Permissão iOS: `NSLocationWhenInUseUsageDescription` em `app.json → ios.infoPlist` (string: "O app precisa da sua localização para enviar no chat")
   - Uso: apenas `requestForegroundPermissionsAsync` + `getCurrentPositionAsync` — sem background location

2. **Controlador `src/controllers/Chat/sendLocation.js`**
   - Assinatura: `sendChatLocation({ chatId, publicationId, sellerId, buyerId, senderId, sellerName, buyerName, publicationTitle, publicationLocation, publicationSummary })`
   - Solicita permissão de localização
   - Se negada: retorna `{ error: true, reason: 'permission' }`
   - Se concedida: chama `getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`
   - Chama `sendChatMessage` passando `location: { lat, lng }`
   - Retorna `{ error: false }` ou `{ error: true, reason: 'location' | 'send' }`
   - Sem upload para Firebase Storage (coordenadas vão direto no doc Firestore)

3. **Schema Firestore — nova mensagem de localização**
   ```
   {
     senderId: string,
     createdAt: Timestamp,
     location: {
       lat: number,   // latitude com precisão ~6 casas decimais
       lng: number    // longitude com precisão ~6 casas decimais
     }
   }
   ```
   - `lastMessage` no doc pai do chat: `"📍 Localização"` (mesma lógica dos outros tipos)

4. **Mudanças em `sendChatMessage` (`controllers/Chat/index.js`)**
   - Novo parâmetro: `location = null` (objeto `{ lat, lng }`)
   - `lastMessage`: adicionar `else if (location) lastMessage = "📍 Localização"`
   - `msgData`: adicionar `if (location) msgData.location = location`

5. **UI — botão no attach sheet (`PublicationChat/index.jsx`)**
   - `openAttachSheet` adiciona opção "Localização" (iOS: ActionSheetIOS; Android: Alert)
   - iOS: opções → `["Cancelar", "Galeria", "Câmera", "Documento", "Localização"]`
   - Handler `sendLocation()`:
     - chama `sendChatLocation(...)`
     - Se `reason === 'permission'`: Toast "Permissão de localização negada"
     - Se `reason === 'location'`: Toast "Não foi possível obter sua localização"
     - Se `reason === 'send'`: Toast "Não foi possível enviar a localização"
     - Enquanto aguarda: `isUploading = true`, `uploadingLabel = "Obtendo localização..."`

6. **Renderização de bolha de localização (`renderBubbleBody`)**
   - Condição: `if (item.location)` — antes do fallback de texto
   - Layout: ícone `map-pin` (Feather), texto "📍 Localização", coordenadas como subtexto pequeno
   - Toque: abre app de mapas via `Linking.openURL`
     - iOS: `maps://app?ll=${lat},${lng}&q=Localização`
     - Android: `geo:${lat},${lng}?q=${lat},${lng}(Localização)`
     - Fallback universal: `https://maps.google.com/maps?q=${lat},${lng}`
   - Long press: abre `MessageActionsSheet` (padrão existente)

7. **Encaminhamento (ForwardModal)**
   - `handleForwardSelect` passa `location: msg.location || null` para `sendChatMessage`
   - Nenhuma outra mudança necessária

8. **Testes automatizados (`node --test`)**
   - `src/controllers/Chat/sendLocation.test.js`
   - Testar lógica pura: formatação do deep link URL, tratamento de permissão negada, montagem do `msgData`
   - Sem tocar Firestore real (mock de `sendChatMessage`)

---

## Escopo — O QUE NÃO ENTRA

- Localização em tempo real / live tracking
- Endereço reverso (reverse geocoding) — pode ser adicionado futuramente
- Preview de mapa estático via imagem (Google Static Maps API, OpenStreetMap) — requer API key ou infra extra
- Localização em mensagens de auto-envio
- Background location
- Seleção manual de ponto no mapa

---

## Fluxo Principal

1. Usuário toca no clipe de papel (AttachButton) no composer
2. Sheet exibe: Galeria / Câmera / Documento / **Localização**
3. Usuário toca "Localização"
4. App solicita permissão de localização (prompt nativo do SO)
   - Negada → Toast de aviso, nenhum crash, nenhuma mensagem enviada
   - Concedida → continua
5. Indicador "Obtendo localização..." aparece (mesmo `isUploading` existente)
6. GPS retorna lat/lng → `sendChatMessage` grava no Firestore
7. Indicador some; bolha de localização aparece na lista para ambos os participantes
8. Qualquer participante toca a bolha → app de mapas abre no ponto

---

## Casos de borda

| Situação | Comportamento esperado |
|---|---|
| Permissão negada pelo usuário | Toast "Permissão de localização negada", sem crash |
| GPS indisponível / timeout | Toast "Não foi possível obter sua localização", `error: true` |
| Chat encerrado (isChatClosed) | Botão de localização não aparece (mesmo padrão dos outros botões) |
| isSelfChat | Input inteiro desabilitado — sem mudança necessária |
| Mensagem encaminhada com location | `location` é passado no `handleForwardSelect` (sem re-captura GPS) |
| Toque em bolha com Linking falho | `.catch(() => {})` — silencia erro igual ao que já existe em fileUrl |

---

## Critérios de aceite

- [ ] `expo-location` instalado e configurado no `app.json` com permissões corretas para iOS e Android
- [ ] Botão "Localização" aparece no attach sheet (iOS e Android)
- [ ] Permissão negada exibe Toast com mensagem clara, sem crash
- [ ] Mensagem de localização salva no Firestore com campo `location: { lat, lng }`
- [ ] `lastMessage` do doc de chat mostra "📍 Localização"
- [ ] Bolha renderiza cartão com ícone pin + texto "Localização"
- [ ] Toque na bolha abre app de mapas no ponto correto
- [ ] Mensagem pode ser encaminhada via ForwardModal
- [ ] Testes `node --test` cobrem lógica pura do controller, todos passando

---

## Decisões tomadas (sem consulta)

| Decisão | Razão |
|---|---|
| Sem preview de mapa estático (imagem) | Requer API key ou infra extra — fora do escopo mínimo |
| Sem reverse geocoding | Adiciona latência e dependência de rede extra; endereço não é essencial para abrir o mapa |
| `location: { lat, lng }` (objeto aninhado) | Evita poluir o root do doc de mensagem com campos opcionais |
| `expo-location` (não `react-native-maps`) | Só precisa capturar coordenadas, não renderizar mapa — lib mais leve |
| `Accuracy.Balanced` | Equilíbrio entre velocidade e precisão; evita drain de bateria de `BestForNavigation` |
| Deep link universal + plataforma | Cobre iOS (maps://), Android (geo:) e fallback web |

---

## Arquivos a criar/modificar

**Novos:**
- `src/controllers/Chat/sendLocation.js` — controlador principal
- `src/controllers/Chat/sendLocation.test.js` — testes node --test

**Modificados:**
- `package.json` — adicionar `expo-location`
- `app.json` — plugin + permissões iOS/Android
- `src/controllers/Chat/index.js` — `sendChatMessage` aceita `location`
- `src/pages/PublicationChat/index.jsx` — `openAttachSheet`, `sendLocation`, `renderBubbleBody`, `handleForwardSelect`
