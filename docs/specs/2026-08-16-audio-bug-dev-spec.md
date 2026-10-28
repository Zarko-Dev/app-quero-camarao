# Dev Spec — Chat Audio Bug Fix

**Data:** 2026-08-16  
**Urgência:** Alta — produção (App Store / Play Store)  
**PRD:** `docs/specs/audio-bug-prd.md`  
**Responsável:** dev-frontend-mobile  
**Abordagem:** TDD — escrever o teste antes de cada correção  

---

## Resumo executivo

Áudios no chat não chegam ao destinatário. O bug tem dois vetores confirmados (sem precisar de Sentry):

1. **H1 — Falhas silenciosas em `stopAndSendRecording`**: múltiplos pontos de falha sem feedback ao usuário (Toast/Alert). O spinner some e o áudio é descartado.
2. **H2 — Race condition na criação de mensagem em chat novo**: `sendChatMessage` faz `setDoc(chatRef)` + `addDoc(messagesRef)` em sequência rápida. A regra Firestore de `messages` chama `chatExists()` via `get()` — se a replicação do chat doc ainda não propagou no servidor quando a mensagem chega, a regra nega com `permission-denied`, capturado silenciosamente pelo catch.

H3 (fetch de URI local em produção) é menos provável mas não descartada — dev deve validar durante a correção de H1.

