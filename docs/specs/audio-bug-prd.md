# Bug Report & Análise — Áudio do Chat Não Enviado

**Data:** 2026-08-16  
**Fase:** Produto (para dev + TDD)  
**Urgência:** Alta — feature em produção quebrada em App Store/Play Store

---

## Problema

Usuários do Quero Camarão relatam que mensagens de áudio no chat não são enviadas. O comportamento observado: o indicador "Enviando áudio..." aparece e desaparece, mas nenhum áudio chega ao destinatário. Nenhuma mensagem de erro é exibida ao usuário.

---

## Contexto técnico

### Fluxo de envio de áudio (código atual)

1. `startRecording()` (`PublicationChat/index.jsx:597`) — pede permissão, seta modo de gravação, cria `Audio.Recording`
2. `stopAndSendRecording()` (`:629`) — para a gravação, pega URI local, faz upload e envia a mensagem
3. `uploadChatAudio(chatId, localUri)` (`controllers/Chat/uploadAudio.js`) — `fetch(localUri)` → blob → `uploadBytes` no Firebase Storage → retorna URL pública
4. `sendChatMessage({ audioUrl, audioDuration, ... })` (`controllers/Chat/index.js:69`) — cria/atualiza doc de chat e grava doc de mensagem na subcoleção `messages`

### Arquivos relevantes

- `src/pages/PublicationChat/index.jsx` — tela de chat (linhas 597–671: gravação/envio)
- `src/controllers/Chat/uploadAudio.js` — upload para Firebase Storage
- `src/controllers/Chat/index.js` — `sendChatMessage` (linhas 69–159)
- `firestore.rules` — regras de acesso a `chats/{chatId}/messages/{messageId}`
- `storage.rules` — regras de acesso a `chats/{chatId}/{allPaths=**}`

---

## Hipóteses ordenadas por probabilidade

### H1 — Falha silenciosa sem nenhum feedback ao usuário (certeza — bug em si)

`stopAndSendRecording` tem múltiplos pontos de falha silenciosa:

a) **Guard de IDs nulo retorna sem Toast** (linha 643):
```js
if (!uri || !myId || !buyerId || !resolvedChatId) return; // sem Toast
```
Se `myId` não carregou do AsyncStorage ou `resolvedChatId` é null, o áudio é descartado em silêncio.

b) **Upload falha e nada é mostrado ao usuário** (linha 646–648):
```js
const { error, url } = await uploadChatAudio(resolvedChatId, uri);
// ...
if (!error && url) { /* envia */ }
// sem else: se error=true, o spinner some e nada acontece
```

c) **`sendChatMessage` retorna false e nada é mostrado** (linha 651–663):
```js
await sendChatMessage({ ... });
// retorno ignorado — se o Firestore rejeitar, sem feedback
```

d) **`setAudioModeAsync({ allowsRecordingIOS: false })` não é chamado no catch** (linha 665 vs catch em 667):
Se uma exceção for lançada, o iOS fica travado no modo de gravação, impedindo reprodução de áudios recebidos na mesma sessão.

### H2 — Regra Firestore bloqueia criação da mensagem em chat novo (alta probabilidade)

Commit `628844c` introduziu regras reais no Firestore. A regra de `messages/{messageId}`:

```js
function isChatParticipant() {
  return isSignedIn() && chatExists()
    && (myEmail() == chatDoc().buyerId || myEmail() == chatDoc().sellerId);
}
allow create: if isChatParticipant() && myEmail() == request.resource.data.senderId;
```

Em `sendChatMessage`, para uma conversa nova o client faz:
1. `setDoc(chatRef, { buyerId, sellerId, ... })` — cria o doc de chat
2. Imediatamente: `addDoc(messagesRef(id), msgData)` — cria a mensagem

A regra da mensagem chama `chatExists()` + `get()` do doc de chat. Se houver qualquer latência ou inconsistência de replicação entre o `setDoc` e o processamento do `addDoc` no servidor, `chatExists()` pode retornar false, bloqueando a criação da mensagem com um `permission-denied`. O erro é capturado pelo `try/catch` de `sendChatMessage`, enviado ao Sentry e swallowed — o usuário não vê nada.

