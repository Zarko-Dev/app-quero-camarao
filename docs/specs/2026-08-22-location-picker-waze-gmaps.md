# PRD — Seletor de app ao abrir localização no chat

**Data:** 2026-08-22
**Feature:** Escolha explícita entre Google Maps e Waze ao tocar na bolha de localização
**Status:** Aprovado para desenvolvimento

---

## Contexto

A feature de envio de localização no chat foi entregue e está em produção (ver `2026-08-19-chat-location.md`). Hoje, ao tocar na bolha (`LocationCard`), o app chama `Linking.openURL` diretamente com a URL de `buildLocationMapsUrl`: esquema `maps:` no iOS (abre Apple Maps sem opção) e `geo:` no Android (pode ou não mostrar chooser nativo, não é garantido). Pedro quer que o usuário escolha explicitamente entre Google Maps e Waze, independente do SO.

---

## Problema

No iOS, o Apple Maps é aberto sem nenhum seletor. No Android o comportamento varia por dispositivo. Waze nunca é oferecido. Usuários de campo (compradores e vendedores de camarão) frequentemente preferem Waze por conteúdo de trânsito — sem a opção explícita, eles precisam sair do app e abrir o Waze manualmente para colar as coordenadas.

---

## Objetivo

Ao tocar na bolha de localização no chat, exibir um seletor explícito com "Abrir no Google Maps" e "Abrir no Waze", em vez de abrir o app de mapas padrão do sistema diretamente.

---

## Escopo — O QUE ENTRA

### 1. Seletor de app (sem nova lib)

O `PublicationChat/index.jsx` já importa `ActionSheetIOS`, `Alert` e `Platform` do React Native.

- **iOS:** `ActionSheetIOS.showActionSheetWithOptions` com opções `["Cancelar", "Abrir no Google Maps", "Abrir no Waze"]`
- **Android/fallback:** `Alert.alert("Abrir localização", null, [{text: "Google Maps", ...}, {text: "Waze", ...}, {text: "Cancelar", style: "cancel"}])`

### 2. Novos construtores de URL em `src/utils/locationMapsUrl.js`

Duas novas funções exportadas, sem alterar a assinatura de `buildLocationMapsUrl`:

```js
// Waze nativo — verificar com Linking.canOpenURL antes de usar
buildWazeAppUrl(lat, lng)
// => 'waze://?ll={lat},{lng}&navigate=yes'

// Waze web — fallback se app não instalado
buildWazeWebUrl(lat, lng)
// => 'https://waze.com/ul?ll={lat},{lng}&navigate=yes'

// Google Maps web — fallback universal (já existe implicitamente no .catch)
buildGoogleMapsWebUrl(lat, lng)
// => 'https://maps.google.com/maps?q={lat},{lng}'
```

`buildLocationMapsUrl` continua sem alteração (usada para Google Maps nativo — `geo:` no Android, `maps:` no iOS).

### 3. Lógica de abertura (handler `openLocationPicker`)

Extrair de `PublicationChat/index.jsx` uma função que recebe `lat, lng` e orquestra:

```
openLocationPicker(lat, lng):
  → exibe seletor (ActionSheetIOS ou Alert por Platform)
  → "Google Maps": Linking.openURL(buildLocationMapsUrl(lat, lng)).catch(
        () => Linking.openURL(buildGoogleMapsWebUrl(lat, lng)).catch(() => {})
    )
  → "Waze": Linking.canOpenURL(buildWazeAppUrl(lat, lng))
        .then(canOpen => Linking.openURL(
            canOpen ? buildWazeAppUrl(lat, lng) : buildWazeWebUrl(lat, lng)
        ))
        .catch(() => Linking.openURL(buildWazeWebUrl(lat, lng)).catch(() => {}))
```

Essa função **não é exportada como util pura** (depende de `ActionSheetIOS`, `Alert`, `Platform`, `Linking`) — fica dentro do componente, como já é o padrão dos handlers `openAttachSheet`, `openActions` etc.

### 4. Testes em `tests/sendLocationMessage.test.cjs`

Adicionar testes para as novas funções puras (sem native deps):

- `buildWazeAppUrl` — formato e presença de lat/lng
- `buildWazeWebUrl` — URL web correta
- `buildGoogleMapsWebUrl` — URL web correta
- `buildLocationMapsUrl` — regressão: comportamento existente inalterado

