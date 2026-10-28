# Spec — Seletor de mapa na bolha de localização do chat

**Data:** 2026-08-22  
**Status:** Pronto para dev  
**Agente responsável (impl):** dev-frontend-mobile

---

## Contexto

Hoje, ao tocar na bolha de localização no `PublicationChat`, o app chama `Linking.openURL(mapsUrl)`
diretamente — onde `mapsUrl` é gerado por `buildLocationMapsUrl` (scheme `geo:` no Android, `maps:`
no iOS). No iOS isso abre o Apple Maps sem oferecer alternativa. O Pedro quer que o usuário possa
escolher explicitamente entre **Google Maps** e **Waze**.

---

## Escopo desta feature

1. Ao tocar em `LocationCard`, exibir um seletor com as opções **Google Maps**, **Waze** e **Cancelar**.
2. A escolha do Waze verifica se o app está instalado (`Linking.canOpenURL('waze://')`) e usa o
   scheme nativo se disponível; caso contrário abre o link web do Waze.
3. A escolha Google Maps mantém o comportamento atual (scheme nativo `geo:`/`maps:` com fallback web).
4. Extrair as novas URL builders como funções puras em `locationMapsUrl.js` e cobrir com testes.

---

## Critérios de aceite

| # | Critério | Como verificar |
|---|----------|---------------|
| AC-1 | Tocar na bolha de localização exibe um seletor com "Google Maps", "Waze" e "Cancelar" | Testar no simulador iOS e Android |
| AC-2 | Escolher "Google Maps" abre o mesmo URL que o comportamento atual (geo:/maps: + fallback web) | Inspecionar URL passado para `Linking.openURL` |
| AC-3 | Escolher "Waze" com Waze instalado abre `waze://?ll={lat},{lng}&navigate=yes` | Simulador com Waze instalado ou log de URL |
| AC-4 | Escolher "Waze" sem Waze instalado abre `https://waze.com/ul?ll={lat},{lng}&navigate=yes` | `canOpenURL` retornando false (mocked) |
| AC-5 | "Cancelar" fecha o seletor sem abrir nenhum app | Tap em Cancelar |
| AC-6 | iOS usa `ActionSheetIOS.showActionSheetWithOptions` (já importado no componente) | Inspecionar código |
| AC-7 | Android usa `Alert.alert` com botões | Inspecionar código |
| AC-8 | Funções puras de URL passam nos testes `node --test` sem nenhum dep nativa | `node --test tests/sendLocationMessage.test.cjs` |
| AC-9 | Nenhuma escrita no Firestore ocorre ao tocar na localização | Não há mudança no fluxo de dados |

---

## Implementação passo a passo

### Passo 1 — Estender `src/utils/locationMapsUrl.js`

Adicionar as seguintes funções puras (sem deps nativas):

```js
// URL nativa do Waze (scheme deep link)
const buildWazeNativeUrl = (lat, lng) =>
    `waze://?ll=${lat},${lng}&navigate=yes`;

// Fallback web do Waze (abre App Store ou web no browser)
const buildWazeWebUrl = (lat, lng) =>
    `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

// Fallback web do Google Maps (já usado como catch inline no componente)
const buildGoogleMapsWebUrl = (lat, lng) =>
    `https://maps.google.com/maps?q=${lat},${lng}`;

// Resolve qual URL usar pro Waze: nativa se disponível, web caso contrário
const resolveWazeUrl = (lat, lng, wazeAvailable) =>
    wazeAvailable ? buildWazeNativeUrl(lat, lng) : buildWazeWebUrl(lat, lng);
```

Exportar todos no `module.exports`.

### Passo 2 — Adicionar testes ao `tests/sendLocationMessage.test.cjs`

Inline-mirror das novas funções (sem `require` nativo) e testar:

- `buildWazeNativeUrl` → começa com `waze://`, inclui lat/lng
- `buildWazeWebUrl` → começa com `https://waze.com/ul`, inclui lat/lng
- `buildGoogleMapsWebUrl` → começa com `https://maps.google.com/maps`, inclui lat/lng
- `resolveWazeUrl(lat, lng, true)` → retorna URL nativa
- `resolveWazeUrl(lat, lng, false)` → retorna URL web
- `canOpenURL` mock: simular waze disponível vs não (via boolean, sem Linking real)