Isso explicaria por que o bug apareceu após o deploy de `628844c` e por que afeta especialmente o primeiro áudio de uma conversa nova.

### H3 — `fetch(localUri)` falha em builds de produção (média probabilidade)

`uploadChatAudio` usa `fetch(localUri)` para converter o URI local de gravação em blob antes do upload. Em builds standalone (App Store/Play Store), o comportamento de `fetch()` com URIs do tipo `file://` pode diferir do Expo Go. Se o fetch falhar, `uploadBytes` recebe um blob inválido ou vazio, o upload falha, e `{ error: true }` é retornado silenciosamente (H1b se aplica).

---

## O que está fora de escopo

- Redesenho da UX de gravação (gestos, preview de áudio antes do envio, waveform animado)
- Suporte a outros formatos de áudio além de m4a
- Migração da gravação para outro SDK (expo-audio em substituição ao expo-av)
- Modificação do schema de dados no Firestore
- Qualquer leitura ou escrita em dados de produção durante o desenvolvimento/testes
- Correção de outros bugs do chat não relacionados ao fluxo de envio de áudio

---

## Requisitos da correção

### Funcional (obrigatório)

1. Áudio gravado no chat é enviado com sucesso — aparece como mensagem de áudio para o destinatário
2. Quando qualquer etapa falha (upload, Firestore, guard de IDs), o usuário vê um Toast de erro claro: "Não foi possível enviar o áudio"
3. O modo de áudio do iOS (`allowsRecordingIOS`) é sempre redefinido para `false` ao fim do fluxo, seja em sucesso ou erro

### Não-funcional (obrigatório)

4. Testes cobrindo o caminho de envio de áudio (TDD — suíte em `functions/` ou mock unitário do controller):
   - Envio com sucesso em chat existente
   - Envio com sucesso em chat novo (primeiro áudio → cria chat + mensagem)
   - Guard de IDs nulo → erro exibido, áudio não enviado (sem crash)
   - Falha no upload → erro exibido ao usuário
5. Não tocar em dados reais do Firestore de produção durante desenvolvimento ou testes

---

## Critérios de aceite

- [ ] Gravar e enviar áudio em um chat existente → mensagem aparece para ambos os lados
- [ ] Gravar e enviar o primeiro áudio de uma conversa nova → chat e mensagem criados corretamente
- [ ] Simular falha no upload → Toast "Não foi possível enviar o áudio" exibido
- [ ] Verificar no Sentry que as exceções de falha de áudio estão sendo capturadas com contexto útil
- [ ] `setAudioModeAsync({ allowsRecordingIOS: false })` chamado em todos os caminhos (sucesso e erro)

---

## Perguntas em aberto (não bloqueantes — dev decide com critério conservador)

1. **H2 confirmada ou descartada?** — Verificar logs do Sentry/Firebase Console pra ver se há `permission-denied` em `messages` após `628844c`. Se confirmado, a correção é usar uma Cloud Function para criar a mensagem (em vez de client-side) ou usar um batch write que garanta atomicidade.

2. **H3 confirmada ou descartada?** — Verificar se `fetch(localUri)` em builds de produção iOS e Android retorna o blob correto. Se não, a correção é usar `expo-file-system` (`FileSystem.readAsStringAsync` com `FileSystem.EncodingType.Base64`) para converter o arquivo antes do upload.

---

## Para a fase de desenvolvimento

Prioridade de investigação:
1. Verificar logs do Sentry para `permission-denied` em `chats/*/messages` no período pós-`628844c` — confirma ou descarta H2
2. Se H2 confirmada: corrigir a criação de mensagem para garantir que o chat doc existe antes da avaliação da regra (batch write ou solução equivalente)
3. Independente de H2: adicionar Toast de erro em todos os pontos de falha silenciosa de `stopAndSendRecording` (H1 — deve ser feito de qualquer forma)
4. Garantir `setAudioModeAsync({ allowsRecordingIOS: false })` no catch
5. Escrever testes antes da correção (TDD) — a suíte em `functions/` roda com `npm test`