A lógica de `canOpenURL` e do seletor (`ActionSheetIOS`/`Alert`) **não é testável com `node --test`** (native), portanto não entra em testes — segue o mesmo padrão dos testes existentes que mocam nativos via mirror inline.

---

## Escopo — O QUE NÃO ENTRA

- Apple Maps como terceira opção — não foi pedido; adiciona complexidade sem demanda
- Persistir a escolha do usuário (última app escolhida) — sem demanda
- Qualquer outro app de navegação (HERE, Moovit etc.)
- Tela de preview de mapa antes de abrir
- Checar se Google Maps está instalado com `canOpenURL` — o `geo:`/`maps:` scheme sempre tem fallback web; só o Waze precisa de check pois não tem scheme universal

---

## Fluxo principal

1. Usuário toca na bolha `LocationCard` no chat
2. Seletor aparece (ActionSheet no iOS, Alert no Android):
   - "Abrir no Google Maps"
   - "Abrir no Waze"
   - "Cancelar"
3. Usuário escolhe "Google Maps" → abre com esquema nativo (`geo:` / `maps:`) com fallback web
4. Usuário escolhe "Waze" → `canOpenURL(waze://)` para verificar instalação → abre esquema nativo se instalado, URL web se não instalado

---

## Casos de borda

| Situação | Comportamento esperado |
|---|---|
| Waze não instalado | Abre `https://waze.com/ul?...` (web ou App Store, dependendo do SO) |
| `Linking.openURL` falha no Google Maps nativo | Cai para `https://maps.google.com/maps?q=` (comportamento já existente) |
| `Linking.canOpenURL` rejeita (raro, permissão de `LSApplicationQueriesSchemes` ausente) | `.catch` abre a URL web do Waze |
| Usuário toca "Cancelar" | Nada acontece, sheet fecha |
| `locationLat`/`locationLng` com coordenadas inválidas | `isValidCoords` já bloqueia antes de salvar — não pode chegar aqui com coord inválida |

---

## Critérios de aceite

- [ ] Tocar na bolha de localização exibe seletor com "Abrir no Google Maps", "Abrir no Waze" e "Cancelar"
- [ ] iOS usa ActionSheetIOS (nativo, sem lib extra)
- [ ] Android usa Alert com botões (nativo, sem lib extra)
- [ ] "Google Maps" abre com esquema nativo + fallback web (comportamento idêntico ao atual, só deslocado para trás do seletor)
- [ ] "Waze" abre app se instalado, URL web se não instalado
- [ ] "Cancelar" fecha sem ação
- [ ] Testes `node --test` cobrem as novas funções URL em `locationMapsUrl.js`, todos passando
- [ ] `buildLocationMapsUrl` e `isValidCoords` mantêm comportamento atual (regressão nos testes existentes)
- [ ] Nenhuma nova dependência no `package.json`

---

## Decisões tomadas (sem consulta)

| Decisão | Razão |
|---|---|
| Sem nova lib de ActionSheet | `ActionSheetIOS` + `Alert` já estão importados no arquivo; adicionar lib seria over-engineering |
| `canOpenURL` só para Waze | `geo:`/`maps:` sempre tem fallback web garantido; Waze não tem |
| Fallback web do Waze abre navegador/App Store | Comportamento padrão do OS ao abrir URL http quando app não instalado — não requer lógica extra |
| Apple Maps não é uma opção | Não foi pedido e aumentaria escopo |
| Funções URL permanecem em `locationMapsUrl.js` | Seguindo padrão do projeto — utilitários de URL de localização no mesmo arquivo |
| Handler do seletor dentro do componente, não exportado como util | Depende de `ActionSheetIOS`, `Alert`, `Platform`, `Linking` — não é pura, não pertence a `src/utils/` |

---

## Arquivos a modificar

**Modificados:**
- `src/utils/locationMapsUrl.js` — adicionar `buildWazeAppUrl`, `buildWazeWebUrl`, `buildGoogleMapsWebUrl`
- `src/pages/PublicationChat/index.jsx` — substituir `onPress` do `LocationCard` por `openLocationPicker(item.locationLat, item.locationLng)`
- `tests/sendLocationMessage.test.cjs` — testes das novas funções URL

**Não criados:** nenhum arquivo novo necessário