Rodar `node --test tests/sendLocationMessage.test.cjs` — todos passando antes de commitar.

### Passo 3 — Implementar `showMapPicker` em `PublicationChat/index.jsx`

Criar função assíncrona dentro do componente (ou inline na prop `onPress`):

```js
const showMapPicker = async (lat, lng) => {
    const googleMapsUrl = buildLocationMapsUrl(lat, lng);  // existente
    const googleMapsFallback = `https://maps.google.com/maps?q=${lat},${lng}`;
    const wazeAvailable = await Linking.canOpenURL('waze://').catch(() => false);
    const wazeUrl = resolveWazeUrl(lat, lng, wazeAvailable);  // nova função

    const openGoogleMaps = () =>
        Linking.openURL(googleMapsUrl).catch(() => Linking.openURL(googleMapsFallback).catch(() => {}));

    const openWaze = () =>
        Linking.openURL(wazeUrl).catch(() => {});

    if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
            { options: ['Cancelar', 'Google Maps', 'Waze'], cancelButtonIndex: 0 },
            (index) => { if (index === 1) openGoogleMaps(); if (index === 2) openWaze(); }
        );
    } else {
        Alert.alert('Abrir localização', null, [
            { text: 'Google Maps', onPress: openGoogleMaps },
            { text: 'Waze', onPress: openWaze },
            { text: 'Cancelar', style: 'cancel' },
        ]);
    }
};
```

### Passo 4 — Substituir o `onPress` da `LocationCard`

Linha 1205 atual:
```js
onPress={() => Linking.openURL(mapsUrl).catch(() =>
    Linking.openURL(`https://maps.google.com/maps?q=${item.locationLat},${item.locationLng}`).catch(() => {})
)}
```

Substituir por:
```js
onPress={() => showMapPicker(item.locationLat, item.locationLng)}
```

### Passo 5 — Importar `resolveWazeUrl` no componente

Adicionar `resolveWazeUrl` (e opcionalmente `buildGoogleMapsWebUrl`) ao destructuring do import já
existente na linha 30:
```js
import { buildLocationMapsUrl, isValidCoords, resolveWazeUrl } from "../../utils/locationMapsUrl";
```

---

## Arquivos a modificar

| Arquivo | O que muda |
|---------|-----------|
| `src/utils/locationMapsUrl.js` | Adicionar `buildWazeNativeUrl`, `buildWazeWebUrl`, `buildGoogleMapsWebUrl`, `resolveWazeUrl` e exportar |
| `src/pages/PublicationChat/index.jsx` | Adicionar `showMapPicker`, substituir `onPress` da `LocationCard` (~linha 1205), importar `resolveWazeUrl` |
| `tests/sendLocationMessage.test.cjs` | Adicionar testes das novas funções puras |

---

## Arquivos a NÃO tocar

- Qualquer função/coleção do Firestore (app em produção)
- Fluxo de envio de localização (`sendCurrentLocation`, `getChatLocation`)
- Outros componentes — escopo restrito ao tap da bolha

---

## Suposições e decisões (sem aprovação prévia — conservadoras)

- Usando `ActionSheetIOS` que já está importado no componente (linha 2 de `PublicationChat/index.jsx`)
  em vez de instalar `@expo/react-native-action-sheet` — sem nova dependência.
- Usando `Alert` no Android (já importado) em vez de bibliotecas externas.
- Waze web fallback abre `waze.com/ul` que redireciona para App Store/Play Store ou web — comportamento
  suficiente para quem não tem o app.
- Não mostrando "Apple Maps" como terceira opção — Pedro pediu explicitamente Google Maps e Waze.
- Cancelar no Android é o último botão com `style: 'cancel'` — padrão Material.
