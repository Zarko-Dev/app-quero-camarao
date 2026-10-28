# Spec: Fechar chats ao vender todos os viveiros (Fluxo 2)

**Data:** 2026-08-22  
**Solicitante:** Pedro Roger  
**Status:** Aprovado para implementação

---

## Contexto

O app Quero Camarão tem dois fluxos para registrar a venda de camarão:

- **Fluxo 1** (já funciona): menu "Marcar como vendido" dentro do próprio chat (`PublicationChat`). Chama `markPublicationSold()` + `closeChatsForPublication()` → chats migram para aba "Encerradas" e ficam bloqueados para escrita.
- **Fluxo 2** (faltando): tela "Minhas Publicações" → "Informar Venda do Camarão" → `SaleShrimps`. Registra a venda item a item mas nunca fecha os chats, mesmo quando todos os viveiros são vendidos.

O resultado prático: um produtor que usa o Fluxo 2 (o caminho mais comum) deixa chats abertos indefinidamente após vender toda a produção.

---

## Problema

`handleSaveShirimpSale` em `src/pages/SaleShrimps/index.jsx` (~linha 164-227) não chama `markPublicationSold` nem `closeChatsForPublication` em nenhum cenário — nem venda total, nem parcial.

A condição de "todos os viveiros vendidos" já existe no código (`handleSaleShrimp`, ~linha 286-290) e dispara um `DialogComponent` de confirmação, mas o callback `actionButton={handleSaveShirimpSale}` passado ao dialog não executa o fechamento de chats.

---

## Objetivo

Quando todos os viveiros de uma publicação forem vendidos via Fluxo 2, fechar automaticamente todos os chats daquela publicação — comportamento idêntico ao Fluxo 2.

---

## Escopo

**Entra:**
- Chamar `markPublicationSold(publicationId)` e `closeChatsForPublication(publicationId)` dentro de `handleSaveShirimpSale`, após `updatePublicationWithShirimpSalle` retornar sucesso, **quando todos os viveiros estiverem vendidos**.
- Calcular a condição "todos vendidos" usando os dados já presentes em `handleSaveShirimpSale`: comparar `shirimpsUpdated.filter(s => s.sale).length` contra `shirimpsUpdated.length` (mais simples e mais confiável do que passar a condição como parâmetro).
- Importar `markPublicationSold` e `closeChatsForPublication` de `src/controllers/Chat/sold.js`.
- Testes Node `--test`: dois casos — venda total (chats fechados) e venda parcial (chats não fechados).

**Não entra:**
- Alterar Fluxo 1 (`PublicationChat`) — está funcionando, não tocar.
- Alterar `handleUpdateShirimpSale` (edição de venda já existente) — escopo não foi solicitado.
- Exibir UX adicional no momento do fechamento além do que já existe (toast de sucesso + dialog já existente).
- Qualquer acesso a dados reais do Firestore em testes.

---

## Fluxo após a mudança

1. Produtor acessa "Minhas Publicações" → "Informar Venda do Camarão".
2. Preenche gramatura e preço de todos (ou alguns) viveiros.
3. Toca "Informar Venda do Camarão".
4. Se todos os viveiros ficam vendidos → `DialogComponent` aparece pedindo confirmação.
5. Produtor confirma → `handleSaveShirimpSale` executa:
   a. `saveShirimpSale` → salva registro de venda.
   b. `updatePublicationWithShirimpSalle` → marca `sale:true` nos itens.
   c. **[NOVO]** Detecta que todos os viveiros têm `sale:true` → chama `markPublicationSold` + `closeChatsForPublication`.
   d. Toast de sucesso → `navigation.goBack()`.
6. Chats da publicação aparecem na aba "Encerradas" e ficam bloqueados para escrita.

Se a venda for parcial (passo 3), o dialog não aparece e `handleSaveShirimpSale` executa sem fechar chats — comportamento atual mantido.

---

## Casos de borda

| Caso | Comportamento esperado |
|---|---|
| `markPublicationSold` chamada duas vezes para o mesmo ID (Fluxo 1 + Fluxo 2) | `updateDoc` com `sold:true` é idempotente — sem efeito colateral |
| `closeChatsForPublication` chamada duas vezes | `batch.set(..., {merge:true})` com `status:'closed'` é idempotente — chats já fechados permanecem fechados |
| `markPublicationSold` ou `closeChatsForPublication` retornam erro | Registrar no Sentry (já feito internamente nas funções). Não bloquear o toast de sucesso da venda — a venda em si já foi salva com sucesso. Decisão conservadora: não reverter a venda por falha no fechamento do chat. |
| Publicação sem chats | `closeChatsForPublication` retorna `0` (nenhum doc atualizado) — sem erro |

---

## Critérios de aceite

- [ ] Após registrar venda de TODOS os viveiros via Fluxo 2, os chats da publicação aparecem na aba "Encerradas" em `MyChats`.
- [ ] Após venda PARCIAL via Fluxo 2, os chats permanecem na aba ativa.
- [ ] Fluxo 1 (PublicationChat "Marcar como vendido") continua funcionando sem regressão.
- [ ] Testes `node --test` cobrem: (a) venda total → `closeChatsForPublication` chamada; (b) venda parcial → não chamada.

---

## Arquivos relevantes

| Arquivo | Papel |
|---|---|
| `src/pages/SaleShrimps/index.jsx` | **Alvo principal** — `handleSaveShirimpSale` recebe a mudança |
| `src/controllers/Chat/sold.js` | Fonte das funções a importar (`markPublicationSold`, `closeChatsForPublication`) |
| `src/controllers/ShirimpSale/sale.js` | `saveShirimpSale` — não muda |
| `src/controllers/Publication/updatePublication.js` | `updatePublicationWithShirimpSalle` — não muda |
| `src/pages/MyChats/index.jsx` | Filtra `status==='closed'` para aba Encerradas — não muda |
| `tests/` | Novo arquivo de teste a criar |