---

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/pages/PublicationChat/index.jsx` | Adicionar Toast de erro em todos os pontos de falha de `stopAndSendRecording`; mover `setAudioModeAsync({ allowsRecordingIOS: false })` para finally/catch; Toast em `startRecording` quando permissão negada |
| `src/controllers/Chat/uploadAudio.js` | Nenhuma mudança de lógica, apenas garantir que o caller recebe contexto suficiente para exibir erro (já retorna `{ error: true }`) |
| `src/controllers/Chat/index.js` | Investigar se `sendChatMessage` retorna `false` em `permission-denied` de mensagens em chat novo — se H2 confirmada, usar batch write (`writeBatch`) para garantir atomicidade de chat + mensagem no mesmo commit |
| `functions/src/chatNotifications.test.js` | Adicionar testes de `sendChatMessage` para o caso de chat novo (se a correção de H2 tocar em lógica no servidor) |

---

## Critérios de aceite verificáveis

### CA-1: Envio com sucesso — chat existente
**Cenário:** Usuário grava e envia áudio em conversa já iniciada (chat doc já existe no Firestore).  
**Verificação:** Mensagem com `audioUrl` aparece na subcoleção `messages` do chat; destinatário vê o player de áudio na tela.  
**Teste:** mock de `uploadBytes` retornando URL + mock de `addDoc` bem-sucedido → `sendChatMessage` retorna `true`.

### CA-2: Envio com sucesso — primeiro áudio de conversa nova
**Cenário:** Comprador abre chat de um anúncio pela primeira vez e grava áudio como primeira mensagem (sem texto anterior).  
**Verificação:** `setDoc(chatRef)` cria o documento de chat; `addDoc(messagesRef)` cria a mensagem; mensagem aparece para ambos os lados.  
**Teste:** mock de `getDoc` retornando `snap.exists() = false` → verifica que `setDoc` é chamado antes de `addDoc`; a mensagem com `audioUrl` é gravada.

### CA-3: Falha no upload → Toast de erro
**Cenário:** `uploadChatAudio` retorna `{ error: true, url: null }` (Storage fora, auth expirado, etc.).  
**Verificação:** Toast "Não foi possível enviar o áudio" é exibido; `sendChatMessage` não é chamado; `isUploading` volta para `false`.  
**Teste:** unitário no handler — não há teste de UI React Native, mas a lógica pode ser extraída para função pura.

### CA-4: Guard de IDs nulo → Toast de erro (sem crash)
**Cenário:** `resolvedChatId` é null no momento do envio (race condition de carregamento do `myId`).  
**Verificação:** Toast "Não foi possível enviar o áudio" é exibido; nenhum crash; `recordingState` retorna para `"idle"`.  
**Teste:** chamar `stopAndSendRecording` com `resolvedChatId = null` → deve disparar toast e não lançar exceção.

### CA-5: iOS audio mode sempre resetado
**Cenário:** Upload falha com exceção.  
**Verificação:** `Audio.setAudioModeAsync({ allowsRecordingIOS: false })` é chamado mesmo no caminho de erro; reprodução de áudios recebidos funciona normalmente na mesma sessão.  
**Teste:** não automatizável (requer dispositivo físico iOS); verificar manualmente: gravar, forçar falha de rede, tentar reproduzir áudio recebido — deve funcionar.

### CA-6: Permissão de microfone negada → feedback ao usuário
**Cenário:** Usuário nega permissão de microfone no modal do sistema.  
**Verificação:** Alert ou Toast informando que é necessário habilitar o microfone nas configurações; `recordingState` permanece `"idle"`.

---

## Plano de implementação (TDD — test-first)

### Passo 1 — Escrever teste para H2 (batch write)

Localização: `functions/src/chatNotifications.test.js` não cobre `sendChatMessage`. Criar **`src/controllers/Chat/__tests__/sendChatMessage.test.cjs`** ou equivalente compatível com o runner `node --test`.

> **Atenção:** A suíte de testes em `functions/` usa Node built-in test runner (`.test.js` com `describe`/`test`). Os testes de controller de client-side devem usar o mesmo runner mas ficam em `functions/src/` ou em um diretório `__tests__` no projeto principal. Verificar onde o `package.json` do projeto raiz (não functions/) define o script de test — se não existir, usar `functions/` como host do teste de lógica pura, mockando o Firestore SDK.

Teste mínimo:

```js
// Pseudocódigo — adaptar para o format do runner existente
test("chat novo: setDoc chamado antes de addDoc", async () => {
  const calls = [];
  const mockSetDoc = async () => calls.push("setDoc");
  const mockAddDoc = async () => calls.push("addDoc");
  const mockGetDoc = async () => ({ exists: () => false });
  // injetar mocks em sendChatMessage
  await sendChatMessage({ publicationId: "p1", buyerId: "b@b.com", sellerId: "s@s.com", senderId: "b@b.com", audioUrl: "https://...", ... });
  expect(calls[0]).toBe("setDoc");
  expect(calls[1]).toBe("addDoc");
});
```

### Passo 2 — Corrigir H2 em `sendChatMessage`

Opção A (mais simples, sem refatorar para Cloud Function): usar `writeBatch` para garantir que chat + mensagem chegam ao servidor atomicamente. Firestore garante atomicidade — a regra de `messages` não pode ser avaliada antes do chat doc existir se estão no mesmo batch.

```js
// Trecho atual (linhas 101–148 de src/controllers/Chat/index.js)
if (!snap.exists()) {
    await setDoc(chatRef, { ... });
} else { ... }
await addDoc(messagesRef(id), msgData);

