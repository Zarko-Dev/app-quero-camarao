# Spec — Modal "Informe o código do sorteio": visual + animação de confirmação

**Arquivo alvo:** `src/pages/DrawerPrizeLiveClient/index.jsx` e `styles.js`  
**Data:** 2026-08-22  
**Status:** pronto para implementação

---

## Contexto

A tela do cliente/participante (`DrawerPrizeLiveClient`) exibe uma modal que permite ao usuário informar o código de um sorteio ao vivo para participar. Pedro reportou dois problemas separados que entram juntos nesta spec.

---

## Problema 1 — Visual da modal colada nas bordas

### Causa raiz

`ModalContent` em `styles.js` (linhas 170–181) é um `SafeAreaView` com:
- `width: 100%` — ocupa toda a largura da tela
- `border-top-left-radius: 24px` / `border-top-right-radius: 24px` — arredondado só em cima
- Sem margem lateral

O `contentContainerStyle` da `<Modal>` em `index.jsx` (linhas 290–295) usa `justifyContent: 'flex-end'` e `alignItems: 'center'`, o que posiciona o conteúdo embaixo, mas como `ModalContent` é `width: 100%`, fica esticado de borda a borda.

### Requisito

A modal deve ter aspecto de **card flutuante** surgindo de baixo, com:
- Margem lateral visível nos dois lados (mínimo 16px de cada lado, recomendado `marginHorizontal: 16`)
- Cantos arredondados nos **4 lados** (`borderRadius: 24`) — não mais só no topo
- `alignSelf: center` e `width` calculado como `100% - margem lateral` (ou simplesmente usar `marginHorizontal`)
- O `ModalHandle` (barra cinza de drag) permanece — ainda faz sentido visualmente como indicador de dismissal por swipe, mesmo sendo card flutuante
- Maior padding interno para respiração do conteúdo (já existe `padding: 12px 20px 24px 20px` — pode aumentar ligeiramente se necessário no visual final)
- O `SafeAreaView` interno pode ser trocado por `View` comum já que não é mais colado nas bordas do device

### O que não muda

Todos os elementos internos permanecem: `ModalHandle`, `ModalIconBadge` (presente laranja), `TitleModal`, `SubTitleModal`, `Input`, botões `Cancelar` / `Participar deste sorteio`.

### Abordagem decidida

Bottom sheet flutuante com margens laterais (opção a do briefing). Manter o `ModalHandle` é consistente com a UX já estabelecida. Não redesenhar como modal central — evita mudança de paradigma de navegação no fluxo.

---

## Problema 2 — Sem animação de confirmação no sucesso

### Comportamento atual

`handleParticipateDrawPriseLive` (linhas 102–151) em caso de sucesso:
1. Exibe `Toast.show({ type: 'success', ... })`
2. Chama `handleGetInitialData()` para atualizar lista
3. Chama `setDialogInputVisible(false)` para fechar a modal
4. Chama `setItemValue("")` para limpar input

Não há nenhuma animação visual de confirmação.

### Requisito

Ao confirmar participação com sucesso, antes de fechar a modal, exibir **estado de sucesso animado dentro da modal**:

1. O `ModalIconBadge` (círculo com ícone de presente/gift) transiciona para um ícone de **check** com efeito de **scale bounce** (cresce levemente além de 1 e volta para 1)
2. A cor de fundo do badge muda de `theme.colors.secondary` (laranja) para verde (`#27ae60` ou similar ao verde já usado em `ContentTitleParticipating`)
3. O título e subtítulo mudam temporariamente para texto de confirmação (ex: `"Você está participando!"` / `"Boa sorte no sorteio!"`)
4. Após ~800ms neste estado de sucesso, a modal fecha normalmente
5. O Toast de sucesso existente permanece — é emitido junto ou logo após o fechamento

### Fora de escopo

- Casos de erro (código inválido, sorteio não encontrado, erro ao participar): sem animação, comportamento atual mantido
- Não adicionar nenhuma biblioteca nova (só `Animated` do React Native core e/ou `react-native-reanimated` já instalados)
- Não usar Lottie ou arquivo de animação externo

### Utilitário puro (se extraído)

Se a lógica de sequência de animação (timing, steps) for extraída como função pura — seguindo o padrão de `src/utils/drawAnimationSequence.js` — deve ter arquivo de teste `node --test` cobrindo:
- Sequência gerada tem os steps corretos na ordem correta
- Delays são valores numéricos positivos
- Ícone e cor de cada step correspondem ao esperado

Se a lógica ficar inline no componente (sem extração de utilitário), não é obrigatório criar teste separado.

### Estado de sucesso — especificação de animação

```
Trigger: resposta OK de setParticipantDrawPrizeLive
Passo 1 (0ms): trocar ícone gift → check-circle, trocar cor badge laranja → verde
Passo 2 (0ms): iniciar Animated.sequence([
  Animated.timing(scaleAnim, { toValue: 1.3, duration: 200 })  // bounce up
  Animated.timing(scaleAnim, { toValue: 1.0, duration: 150 })  // settle
])
Passo 3 (após settle): aguardar 450ms no estado de sucesso visível
Passo 4 (800ms total): fechar modal + emitir Toast
```

Duração total aproximada no estado de sucesso antes de fechar: **800ms**.

---

## Critérios de aceite

### Visual
- [ ] Modal exibe com margem lateral visível em iOS e Android
- [ ] Cantos arredondados nos 4 lados (não mais só no topo)
- [ ] Elementos internos não ficam colados nas bordas do card
- [ ] ModalHandle permanece visível

### Animação
- [ ] Em caso de sucesso, ícone muda de gift para check (cor verde) com scale bounce
- [ ] Modal fecha ~800ms após o sucesso antes de mostrar o Toast
- [ ] Em caso de erro, comportamento atual mantido sem animação
- [ ] Toast de sucesso continua aparecendo

### Testes
- [ ] Se utilitário de animação for extraído: teste `node --test` cobrindo os steps
- [ ] Se lógica ficar inline: nenhum teste adicional obrigatório

---

## Arquivos a tocar

| Arquivo | O que muda |
|---|---|
| `src/pages/DrawerPrizeLiveClient/styles.js` | `ModalContent`: remover `width: 100%`, adicionar `marginHorizontal`, `borderRadius` nos 4 lados, trocar `SafeAreaView` por `View`; adicionar `ModalIconBadgeSucess` ou prop de estado no badge |
| `src/pages/DrawerPrizeLiveClient/index.jsx` | Adicionar estado `participationSuccess`, `Animated.Value` para scale; lógica de animação em `handleParticipateDrawPriseLive`; renderização condicional do ícone/cor/texto no estado de sucesso |
| `src/utils/confirmationAnimationSequence.js` *(opcional)* | Se extraído: função pura de timing/steps da animação de confirmação |
| `src/utils/confirmationAnimationSequence.test.js` *(se criado o utilitário)* | Testes `node --test` |
