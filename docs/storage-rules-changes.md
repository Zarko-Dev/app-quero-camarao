# Storage Rules Changes — Task 26

## Resumo

Atualização das regras de Storage (`storage.rules`) para adicionar limites de tamanho e validação de `contentType` nos uploads, além de documentar a decisão de não validar participante em uploads de chat.

---

## Alterações em `storage.rules`

### 1. Limite de tamanho e contentType para `user/`, `Shrimp/`, `ads/`

- **Write rule** alterada de `request.auth != null` para `request.auth == null` (uploads públicos sem autenticação).
- **Tamanho máximo**: 5 MB (`request.resource.size < 5 * 1024 * 1024`).
- **Content-Type**: deve ser `image/*`. Usa fallback `contentType == null` para não quebrar uploads existentes que não enviam o campo `contentType`.

```
allow write: if request.auth == null && request.resource.size < 5 * 1024 * 1024 && (request.resource.contentType == null || request.resource.contentType.matches('image/.*'));
```

### 2. Limite de tamanho e contentType para `chats/{chatId}/{allPaths=**}`

- **Write rule** mantém `request.auth != null` (requer login).
- **Tamanho máximo**: 25 MB (`request.resource.size < 25 * 1024 * 1024`).
- **Content-Types permitidos**: `image/*`, `audio/*`, `video/*`, `application/pdf`.
- **Fallback null-safe**: `contentType == null` é aceito para não quebrar uploads existentes.

```
allow write: if request.auth != null && request.resource.size < 25 * 1024 * 1024 && (request.resource.contentType == null || request.resource.contentType.matches('image/.*') || request.resource.contentType.matches('audio/.*') || request.resource.contentType.matches('video/.*') || request.resource.contentType.matches('application/pdf'));
```

### 3. Leitura pública mantida

- `user/`, `Shrimp/`, `ads/`: `allow read: if true` (inalterado).
- `chats/{chatId}/{allPaths=**}`: `allow read: if request.auth != null` (inalterado).

---

## Decisões de Design

### Por que chats não validam participante no Storage rules?

O upload de um anexo de chat acontece **antes** do documento da mensagem existir no Firestore. A tela envia o arquivo primeiro para obter a URL de download, e só depois grava a mensagem. Se as regras do Storage tentassem verificar se o usuário é participante do chat via `firestore.get()`, o primeiro anexo de toda conversa nova seria rejeitado (o doc do chat ainda não existe).

A proteção real do conteúdo está nas regras do Firestore (mensagem/chat), e as URLs de download do Storage já carregam um token não adivinhável.

### Proposta futura (staging + Cloud Function)

Para permitir a validação de participante no Storage rules sem quebrar o upload do primeiro anexo, propõe-se:

1. **Caminho de staging**: uploads vão para `chats/{chatId}/staging/{fileName}` com regras mais permissivas.
2. **Cloud Function** (trigger no Firestore): quando a mensagem é gravada no Firestore, a Function move o arquivo de `staging/` para o caminho final `chats/{chatId}/{messageId}/{fileName}` e valida se o autor da mensagem é participante do chat.
3. **Storage rules** no caminho `staging/` permitem upload autenticado sem validação de participante; o caminho final exige participante.

Isso separa o upload (que precisa ser rápido e funcionar offline-first) da validação de permissão (que pode ser feita server-side).

### contentType null-safe

O campo `contentType` pode ser `null` em uploads existentes ou em clientes que não o enviam. Para evitar quebrar uploads atuais, as regras aceitam `request.resource.contentType == null` como caso válido. Isso é um trade-off: permite uploads sem tipo definido, mas não quebra a compatibilidade retroativa. Se no futuro for desejado endurecer, basta remover o fallback `== null` e documentar a quebra.