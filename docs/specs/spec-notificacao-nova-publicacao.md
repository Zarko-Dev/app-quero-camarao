# Spec — Correção de Notificações de Nova Publicação

**Data:** 2026-08-22 (atualizado 2026-08-24)
**Projeto:** Quero Camarão
**Status:** Implementação parcial no working tree (incluída no build 2.0.5) — itens pendentes para o próximo build listados abaixo.

---

## Contexto

Ao publicar um anúncio de camarão, o app dispara a notificação push "Novo camarão publicado" para todos os usuários (exceto o publicador). Dois problemas foram reportados por Pedro:
1. As notificações chegam sempre em pares idênticos no mesmo segundo.
2. O corpo da notificação mostra texto genérico em vez de dados reais (peso, gramatura, cidade).

---

## Problema 1 — Duplicação de notificações

### Causa raiz confirmada

`sendNotificationNewPublication` é chamada via `saveShrimpPonds`. Há dois pontos no fluxo que chamam `saveShrimpPonds` para o mesmo pedido:

**Ponto A — PaymentButton** (`src/pages/Payment/components/PaymentButton/index.jsx`)
- Rota: `publicationPondsShrimp()` → `saveShrimpPonds(dataValidOrder.dataPublication, userId)`
- Condição: `dataPayment.resumeConfig.total === 0` (pagamento gratuito / cupom 100%)
- Detalhe: antes de chamar `publicationPondsShrimp()`, despacha `SAVE_ORDER_ACTION` com `dataValidOrder`, populando `dataOrder` no Redux. Se PaymentEnd for atingida depois (deep link duplicado, back navigation), a condição do Ponto B pode ser verdadeira para o mesmo pedido.

**Ponto B — PaymentEnd** (`src/pages/PaymentEnd/index.jsx`)
- Rota: `actions()` → `saveShrimpPonds(dataOrder.dataPublication, userId)`
- Condição: `params.status === "approved"` E `dataOrder.idOrder` presente no Redux
- Já tem guard `hasPublished.current` (React ref) para evitar duplo disparo intra-sessão nesta tela.

### Estado atual no working tree

`sendNotificationNewPublication.js` tem um guard in-memory via Set module-level:
```js
const sentPublicationNotifications = new Set();
// ...
if (!publicationId || sentPublicationNotifications.has(publicationId)) return;
sentPublicationNotifications.add(publicationId);
```

**Limitação**: o Set é resetado quando o app reinicia. Se o usuário fechar e reabrir o app entre os dois disparos, a deduplicação não funciona.

### Solução recomendada para o próximo build

Adicionar guard de idempotência no Firestore, dentro de `saveShrimpPonds` (nível do controller, não da UI). Isso protege contra todos os cenários, incluindo reinício do app:

```js
// src/controllers/Publication/saveShrimpPonds.js
import { doc, getDoc, setDoc } from "firebase/firestore";

export const saveShrimpPonds = async (dataPonds, userId) => {
    try {
        const shrimpPondsDoc = doc(firestore, models.shrimpPonds, dataPonds.id);

        // Idempotência persistente: se o doc já existe, a publicação já foi feita.
        // Não reescreve, não reenvia notificação.
        const existing = await getDoc(shrimpPondsDoc);
        if (existing.exists()) return true;

        // ... resto: setDoc + sendNotificationNewPublication
    }
}
```

**Por que este caminho:**
- O id da publicação (`dataPonds.id`) é gerado com `uuid v4` uma única vez antes do primeiro `setDoc` — é estável como chave de idempotência.
- Guard no controller cobre qualquer chamador (PaymentButton, PaymentEnd, futuros pontos).
- O Set in-memory existente pode ser mantido como segunda camada intra-sessão.

### Teste pendente

Adicionar teste em `tests/sendNotificationNewPublication.test.cjs` (arquivo ainda não existe):
- Cenário 1: mesmo `publicationId` chamado duas vezes no Set guard → `SendNotifications` chamado só 1x
- Cenário 2: `publicationId` ausente → retorna sem enviar

### Critérios de aceite

- Ao publicar com cupom 100%, notificação chega UMA única vez, mesmo com duplo redirect ou reinício do app.
- Ao publicar com pagamento pago (PaymentEnd), notificação chega UMA única vez.
- Nenhum anúncio fica sem notificação em nenhum dos dois fluxos.

---

## Problema 2 — Corpo da notificação

### Formato exigido por Pedro

```
{totalKg}kg de camarão de {gramatura}g em {cidade/estado} acaba de ser publicado
```

### Estado atual no working tree (implementado)

Utilitário `src/utils/buildNotificationBody.js` já implementado com 14 testes passando em `tests/buildNotificationBody.test.cjs`.

**Decisão de aggregação para múltiplos viveiros:** grammages distintas são listadas com ` e ` entre elas (natural em português). Exemplo: `200kg de camarão de 8g e 12g em Fortaleza/CE acaba de ser publicado`. Kg são somados.

`sendNotificationNewPublication.js` já chama `buildNotificationBody({ shrimps, location })`.

A estrutura `dataPonds` passada pelo `generateDataPublication()` em PaymentButton já inclui:
- `shrimps[]` com `grammage` e `kilo` por viveiro
- `location` no formato `${city}/${state}`

O mesmo vale para `dataOrder.dataPublication` em PaymentEnd — campo populado pelo mesmo `generateDataPublication()`.

**Status**: implementação completa. Testes passando. Pronto para o próximo build desde que o guard Firestore do Problema 1 seja adicionado.

### Critérios de aceite

- Notificação de publicação nova exibe peso total, gramatura(s) e cidade.
- Fallback "Um novo camarão 🦐 foi publicado, venha conferir!" aparece apenas quando shrimps ou location estão ausentes.
- Todos os testes em `buildNotificationBody.test.cjs` passam com `node --test`.

---

## Fora de escopo

- Mudança no schema do Firestore.
- Alteração do fluxo de pagamento além da guarda de idempotência em `saveShrimpPonds`.
- Correção de notificações já enviadas em duplicata.
- Mudança no título da notificação ("🎉 Novo camarão publicado!").

---

## Arquivos afetados — próximo build

| Arquivo | Mudança |
|---|---|
| `src/controllers/Publication/saveShrimpPonds.js` | Adicionar `getDoc` guard antes do `setDoc` |
| `tests/sendNotificationNewPublication.test.cjs` | Criar — cobertura do guard de dedup |

### Arquivos já prontos (incluídos no build 2.0.5)

| Arquivo | Status |
|---|---|
| `src/utils/buildNotificationBody.js` | Implementado |
| `tests/buildNotificationBody.test.cjs` | 14 testes passando |
| `src/controllers/Notifications/sendNotificationNewPublication.js` | Refatorado (Set guard + buildNotificationBody) |