// Correção com batch (apenas para o caso de chat novo):
if (!snap.exists()) {
    const batch = writeBatch(firestore);
    batch.set(chatRef, { ... });
    // addDoc gera ID automático; com batch, usar doc(messagesRef(id)) com ID manual
    const newMsgRef = doc(messagesRef(id));
    batch.set(newMsgRef, msgData);
    await batch.commit();
} else {
    await updateDoc(chatRef, { ... });
    await addDoc(messagesRef(id), msgData);
}
```

> **Risco:** `addDoc` gera ID aleatório automaticamente; `batch.set` exige ref explícita. Usar `doc(collection(firestore, models.chats, id, "messages"))` para gerar o ref com ID aleatório antes do commit.

Opção B (mais segura a longo prazo): mover criação de mensagem para Cloud Function. Fora do escopo desta correção emergencial.

**Usar Opção A para esta correção.**

### Passo 3 — Corrigir H1: feedback em `stopAndSendRecording`

Após o teste da lógica existir (mesmo que seja um teste de comportamento esperado), modificar `stopAndSendRecording` em `PublicationChat/index.jsx`:

```js
// Trecho a corrigir (linha 643 em diante)
if (!uri || !myId || !buyerId || !resolvedChatId) {
    Toast.show({ type: "error", text1: "Não foi possível enviar o áudio" });  // ADICIONAR
    return;
}
try {
    setIsUploading(true);
    setUploadingLabel("Enviando áudio...");
    const { error, url } = await uploadChatAudio(resolvedChatId, uri);
    if (error || !url) {
        Toast.show({ type: "error", text1: "Não foi possível enviar o áudio" });  // ADICIONAR
        return;  // ADICIONAR (sair antes do setAudioModeAsync para o finally cuidar)
    }
    const ok = await sendChatMessage({ ... });
    if (!ok) {
        Toast.show({ type: "error", text1: "Não foi possível enviar o áudio" });  // ADICIONAR
    }
} catch (e) {
    Sentry.captureException(e);
    Toast.show({ type: "error", text1: "Não foi possível enviar o áudio" });  // ADICIONAR
} finally {
    setIsUploading(false);
    setUploadingLabel("");
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});  // MOVER PARA FINALLY
}
```

### Passo 4 — Feedback de permissão negada em `startRecording`

```js
// Linha 599 — trocar o return silencioso
const { granted } = await Audio.requestPermissionsAsync();
if (!granted) {
    Toast.show({
        type: "info",
        text1: "Permissão de microfone necessária",
        text2: "Habilite nas configurações do dispositivo",
    });
    return;
}
```

### Passo 5 — Verificar H3 (fetch de URI local em builds de produção)

Durante o teste manual de CA-1 e CA-2 com build de produção (não Expo Go), verificar se `fetch(localUri)` gera erro no Sentry. Se sim:

```js
// Substituir em uploadChatAudio:
import * as FileSystem from "expo-file-system";

const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
});
const blob = await fetch(`data:audio/m4a;base64,${base64}`).then(r => r.blob());
```

> **Só aplicar se H3 for confirmada nos logs** — não mudar o que está funcionando sem evidência.

---

## Ordem de entrega

1. Testes escritos (Passos 1) — commit separado: `test: add sendChatMessage audio tests`
2. Correção de H2 (Passo 2) — commit: `fix: use batch write for new chat + first message to prevent permission-denied race`
3. Correções de H1 + feedback de permissão (Passos 3–4) — commit: `fix: add error feedback for audio send failures and permission denial`
4. Se H3 confirmada (Passo 5) — commit separado: `fix: use expo-file-system for audio blob in production builds`

---

## Riscos e pontos de atenção

| Risco | Impacto | Mitigação |
|---|---|---|
| `writeBatch` com `doc()` gerado manualmente para a mensagem não funciona como `addDoc` esperado | Médio | Testar CA-1 e CA-2 em emulador antes de deploy |
| `finally` + `setAudioModeAsync` em Android não tem efeito (API ignorada no Android) | Baixo | Não é bloqueante; Android não tem esse problema |
| H3 não confirmada mas a mudança para `expo-file-system` quebra algo | Médio | Só aplicar se H3 for confirmada nos logs do Sentry |
| Teste de `sendChatMessage` é difícil de escrever sem inversão de dependência (módulo usa imports estáticos) | Médio | Usar `jest.mock` ou o padrão de factory do codebase existente (ver `chatNotifications.test.js` que mocka o `db` via parâmetro) — extrair `sendChatMessage` para receber `db` opcionalmente, como `countUnreadChats` já faz |

---

## Não fazer nesta entrega

- Migrar gravação para `expo-audio` (substituto de `expo-av`)
- Implementar preview de áudio antes do envio
- Modificar o schema de dados do Firestore
- Tocar em dados de produção ou rodar seeds
- Mudar regras de Storage ou Firestore além do estritamente necessário

---

## Definition of done

- [ ] Todos os CAs de CA-1 a CA-4 verificados em emulador iOS e Android
- [ ] CA-5 verificado em dispositivo físico iOS (modo de áudio resetado após falha)
- [ ] CA-6 verificado em dispositivo ou emulador com permissão negada
- [ ] `npm test` em `functions/` passa (sem regressões nos testes existentes)
- [ ] Nenhuma exceção nova não-tratada no Sentry após o deploy
